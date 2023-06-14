import { Button, Card, Text, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { TbFileText } from "react-icons/tb";
import { Routes } from "../../../share/routes";
import { useRequireLoginModal } from "../session/RequireLoginModalProvider";

type Props = { isLoggedIn: boolean };

export const EmptyHomeIdeas: React.FC<Props> = ({ isLoggedIn }) => {
  const router = useRouter();
  const { colors } = useMantineTheme();
  const { openLoginModal } = useRequireLoginModal();

  const handleCreateIdea = () => {
    if (!isLoggedIn) {
      openLoginModal(Routes.ideaCreate);
      return;
    }

    router.push(Routes.ideaCreate);
  };

  return (
    <Card
      w={450}
      p="xl"
      sx={() => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      })}
    >
      <TbFileText size={100} color={colors.red[7]} />
      <Text size="lg" color="gray.5" fw="bold" mt="sm">
        お題が投稿されていません
      </Text>
      <Text align="center" color="gray.4" mt={5}>
        ユーザーによってお題が投稿されると、<br></br>
        人気のお題や最新のお題などが表示されます。
      </Text>
      <Button mt="xl" onClick={handleCreateIdea}>
        お題を投稿する
      </Button>
    </Card>
  );
};
