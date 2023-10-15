import { DevMemoMenuButton } from "@/client/features/devMemo/DevMemoMenuButton/DevMemoMenuButton";
import { useDevMemos } from "@/client/features/devMemo/useDevMemos";
import { useSessionQuery } from "@/client/features/session/useSessionQuery";
import { UserIconLink } from "@/client/features/user/UserIconLink/UserIconLink";
import { useHashRemoverOnClickOutside } from "@/client/lib/useHashRemoverOnClickOutside";
import { formatDate } from "@/client/lib/utils";
import { MutedText } from "@/client/ui/MutedText/MutedText";
import { DevMemo } from "@/models/devMemo";
import { Flex, Stack, Text } from "@mantine/core";
import classes from "./DevMemoChild.module.css";

type Props = { memo: DevMemo; devId: string; ideaId: string };

export const DevMemoChild: React.FC<Props> = ({ memo, devId, ideaId }) => {
  const { session } = useSessionQuery();
  const { deleteMemoMutation } = useDevMemos({ devId: devId });
  const memoRef = useHashRemoverOnClickOutside({
    canRemove: (hash) => hash === memo.id,
  });

  const handleDeleteMemo = (id: string) => {
    deleteMemoMutation.mutate({ devMemoId: id });
  };

  return (
    <Flex ref={memoRef} id={memo.id} gap="xs" className={classes.root}>
      <Stack>
        <UserIconLink
          userId={memo.fromUser.id}
          iconSrc={memo.fromUser.imageUrl}
        />
      </Stack>
      <Stack gap="md" className={classes.content}>
        <Flex justify="space-between">
          <Stack gap={0}>
            <MutedText>{memo.fromUser.name}</MutedText>
            <Flex>
              <Text c="gray.7" size="xs">
                {formatDate(memo.createdAt)}
              </Text>
            </Flex>
          </Stack>
          <DevMemoMenuButton
            ideaId={ideaId}
            devId={devId}
            devMemoId={memo.id}
            isOwner={memo.fromUser.id === session?.user.id}
            onDeleteMemo={handleDeleteMemo}
            isDeleting={deleteMemoMutation.isLoading}
          />
        </Flex>
        <Text className={classes["text-wrapper"]}>{memo.text}</Text>
      </Stack>
    </Flex>
  );
};
