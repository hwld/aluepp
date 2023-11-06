import { AppConfirmModal } from "@/client/ui/AppConfirmModal/AppConfirmModal";
import { AppMenu } from "@/client/ui/AppMenu/AppMenu";
import { AppMenuButton } from "@/client/ui/AppMenuButton/AppMenuButton";
import { AppMenuDivider } from "@/client/ui/AppMenuDivider/AppMenuDivider";
import { AppMenuDropdown } from "@/client/ui/AppMenuDropdown";
import { AppMenuItem } from "@/client/ui/AppMenuItem/AppMenuItem";
import { Routes } from "@/share/routes";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { IconFlag, IconLink, IconTrash } from "@tabler/icons-react";
import { ReportDevMemoModal } from "@/client/features/report/ReportDevMemoModal/ReportDevMemoModal";
import { useMemo } from "react";

type Props = {
  devId: string;
  devMemoId: string;
  /** ログインしているユーザーのプロフィールかどうか */
  isOwner: boolean;
  onDeleteMemo: (id: string) => void;
  isDeleting?: boolean;
};
export const DevMemoMenuButton: React.FC<Props> = ({
  devId,
  isOwner,
  devMemoId,
  onDeleteMemo,
  isDeleting = false,
}) => {
  const clipboard = useClipboard();

  const [
    isOpenDeleteModal,
    { close: closeDeleteModal, open: openDeleteModal },
  ] = useDisclosure(false);

  const [
    isReportModalOpen,
    { close: closeReportModal, open: openReportModal },
  ] = useDisclosure(false);

  const devMemoLink = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}${Routes.dev(devId)}#${devMemoId}`;
  }, [devId, devMemoId]);

  const handleDeleteMemo = () => {
    onDeleteMemo(devMemoId);
  };

  const handleCopyLink = () => {
    clipboard.copy(devMemoLink);
  };

  return (
    <>
      <AppMenu>
        <AppMenuButton />

        <AppMenuDropdown>
          {isOwner && (
            <>
              <AppMenuItem
                leftSection={<IconTrash />}
                red
                onClick={openDeleteModal}
              >
                メモを削除する
              </AppMenuItem>
              <AppMenuDivider />
            </>
          )}
          <AppMenuItem leftSection={<IconLink />} onClick={handleCopyLink}>
            リンクをコピーする
          </AppMenuItem>
          <AppMenuItem leftSection={<IconFlag />} onClick={openReportModal}>
            通報する
          </AppMenuItem>
        </AppMenuDropdown>
      </AppMenu>
      <AppConfirmModal
        title="開発メモの削除"
        message={
          <>
            開発メモを削除してもよろしいですか？<br></br>
            開発メモを削除すると、もらった返信が完全に削除されます。
          </>
        }
        opened={isOpenDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteMemo}
        isConfirming={isDeleting}
        confirmIcon={IconTrash}
        confirmText="削除する"
      />
      <ReportDevMemoModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        reportMeta={{ targetMemoUrl: devMemoLink }}
      />
    </>
  );
};
