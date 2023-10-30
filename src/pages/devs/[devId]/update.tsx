import { useDevQuery } from "@/client/features/dev/useDevQuery";
import { useIdeaQuery } from "@/client/features/idea/useIdeaQuery";
import { DevEditPage } from "@/client/pageComponents/DevEditPage/DevEditPage";
import NotFoundPage from "@/pages/404";
import { withReactQueryGetServerSideProps } from "@/server/lib/GetServerSidePropsWithReactQuery";
import { Routes } from "@/share/routes";
import { assertString } from "@/share/utils";
import { TRPCError } from "@trpc/server";
import { NextPage } from "next";
import { useRouter } from "next/router";

export const getServerSideProps = withReactQueryGetServerSideProps(
  async ({ gsspContext: { query }, session, trpcStore }) => {
    if (!session) {
      return { redirect: { destination: Routes.home, permanent: false } };
    }

    const devId = assertString(query.devId);
    let ideaId: string | undefined;
    try {
      const dev = await trpcStore.dev.get.fetch({ devId });
      // 削除されてる可能性がある
      ideaId = dev?.idea?.id;
    } catch (e) {
      if (e instanceof TRPCError && e.code === "NOT_FOUND") {
        return { notFound: true };
      }
      throw e;
    }

    await Promise.all([
      trpcStore.dev.get.prefetch({ devId }),
      ideaId && trpcStore.idea.get.prefetch({ ideaId }),
      trpcStore.me.getMyGitHubRepositories.prefetch(),
    ]);
  }
);

const DevUpdate: NextPage = () => {
  const router = useRouter();
  const devId = assertString(router.query.devId);

  const { dev, isLoading: devLoading } = useDevQuery({ devId });
  const { idea, isFetching: ideaFetching } = useIdeaQuery({
    ideaId: dev?.idea?.id,
  });

  // 開発情報が読み込み中、または、お題情報がフェッチ中の場合はローディングを出す。
  // 開発情報にお題が含まれない可能性があるので、ideaはloadingではなくfetchingを使用する
  if (devLoading || ideaFetching) {
    return <></>;
  } else if (!dev) {
    return <NotFoundPage />;
  }

  return <DevEditPage idea={idea} dev={dev} />;
};
export default DevUpdate;