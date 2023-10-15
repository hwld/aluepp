import { UserAndDevLikes } from "@/server/finders/user";
import { db } from "@/server/lib/prismadb";
import { publicProcedure } from "@/server/lib/trpc";
import { sortedInSameOrder } from "@/share/utils";

export const getTop10LikesDevsInThisMonth = publicProcedure.query(async () => {
  const devUsers: UserAndDevLikes[] = await db.$transaction(async (tx) => {
    // ユーザーidのリストを取得する
    type RawDevUser = { userId: string; likeCount: BigInt }[];
    const rawDevUser = await tx.$queryRaw<RawDevUser>`
      SELECT
        users.id as "userId"
        , COUNT(development_likes.id) as "likeCount"
        , MIN(developments."createdAt") as "firstDevelopDatetime"
      FROM
        development_likes
        LEFT JOIN developments
          ON (development_likes."developmentId" = developments.id)
        LEFT JOIN users
          ON (developments."userId" = users.id)
      WHERE
        development_likes."createdAt" > (NOW() - INTERVAL '1 MONTH')
      GROUP BY
        users.id
      ORDER BY
        "likeCount" DESC
        , "firstDevelopDatetime" ASC
      LIMIT
        10
    `;
    const devUserIds = rawDevUser.map(({ userId }) => userId);

    // ユーザーを取得する
    const users = await tx.user.findMany({
      where: { id: { in: devUserIds } },
    });

    const sortedUsers = sortedInSameOrder({
      target: users,
      base: devUserIds,
      getKey: (t) => t.id,
    });

    // sortedUsersにlikeCountをつける
    const usersAndDevLikes = sortedUsers.map(
      (user, i): UserAndDevLikes => ({
        ...user,
        devLikes: Number(rawDevUser[i]?.likeCount) ?? 0,
      })
    );

    return usersAndDevLikes;
  });

  return devUsers;
});
