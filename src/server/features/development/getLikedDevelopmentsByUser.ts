import { paginate } from "@/server/lib/paginate";
import { db } from "@/server/lib/prismadb";
import { publicProcedure } from "@/server/lib/trpc";
import { findManyDevelopments } from "@/server/models/development";
import { pageLimit } from "@/share/consts";
import { pagingSchema } from "@/share/schema/util";
import { sortedInSameOrder } from "@/share/utils";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const getLikedDevelopmentsByUser = publicProcedure
  .input(z.object({ userId: z.string(), page: pagingSchema }))
  .query(async ({ input, input: { page }, ctx }) => {
    // 指定されたユーザーがいいねした開発情報のidを取得する
    const [likedDevelopmentIdsObj, { allPages }] = await paginate({
      finder: db.developmentLike.findMany,
      finderInput: {
        select: { developmentId: true },
        where: { userId: input.userId },
      } satisfies Prisma.DevelopmentLikeFindManyArgs,
      counter: ({ select, ...args }) => db.developmentLike.count(args),
      pagingData: { page, limit: pageLimit.likedDevelopments },
    });
    const likedDevelopmentIds = likedDevelopmentIdsObj.map(
      (d) => d.developmentId
    );

    // いいねした開発情報を取得
    const likedDevelopments = await findManyDevelopments({
      loggedInUserId: ctx.session?.user.id,
      where: { id: { in: likedDevelopmentIds } },
    });

    const sortedLikedDevelopments = sortedInSameOrder({
      target: likedDevelopments,
      base: likedDevelopmentIds,
      getKey: (t) => t.id,
    });

    return { list: sortedLikedDevelopments, allPages };
  });
