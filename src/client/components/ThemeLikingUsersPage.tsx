import { Box, Flex, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { MdOutlineFavorite } from "react-icons/md";
import { Theme } from "../../server/models/theme";
import { usePaginationState } from "../hooks/usePaginationState";
import { useThemeLikingUsersQuery } from "../hooks/useThemeLikingUsersQuery";
import { AppPagination } from "./AppPagination";
import { NothingThemeLikingUsers } from "./NothingThemeLikingUsers";
import { ThemeSummaryCard } from "./ThemeSummaryCard";
import { UserCard, userCardMinWidthPx } from "./UserCard";

type Props = { theme: Theme };
export const ThemeLikingUsersPage: React.FC<Props> = ({ theme }) => {
  const [page, setPage] = usePaginationState({});
  const { data } = useThemeLikingUsersQuery(theme.id, page);
  const mantineTheme = useMantineTheme();

  return (
    <Stack maw={800} m="auto" spacing="lg">
      <Flex align="center" gap="sm">
        <MdOutlineFavorite
          size="30px"
          color={mantineTheme.colors.red[7]}
          style={{ marginTop: "2px" }}
        />
        <Title order={3}>お題のいいね</Title>
      </Flex>
      <Stack spacing="sm">
        <Text c="gray.5">いいねされたお題</Text>
        <ThemeSummaryCard theme={theme} />
      </Stack>
      {theme.likes === 0 ? (
        <NothingThemeLikingUsers />
      ) : (
        <Stack spacing="sm">
          <Text c="gray.5" align="left">
            いいねしたユーザー
          </Text>
          <Box
            sx={(theme) => ({
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(${userCardMinWidthPx}px, 1fr))`,
              gap: theme.spacing.xs,
            })}
          >
            {data?.users.map((user) => {
              return <UserCard key={user.id} user={user} />;
            })}
          </Box>
        </Stack>
      )}
      <AppPagination
        page={page}
        onChange={setPage}
        total={data?.allPages ?? 0}
      />
    </Stack>
  );
};
