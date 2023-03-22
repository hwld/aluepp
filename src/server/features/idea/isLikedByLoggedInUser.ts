import { z } from "zod";
import { db } from "../../lib/prismadb";
import { publicProcedure } from "../../lib/trpc";

export const isLikedByLoggedInUser = publicProcedure
  .input(z.object({ ideaId: z.string().min(1) }))
  .query(async ({ input, ctx }): Promise<boolean> => {
    const loggedInUser = ctx.session?.user;
    if (!loggedInUser) {
      return false;
    }

    const like = await db.ideaLike.findUnique({
      where: {
        userId_ideaId: {
          ideaId: input.ideaId,
          userId: loggedInUser.id,
        },
      },
    });

    return Boolean(like);
  });