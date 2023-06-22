import {
  Card,
  Center,
  Flex,
  Stack,
  Switch,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";
import { MdComputer } from "react-icons/md";
import { TbNote } from "react-icons/tb";
import { Development } from "../../server/models/development";
import { Idea } from "../../server/models/idea";
import { DevelopmentMemoFormData } from "../../share/schema";
import { DevelopmentDetailCard } from "../features/development/DevelopmentDetailCard";
import { developmentKeys } from "../features/development/queryKeys";
import { useDevelopmentLikeOnDetail } from "../features/development/useDevelopmentLikeOnDetail";
import { DevelopmentMemoFormCard } from "../features/developmentMemo/DevelopmentMemoFormCard";
import { DevelopmentMemoThreadCard } from "../features/developmentMemo/DevelopmentMemoThreadCard";
import { useDevelopmentMemos } from "../features/developmentMemo/useDevelopmentMemos";
import { useRequireLoginModal } from "../features/session/RequireLoginModalProvider";
import { useSessionQuery } from "../features/session/useSessionQuery";
import { trpc } from "../lib/trpc";
import { useAutoScrollOnIncrease } from "../lib/useAutoScrollOnIncrease";
import { useCyclicRandom } from "../lib/useCyclicRandom";
import { showErrorNotification } from "../lib/utils";
import { EmptyContentItem } from "../ui/EmptyContentItem";
import { PageHeader } from "../ui/PageHeader";

type Props = { development: Development; idea: Idea };

export const DevelopmentDetailPage: React.FC<Props> = ({
  development,
  idea,
}) => {
  const { colors } = useMantineTheme();

  const memoFormCardRef = useRef<HTMLDivElement | null>(null);

  const { session } = useSessionQuery();
  const loggedInUser = session?.user;
  const isDeveloper = development.developerUserId === loggedInUser?.id;

  const { developmentMemoThreads, createMemoMutation } = useDevelopmentMemos({
    developmentId: development.id,
  });

  const { likeDevelopmentMutation, unlikeDevelopmentMutation } =
    useDevelopmentLikeOnDetail(development.id);

  const queryClient = useQueryClient();
  const toggleAllowOtherUserMemosMutation = useMutation({
    mutationFn: () => {
      return trpc.development.updateAllowOtherUserMemos.mutate({
        developmentId: development.id,
        allowOtherUserMemos: !development.allowOtherUserMemos,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(developmentKeys.detail(development.id));
    },
    onError: () => {
      showErrorNotification({
        title: "開発メモの返信権限の更新",
        message: "開発メモの返信権限を更新できませんでした。",
      });
    },
  });

  const { openLoginModal } = useRequireLoginModal();
  const [formKey, nextFormKey] = useCyclicRandom();

  const handleToggleDevelopmentLike = () => {
    if (!session) {
      openLoginModal();
      return;
    }

    if (development.likedByLoggedInUser) {
      unlikeDevelopmentMutation.mutate({ developmentId: development.id });
    } else {
      likeDevelopmentMutation.mutate({ developmentId: development.id });
    }
  };

  const handleSubmitMemo = (data: DevelopmentMemoFormData) => {
    createMemoMutation.mutate(data, {
      onSuccess: () => {
        nextFormKey();
      },
    });
  };

  const handleToggleAllowOtherUserMemos = () => {
    toggleAllowOtherUserMemosMutation.mutate();
  };

  // メモスレッドが追加されたらスクロールさせる
  useAutoScrollOnIncrease({
    target: memoFormCardRef,
    count: developmentMemoThreads.length,
  });

  return (
    <>
      <PageHeader icon={MdComputer} pageName="開発情報の詳細" />
      <Stack maw={1200} w="100%" m="auto" spacing={40}>
        <DevelopmentDetailCard
          development={development}
          onToggleDevelopmentLike={handleToggleDevelopmentLike}
          isDeveloper={isDeveloper}
        />
        <Stack spacing="xl">
          <Flex align="center" justify="space-between" gap="xl">
            <Title order={4}>開発メモ</Title>
            {isDeveloper && (
              <Card>
                <Switch
                  checked={development.allowOtherUserMemos}
                  onChange={handleToggleAllowOtherUserMemos}
                  label="他のユーザーの返信を許可"
                  styles={{
                    track: { cursor: "pointer" },
                    label: { cursor: "pointer", userSelect: "none" },
                  }}
                />
              </Card>
            )}
          </Flex>
          {developmentMemoThreads.length === 0 ? (
            <Card py={40}>
              <Center h="100%">
                <EmptyContentItem
                  icon={<TbNote size={120} color={colors.gray[7]} />}
                  text="開発メモがありません"
                  description={
                    <>
                      開発時に問題に直面したり、知見をまとめたいときに<br></br>
                      開発メモを残すことができます。
                    </>
                  }
                />
              </Center>
            </Card>
          ) : (
            <Stack spacing="xs">
              {developmentMemoThreads.map((thread) => {
                return (
                  <DevelopmentMemoThreadCard
                    ideaId={idea.id}
                    key={thread.rootMemo.id}
                    memo={thread.rootMemo}
                    developmentId={development.id}
                    childrenMemos={thread.children}
                    loggedInUserId={loggedInUser?.id}
                  />
                );
              })}
            </Stack>
          )}
          {loggedInUser && isDeveloper && (
            <DevelopmentMemoFormCard
              ref={memoFormCardRef}
              key={formKey}
              developmentId={development.id}
              loggedInUser={loggedInUser}
              onSubmit={handleSubmitMemo}
              isSubmitting={createMemoMutation.isLoading}
            />
          )}
        </Stack>
      </Stack>
    </>
  );
};
