import { NextPage } from "next";
import { useRouter } from "next/router";
import { UserJoinedThemesPage } from "../../../client/components/UserDetail/UserJoinedThemesPage";
import { favoriteAnotherSumQueryKey } from "../../../client/hooks/useFavoriteAnother";
import { favoriteUserQueryKey } from "../../../client/hooks/useFavoriteUser";
import { joinedThemesQueryKey } from "../../../client/hooks/useJoinedThemesQuery";
import { sumThemeLikesQueryKey } from "../../../client/hooks/useSumThemeLikesQuery";
import { themeDeveloperLikesQueryKey } from "../../../client/hooks/useThemeDeveloperLikesQuery";
import { userQueryKey, useUserQuery } from "../../../client/hooks/useUserQuery";
import { withReactQueryGetServerSideProps } from "../../../server/lib/GetServerSidePropsWithReactQuery";
import { appRouter } from "../../../server/routers";

export const getServerSideProps = withReactQueryGetServerSideProps(
  async ({ params: { query }, queryClient, session, callerContext }) => {
    const caller = appRouter.createCaller(callerContext);
    const { page } = query;

    const { id: userId } = query;

    if (typeof userId !== "string") {
      return { notFound: true };
    }
    if (typeof page === "object") {
      throw new Error();
    }

    const user = await caller.user.get({ userId });
    if (!user) {
      return { notFound: true };
    }

    await queryClient.prefetchQuery(userQueryKey(userId), () => user);

    await queryClient.prefetchQuery(
      joinedThemesQueryKey(userId, Number(page)),
      () => caller.theme.getJoinedThemesByUser({ userId, page })
    );

    await queryClient.prefetchQuery(sumThemeLikesQueryKey(userId), () =>
      caller.theme.getLikeCountByUser({ userId })
    );

    await queryClient.prefetchQuery(themeDeveloperLikesQueryKey(userId), () =>
      caller.developer.getLikeCountByUser({ userId })
    );

    //お気に入りのちらつきを無くす
    if (!session) {
      return;
    }
    const favoriteUserId = session.user.id;

    await queryClient.prefetchQuery(favoriteAnotherSumQueryKey(userId), () =>
      caller.user.favoritedAnotherSum({ userId })
    );

    await queryClient.prefetchQuery(
      favoriteUserQueryKey(userId, favoriteUserId),
      () => caller.user.favorited({ userId, favoriteUserId })
    );
  }
);

/**
 *  ユーザーの詳細ページ
 *  ユーザーが参加したお題一覧を表示する
 */
const UserDetail: NextPage = () => {
  const router = useRouter();
  const userId = router.query.id as string;
  const { user } = useUserQuery(userId);

  if (!user) {
    return null;
  } else {
    return <UserJoinedThemesPage user={user} />;
  }
};
export default UserDetail;
