import { Box, Flex, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { User } from "@prisma/client";
import React from "react";
import { BiBookmarkHeart } from "react-icons/bi";
import { BsFillPeopleFill } from "react-icons/bs";
import { TbHeart } from "react-icons/tb";
import { useFavoritedUsersQuery } from "../features/user/useFavoriteListQuery";
import { UserCard, userCardMinWidthPx } from "../features/user/UserCard";
import { UserSummaryCard } from "../features/user/UserSummaryCard";
import { usePaginationState } from "../lib/usePaginationState";
import { AppPagination } from "../ui/AppPagination";

type Props = { user: User };

export const FavoriteListPage: React.FC<Props> = ({ user }) => {
  const [page, setPage] = usePaginationState({});
  const { favoritedUsersPerPage } = useFavoritedUsersQuery(user.id, page);
  const { colors } = useMantineTheme();

  return (
    <Stack maw={800} m="auto" spacing="lg">
      <Flex align="center" gap="sm">
        <BiBookmarkHeart
          size="30px"
          color={colors.red[7]}
          style={{ marginTop: "3px" }}
        />
        <Title order={3}>お気に入り</Title>
      </Flex>
      <Stack spacing="sm">
        <Text c="gray.5">ユーザー</Text>
        <UserSummaryCard user={user} />
      </Stack>
      {favoritedUsersPerPage?.favoritedUsers.length === 0 ? (
        <Flex direction="column" align="center" gap={50}>
          <Flex align="flex-end" justify="center">
            <BsFillPeopleFill size={70} color={colors.red[7]} />
            <TbHeart size={70} color={colors.red[3]} fill={colors.red[3]} />
            <TbHeart size={100} color={colors.red[4]} fill={colors.red[4]} />
            <TbHeart size={130} color={colors.red[5]} fill={colors.red[5]} />
            <TbHeart size={160} color={colors.red[6]} fill={colors.red[6]} />
          </Flex>

          <Text size={30}>ユーザのお気に入りをまだしていません</Text>

          <Text c="gray.5">
            他のユーザをお気に入りすると、ここに表示されます。
          </Text>
        </Flex>
      ) : (
        <Stack spacing="sm">
          <Text c="gray.5">お気に入りユーザー</Text>
          <Box
            sx={(theme) => ({
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(${userCardMinWidthPx}px, 1fr))`,
              gap: theme.spacing.xs,
            })}
          >
            {favoritedUsersPerPage?.favoritedUsers.map((user) => {
              return <UserCard key={user.id} user={user} />;
            })}
          </Box>
        </Stack>
      )}
      <AppPagination
        page={Number(page)}
        onChange={setPage}
        total={favoritedUsersPerPage?.allPages ?? 0}
      />
    </Stack>
  );
};
