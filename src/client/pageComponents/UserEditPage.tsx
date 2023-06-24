import { Box, Card, Flex, useMantineTheme } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { MdOutlineEdit } from "react-icons/md";
import { RouterInputs } from "../../server/lib/trpc";
import { Routes } from "../../share/routes";
import { ProfileFormData } from "../../share/schema/user";
import { UserIconFormDialog } from "../features/user/UserIconFormModal";
import { UserProfileForm } from "../features/user/UserProfileForm";
import { trpc } from "../lib/trpc";
import {
  showErrorNotification,
  showLoadingNotification,
  showSuccessNotification,
} from "../lib/utils";
import { PageHeader } from "../ui/PageHeader";

const uploadNotificationId = "upload-icon";

type Props = { user: Session["user"] };
export const UserEditPage: React.FC<Props> = ({ user }) => {
  const router = useRouter();
  const mantineTheme = useMantineTheme();
  const [uploading, setUploading] = useState(false);

  const handleUploadIcon = async (iconFile: File) => {
    const formData = new FormData();
    formData.append("avatar", iconFile);

    setUploading(true);
    showLoadingNotification({
      id: uploadNotificationId,
      loading: true,
      title: "ユーザーアイコンの更新",
      message:
        "ユーザーアイコンをアップロードしています。しばらくお待ちください...",
      autoClose: false,
      disallowClose: true,
    });
    try {
      const response = await fetch(Routes.api.uploadAvatar, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error();
      }
    } catch {
      showErrorNotification(
        {
          title: "ユーザーアイコンの更新",
          message: "ユーザーアイコンを更新できませんでした。",
        },
        { update: true, id: uploadNotificationId }
      );
      return;
    } finally {
      setUploading(false);
    }

    showSuccessNotification(
      {
        id: uploadNotificationId,
        title: "ユーザーアイコンの更新",
        message: "ユーザーアイコンを更新しました。",
      },
      { update: true, id: uploadNotificationId }
    );
    // 更新なしでアイコンを反映させたいが、方法がわからない
    router.reload();
  };

  const updateMutation = useMutation({
    mutationFn: (data: RouterInputs["me"]["update"]) => {
      return trpc.me.update.mutate(data);
    },
    onSuccess: () => {
      showSuccessNotification({
        title: "プロフィールの更新",
        message: "プロフィールを更新しました。",
      });
      router.push(Routes.user(user.id));
    },
    onError: () => {
      showErrorNotification({
        title: "プロフィールの更新",
        message: "プロフィールを更新できませんでした。",
      });
    },
  });

  const handleUpdateUser = ({ name, profile }: ProfileFormData) => {
    updateMutation.mutate({ name, profile });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <PageHeader icon={MdOutlineEdit} pageName="ユーザーの編集" />
      <Box w="100%" maw={800} miw={400} m="auto">
        <Card mt="md">
          <Flex gap="md">
            <UserIconFormDialog
              userIconUrl={user.image}
              onSubmit={handleUploadIcon}
              submitting={uploading}
            />
            <Box sx={{ flexGrow: 1 }}>
              <UserProfileForm
                submitText="更新する"
                onSubmit={handleUpdateUser}
                onCancel={handleCancel}
                defaultValues={{
                  name: user.name ?? "",
                  profile: user.profile ?? "",
                }}
                isLoading={updateMutation.isLoading || updateMutation.isSuccess}
              />
            </Box>
          </Flex>
        </Card>
      </Box>
    </>
  );
};
