import { Card, Stack, Title } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
import { IdeaCommentFormData } from "../../../share/schema";
import { OmitStrict } from "../../../types/OmitStrict";
import { useCyclicRandom } from "../../lib/useCyclicRandom";
import { extractHash } from "../../lib/utils";
import { useRequireLoginModal } from "../session/RequireLoginModalProvider";
import { useSessionQuery } from "../session/useSessionQuery";
import { IdeaCommentCard } from "./IdeaCommentCard";
import { IdeaCommentForm } from "./IdeaCommentForm";
import { useIdeaComments } from "./useIdeaComments";

type Props = { ideaId: string; ideaOwnerId: string };

/** お題へのコメント */
export const IdeaComments: React.FC<Props> = ({ ideaId, ideaOwnerId }) => {
  const { session } = useSessionQuery();
  const router = useRouter();
  const { openLoginModal } = useRequireLoginModal();
  const [focusedCommentId, setFocusedCommentId] = useState("");

  const commentsRef = useClickOutside(async () => {
    if (focusedCommentId !== "") {
      // フラグメントを削除する
      // フラグメントで指定されているカードの外側のクリックでフラグメントを削除したかったのだが、
      // 別のコメントの返信元へのリンクをクリックすると、そちらでもrouter.replaceを使用しているため、
      // routingがキャンセルされてエラーが出ることがあるため、コメント全体の外側のクリックでフラグメントを削除するようにしている
      await router.replace(router.asPath.split("#")[0], undefined, {
        shallow: true,
        scroll: false,
      });
    }
  });

  // お題のコメント操作
  const { ideaComments, postCommentMutation, deleteCommentMutation } =
    useIdeaComments(ideaId);

  // コメント送信後にformを再マウントさせるために使用するkey
  const { random: formKey, nextRandom: nextFormKey } = useCyclicRandom();

  // submit前に呼び出される。
  // ログインしていなければログインモーダルを表示させる。
  const handleClickSubmit = (e: SyntheticEvent) => {
    if (!session) {
      openLoginModal();
      e.preventDefault();
    }
  };

  const handleSubmitComment = (
    data: OmitStrict<IdeaCommentFormData, "ideaId">
  ) => {
    postCommentMutation.mutate(data, {
      onSuccess: () => {
        // Formのkeyを変更して再マウントさせる。
        // これでFormのフィールドがリセットされ、submitボタンを一度も押していないことになる。
        // handleSubmitCommentでフィールドをリセットするメソッドを受けとり、onSuccessで実行することも
        // できるが、submitを一度押していることになるので、コメント欄に入力->入力をすべて削除でエラーメッセージが表示されてしまう
        nextFormKey();
      },
    });
  };

  const handleSubmitReply = (
    data: OmitStrict<IdeaCommentFormData, "ideaId">,
    onSuccess: () => void
  ) => {
    postCommentMutation.mutate(data, { onSuccess });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  // フラグメントで指定されているコメントを設定する
  // SSRではフラグメントを取得できないので、クライアント側だけで設定されるように
  // useEffectを使用する
  useEffect(() => {
    const id = extractHash(router.asPath);
    setFocusedCommentId(id);
  }, [router.asPath]);

  return (
    <Stack>
      <Title mt={30} order={4}>
        投稿されたコメント
      </Title>
      {ideaComments && ideaComments.length > 0 && (
        <Stack spacing="xs" ref={commentsRef}>
          {ideaComments.map((comment) => {
            return (
              <IdeaCommentCard
                key={comment.id}
                comment={comment}
                ideaId={ideaId}
                onReplyComment={handleSubmitReply}
                onDeleteComment={handleDeleteComment}
                isDeleting={deleteCommentMutation.isLoading}
                isOwner={session?.user.id === comment.fromUser.id}
                ideaOwnerId={ideaOwnerId}
                focused={focusedCommentId === comment.id}
              />
            );
          })}
        </Stack>
      )}
      <Card>
        <IdeaCommentForm
          key={formKey}
          ideaId={ideaId}
          onSubmit={handleSubmitComment}
          onClickSubmitButton={handleClickSubmit}
          isSubmitting={postCommentMutation.isLoading}
        />
      </Card>
    </Stack>
  );
};