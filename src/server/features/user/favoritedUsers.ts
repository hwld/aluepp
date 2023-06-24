import { paginate } from "@/server/lib/paginate";
import { db } from "@/server/lib/prismadb";
import { publicProcedure } from "@/server/lib/trpc";
import { findManyUsers } from "@/server/models/user";
import { pageLimit } from "@/share/consts";
import { pagingSchema } from "@/share/schema/util";
import { z } from "zod";

export const getFavoritedUsers = publicProcedure
  .input(z.object({ favoriteByUserId: z.string(), page: pagingSchema }))
  .query(async ({ input, input: { page } }) => {
    const favoritedUserObj = await db.favoriteUser.findMany({
      select: { favoritedUserId: true },
      where: {
        favoriteByUserId: input.favoriteByUserId,
      },
    });

    const favoritedUserIds = favoritedUserObj.map(
      (favorite) => favorite.favoritedUserId
    );

    const [favoritedUsers, { allPages }] = await paginate({
      finderInput: { where: { id: { in: favoritedUserIds } } },
      finder: findManyUsers,
      counter: db.user.count,
      pagingData: { page, limit: pageLimit.favoritedUsers },
    });

    return { list: favoritedUsers, allPages };
  });
