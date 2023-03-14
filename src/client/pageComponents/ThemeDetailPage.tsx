import {
  Box,
  Card,
  Flex,
  MediaQuery,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import { SyntheticEvent } from "react";
import { FaUserAlt } from "react-icons/fa";
import { Theme } from "../../server/models/theme";
import { Routes } from "../../share/routes";
import { useRequireLoginModal } from "../features/session/RequireLoginModalProvider";
import { useSessionQuery } from "../features/session/useSessionQuery";
import { ThemeDescriptionView } from "../features/theme/ThemeDescriptionView";
import { ThemeDevelopButton } from "../features/theme/ThemeDevelopButton";
import { ThemeLikeButton } from "../features/theme/ThemeLikeButton";
import { ThemeOperationButton } from "../features/theme/ThemeOperationButton";
import { ThemeTagBadge } from "../features/theme/ThemeTagBadge";
import { useThemeDevelop } from "../features/theme/useThemeDevelop";
import { useThemeLike } from "../features/theme/useThemeLike";
import { ThemeComments } from "../features/themeComment/ThemeComments";
import { UserIconLink } from "../features/user/UserIconLink";

type Props = { theme: Theme };

export const ThemeDetailPage: React.FC<Props> = ({ theme }) => {
  const mantineTheme = useMantineTheme();

  const { session } = useSessionQuery();
  const router = useRouter();
  const { openLoginModal } = useRequireLoginModal();
  const { likeThemeMutation, likedByLoggedInUser } = useThemeLike(theme.id);
  const {
    data: { developedData },
  } = useThemeDevelop(theme.id);

  const handleLikeTheme = () => {
    //ログインしていなければログインモーダルを表示する
    if (!session) {
      openLoginModal();
      return;
    }

    likeThemeMutation.mutate({
      themeId: theme.id,
      like: !likedByLoggedInUser,
    });
  };

  const handleClickDevelop = (e: SyntheticEvent) => {
    // ログインしていなければログインモーダルを表示する
    if (!session) {
      openLoginModal(Routes.themeDevelop(theme.id));
      return;
    }

    router.push(Routes.themeDevelop(theme.id));
  };

  // 自分の投稿かどうか
  const isThemeOwner = theme.user.id === session?.user.id;

  return (
    <Flex maw={1200} direction="column" align="center" m="auto">
      <Title align="center" color="red.7">
        {theme.title}
      </Title>
      <Flex mt="xl" gap="lg" w="100%">
        {/* 左カラム */}
        <Flex
          direction="column"
          align="center"
          gap="sm"
          h="min-content"
          // 左カラムで表示するダイアログがお題の説明の下にならないように、中カラムよりも上に配置する
          sx={{ position: "sticky", top: 10, zIndex: 1 }}
        >
          <ThemeDevelopButton
            themeId={theme.id}
            developments={theme.developments}
            loggedInUserDevelopedData={developedData}
            onDevelopTheme={handleClickDevelop}
          />
          <ThemeLikeButton
            themeId={theme.id}
            likes={theme.likes}
            likedByLoggedInUser={likedByLoggedInUser}
            onLikeTheme={handleLikeTheme}
            disabled={isThemeOwner}
          />
          <ThemeOperationButton theme={theme} isThemeOwner={isThemeOwner} />
        </Flex>

        {/* 中カラム */}
        <Box sx={{ flexGrow: 1 }}>
          <Card mih={300}>
            {theme.tags.length > 0 && (
              <Flex gap={10} mb="md" wrap="wrap">
                {theme.tags.map((tag) => (
                  <ThemeTagBadge tagId={tag.id} key={tag.id}>
                    {tag.name}
                  </ThemeTagBadge>
                ))}
              </Flex>
            )}
            <ThemeDescriptionView descriptionHtml={theme.descriptionHtml} />
          </Card>

          <ThemeComments themeId={theme.id} themeOwnerId={theme.user.id} />
        </Box>

        {/* 右カラム */}
        <MediaQuery smallerThan="md" styles={{ display: "none" }}>
          <Stack
            h="min-content"
            // 左カラムで表示するダイアログがお題の説明の下にならないように、中カラムよりも上に配置する
            sx={{ position: "sticky", top: 10, zIndex: 1 }}
          >
            <Card
              sx={{
                flexShrink: 0,
                flexGrow: 0,
                height: "min-content",
              }}
              w={300}
            >
              <Flex gap="xs" align="center">
                <FaUserAlt size={15} fill={mantineTheme.colors.gray[5]} />
                <Text color="gray.5" size="sm">
                  投稿者
                </Text>
              </Flex>
              <Flex gap={5} mt={5}>
                <UserIconLink
                  iconSrc={theme.user.image}
                  userId={theme.user.id}
                />
                <Text size={13}>{theme.user.name}</Text>
              </Flex>
            </Card>
          </Stack>
        </MediaQuery>
      </Flex>
    </Flex>
  );
};
