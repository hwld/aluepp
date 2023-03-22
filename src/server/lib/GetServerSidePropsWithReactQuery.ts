import { dehydrate, QueryClient } from "@tanstack/react-query";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { getServerSession, Session } from "next-auth";
import superjson from "superjson";
import { sessionQuerykey } from "../../client/features/session/useSessionQuery";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import { TRPCContext } from "./trpc";

export type PageProps = { stringifiedDehydratedState?: string };

type Callback = (params: {
  params: GetServerSidePropsContext;
  queryClient: QueryClient;
  session: Session | null;
  callerContext: TRPCContext;
}) => Promise<GetServerSidePropsResult<PageProps> | void>;

export const withReactQueryGetServerSideProps = (
  callback: Callback
): GetServerSideProps<PageProps> => {
  return async (params) => {
    const queryClient = new QueryClient();
    const session = await getServerSession(params.req, params.res, authOptions);

    // セッション情報をプリフェッチする
    queryClient.setQueryData(sessionQuerykey, session);

    const result = await callback({
      params,
      queryClient,
      session,
      callerContext: { session, req: params.req },
    });

    // callbackが戻り値を持っていればそれをそのまま返す
    if (result) {
      return result;
    }

    return {
      props: {
        stringifiedDehydratedState: superjson.stringify(dehydrate(queryClient)),
      },
    };
  };
};
