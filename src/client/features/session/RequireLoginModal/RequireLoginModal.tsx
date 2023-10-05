import { useRequireLoginModal } from "@/client/features/session/RequireLoginModalProvider";
import { AppModal } from "@/client/ui/AppModal/AppModal";
import { Button, Stack, Text } from "@mantine/core";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";

type Props = {};
export const RequireLoginModal: React.FC<Props> = () => {
  const { isLoginModalOpen, closeLoginModal, callbackUrlAfterLogin } =
    useRequireLoginModal();

  const handleLogin = () => {
    signIn("github", { callbackUrl: callbackUrlAfterLogin });
  };

  return (
    <AppModal
      centered
      opened={isLoginModalOpen}
      onClose={closeLoginModal}
      title="ログイン"
    >
      <Stack>
        <Text>この機能を利用するためには、ログインをする必要があります。</Text>
        <Button leftSection={<FaGithub size="21" />} onClick={handleLogin}>
          GitHubでログイン
        </Button>
      </Stack>
    </AppModal>
  );
};