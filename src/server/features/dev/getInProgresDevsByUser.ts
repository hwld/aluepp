import { findManyDevs } from "@/server/finders/dev";
import { publicProcedure } from "@/server/lib/trpc";
import { z } from "zod";

// TODO: getDevsByUserに統一したい
export const getInProgresDevsByUser = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input: { userId }, ctx }) => {
    const devs = await findManyDevs({
      args: {
        where: (devs, { and, eq }) => {
          return and(eq(devs.userId, userId), eq(devs.status, "IN_PROGRESS"));
        },
      },
      loggedInUserId: ctx.session?.user.id,
    });

    return devs;
  });
