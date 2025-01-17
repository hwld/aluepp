import { useUserQuery } from "@/client/features/user/useUserQuery";
import { FavoritedUsers } from "@/client/pageComponents/FavoritedUsers/FavoritedUsers";
import { withReactQueryGetServerSideProps } from "@/server/lib/GetServerSidePropsWithReactQuery";
import { paginatedPageSchema } from "@/share/paging";
import { assertString } from "@/share/utils";
import { NextPage } from "next";
import { useRouter } from "next/router";
import NotFoundPage from "../../404";
import { PageLayout } from "@/client/ui/PageLayout";

export const getServerSideProps = withReactQueryGetServerSideProps(
  async ({ gsspContext: { query }, trpcStore }) => {
    const parsePageObjResult = paginatedPageSchema.safeParse(query);
    if (!parsePageObjResult.success) {
      console.trace("不正なクエリー");
      return { notFound: true };
    }
    const { page } = parsePageObjResult.data;

    const userId = assertString(query.userId);
    const user = await trpcStore.user.get.fetch({ userId });
    if (!user) {
      console.trace("指定されたユーザーが存在しない");
      return { notFound: true };
    }

    await Promise.all([
      trpcStore.user.getFavoritedUsers.prefetch({
        favoriteByUserId: userId,
        page,
      }),
      trpcStore.user.get.prefetch({ userId }),
    ]);
  }
);

const FavoritedUsersPage: NextPage = () => {
  const router = useRouter();
  const userId = assertString(router.query.userId);
  const { user, isLoading } = useUserQuery({ userId });

  if (isLoading) {
    return <></>;
  } else if (!user) {
    return <NotFoundPage />;
  }

  return <FavoritedUsers user={user} />;
};
export default FavoritedUsersPage;

FavoritedUsersPage.getLayout = (page, { isSideBarOpen }) => {
  return <PageLayout isSideBarOpen={isSideBarOpen}>{page}</PageLayout>;
};
