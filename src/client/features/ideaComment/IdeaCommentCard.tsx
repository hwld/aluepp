import {
  Box,
  Card,
  Flex,
  Stack,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useRef } from "react";
import { FaRegComment, FaUserAlt } from "react-icons/fa";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { IdeaComment } from "../../../server/models/ideaComment";
import { IdeaCommentFormData } from "../../../share/schema";
import { OmitStrict } from "../../../types/OmitStrict";
import { formatDate } from "../../lib/utils";
import { CardActionIcon } from "../../ui/CardActionIcon";
import { useRequireLoginModal } from "../session/RequireLoginModalProvider";
import { useSessionQuery } from "../session/useSessionQuery";
import { UserIconLink } from "../user/UserIconLink";
import { IdeaCommentMenuButton } from "./IdeaCommentMenuButton";
import { IdeaCommentReplyForm } from "./IdeaCommentReplyForm";
import { useIdeaCommentReply } from "./useIdeaCommentReply";

type Props = {
  ideaId: string;
  comment: IdeaComment;
  onDeleteComment: (id: string) => void;
  isDeleting?: boolean;
  isOwner: boolean;
  ideaOwnerId: string;
  focused?: boolean;
};

export const IdeaCommentCard: React.FC<Props> = ({
  ideaId,
  comment,
  onDeleteComment,
  isDeleting = false,
  isOwner,
  ideaOwnerId,
  focused = false,
}) => {
  const { session } = useSessionQuery();
  const { openLoginModal } = useRequireLoginModal();
  const mantineTheme = useMantineTheme();
  const router = useRouter();
  const replyFormRef = useRef<HTMLTextAreaElement | null>(null);

  const [isReplyFormOpen, { close: closeReplyForm, open: openReplyForm }] =
    useDisclosure(false);

  const { replyMutation } = useIdeaCommentReply({
    ideaId,
    closeReplyForm,
    onSuccess: () => {
      closeReplyForm();
    },
  });

  const handleDelete = () => {
    onDeleteComment(comment.id);
  };

  const handleOpenReplyForm = () => {
    if (!session) {
      openLoginModal();
      return;
    }
    openReplyForm();
  };

  const handleSubmitReply = (
    data: OmitStrict<IdeaCommentFormData, "ideaId">
  ) => {
    replyMutation.mutate(data);
  };

  // このコメントの返信元コメントにスクロールする
  const handleScrollReplySource = async () => {
    if (comment.inReplyToComment) {
      await router.replace({ hash: comment.inReplyToComment.id }, undefined, {
        shallow: true,
      });
    }
  };

  const handleFocusReplyForm = () => {
    replyFormRef.current?.focus();
  };

  return (
    <>
      <Stack spacing="xs">
        <Card
          id={comment.id}
          pos="static"
          sx={(theme) => ({
            // 現在いるページのURLフラグメントを手動で変えるとfocusedは変更されないので、スタイルが当たらないことがある。
            boxShadow: focused ? `0 0 0 2px ${theme.colors.red[7]}` : "",
          })}
        >
          <Stack spacing="md">
            <Flex gap="0" justify="space-between">
              <Flex gap="xs" align="flex-start">
                <UserIconLink
                  userId={comment.fromUser.id}
                  iconSrc={comment.fromUser.image}
                />
                <Box>
                  {comment.fromUser.id === ideaOwnerId && (
                    <Flex gap={5} align="center">
                      <FaUserAlt size={14} fill={mantineTheme.colors.red[7]} />
                      <Text color="red.7" size="xs">
                        お題の投稿者
                      </Text>
                    </Flex>
                  )}
                  <Text size="xs">{comment.fromUser.name}</Text>
                </Box>
              </Flex>
              <Box>
                <IdeaCommentMenuButton
                  ideaId={ideaId}
                  commentId={comment.id}
                  isOwner={isOwner}
                  onDeleteComment={handleDelete}
                  isDeleting={isDeleting}
                />
              </Box>
            </Flex>
            {/* 返信コメントは返信元が削除されている場合はnullになる */}
            {comment.inReplyToComment === null && (
              <Box
                color="red.7"
                sx={(theme) => ({
                  color: theme.colors.red[7],
                  textDecoration: "none",
                  display: "flex",
                  gap: 3,
                  alignItems: "center",
                })}
              >
                <HiOutlineChevronDoubleRight />
                削除されたコメント
              </Box>
            )}
            {comment.inReplyToComment && (
              <Flex>
                <UnstyledButton
                  onClick={handleScrollReplySource}
                  color="red.7"
                  sx={(theme) => ({
                    color: theme.colors.red[7],
                    textDecoration: "none",
                    display: "flex",
                    gap: 3,
                    alignItems: "center",
                    "&:hover": {
                      color: theme.colors.red[9],
                    },
                  })}
                >
                  <HiOutlineChevronDoubleRight />
                  {comment.inReplyToComment.fromUserName ?? "不明なユーザー名"}
                </UnstyledButton>
              </Flex>
            )}
            <Text sx={{ whiteSpace: "pre-wrap" }}>{comment.comment}</Text>
            <Flex justify="space-between" align="center" gap="xs">
              <Flex align="center">
                <CardActionIcon color="gray.5" onClick={handleOpenReplyForm}>
                  <FaRegComment size="70%" />
                </CardActionIcon>
              </Flex>
              <Text c="gray.5">{formatDate(comment.createdAt)}</Text>
            </Flex>
          </Stack>
        </Card>
        {isReplyFormOpen && (
          <Card onClick={handleFocusReplyForm}>
            <IdeaCommentReplyForm
              ref={replyFormRef}
              inReplyToCommentId={comment.id}
              ideaId={comment.ideaId}
              onCancel={closeReplyForm}
              onSubmit={handleSubmitReply}
              isSubmitting={replyMutation.isLoading}
            />
          </Card>
        )}
      </Stack>
    </>
  );
};
