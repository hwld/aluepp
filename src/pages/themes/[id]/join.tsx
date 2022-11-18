import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Modal,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { unstable_getServerSession } from "next-auth/next";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  themeQueryKey,
  useThemeQuery,
} from "../../../client/hooks/useThemeQuery";
import { trpc } from "../../../client/trpc";
import { prisma } from "../../../server/prismadb";
import { appRouter } from "../../../server/routers/_app";
import { RouterInputs } from "../../../server/trpc";
import { authOptions } from "../../api/auth/[...nextauth]";

export const getServerSideProps = async ({
  req,
  res,
  query,
}: GetServerSidePropsContext) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const { id: themeId } = query;
  if (typeof themeId !== "string") {
    return { notFound: true };
  }

  const caller = appRouter.createCaller({ session });
  const theme = await caller.themes.get({ themeId });

  const queryClient = new QueryClient();
  // TODO hook化
  queryClient.prefetchQuery(themeQueryKey(themeId), () => theme);
  const dehydratedState = dehydrate(queryClient);

  return { props: { dehydratedState } };
};

// TODO: コンポーネント分割
const JoinTheme: NextPage = () => {
  const router = useRouter();
  //TODO
  const themeId = router.query.id as string;

  const { theme } = useThemeQuery(themeId);

  const [opened, setOpened] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [repoDesc, setRepoDesc] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [comment, setComment] = useState("");

  const createRepoMutation = useMutation({
    mutationFn: (data: RouterInputs["github"]["createRepo"]) => {
      return trpc.github.createRepo.mutate(data);
    },
    onSuccess: (data) => {
      showNotification({
        color: "green",
        title: "リポジトリ作成",
        message: "リポジトリを作成しました。",
      });
      setRepoUrl(data.repoUrl);
      setOpened(false);
    },
    onError: () => {
      showNotification({
        color: "red",
        title: "リポジトリ作成",
        message: "リポジトリを作成できませんでした。",
      });
    },
  });

  const joinThemeMutation = useMutation({
    mutationFn: (data: RouterInputs["themes"]["join"]) => {
      return trpc.themes.join.mutate(data);
    },
    onSuccess: () => {
      showNotification({
        color: "green",
        title: "お題に参加",
        message: "お題に参加しました。",
      });
    },
    onError: () => {
      showNotification({
        color: "red",
        title: "お題に参加",
        message: "お題に参加できませんでした。",
      });
    },
  });

  const handleCreateRepo = () => {
    createRepoMutation.mutate({
      repoName: repoName,
      repoDescription: repoDesc,
    });
  };

  const handleJoinTheme = () => {
    if (!theme) return;
    joinThemeMutation.mutate({
      themeId: theme.id,
      githubUrl: repoUrl,
      comment,
    });
  };

  return (
    <Box p={30}>
      <Box>
        <Title>{theme?.title}</Title>
        <Avatar src={theme?.user.image} size="xl" radius={100} />
        <Text>{theme?.user.name}</Text>
        <Flex gap={10}>
          {theme?.tags.map((tag) => {
            return (
              <Badge key={tag.id} sx={{ textTransform: "none" }}>
                {tag.name}
              </Badge>
            );
          })}
        </Flex>
      </Box>
      <Box mt={30}>
        <Flex align="end" gap={5}>
          <TextInput
            label="GitHubリポジトリ"
            value={repoUrl}
            onChange={(e) => {
              setRepoUrl(e.target.value);
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            onClick={() => {
              setRepoName("");
              setRepoDesc("");
              setOpened(true);
            }}
          >
            作成
          </Button>
          <Modal
            opened={opened}
            onClose={() => {
              setOpened(false);
            }}
            title="GitHubリポジトリの作成"
          >
            <TextInput
              label="リポジトリ名"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
            <Textarea
              label="説明"
              value={repoDesc}
              onChange={(e) => setRepoDesc(e.target.value)}
            />
            <Flex gap={16} mt={16}>
              <Button onClick={handleCreateRepo}>リポジトリを作成する</Button>
              <Button variant="outline" onClick={() => setOpened(false)}>
                キャンセル
              </Button>
            </Flex>
          </Modal>
        </Flex>
        <Textarea
          label="コメント"
          minRows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button mt={16} onClick={handleJoinTheme}>
          参加する
        </Button>
      </Box>
    </Box>
  );
};
export default JoinTheme;
