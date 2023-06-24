import { useLoggedInUserInfoQuery } from "@/client/features/session/useLoggedInUserInfoQuery";
import { UserIcon } from "@/client/features/user/UserIcon";
import { Flex, Stack, Text, useMantineTheme } from "@mantine/core";
import { Session } from "next-auth";
import { TbChevronDown, TbCode, TbFileText, TbHeart } from "react-icons/tb";

type Props = { user: Session["user"]; iconWidth: number };

export const LoggedInUserCard: React.FC<Props> = ({ user, iconWidth }) => {
  const { colors } = useMantineTheme();
  const { loggedInUserInfo } = useLoggedInUserInfoQuery();

  return (
    <Flex
      w="100%"
      align="center"
      justify="space-between"
      sx={() => ({
        overflow: "hidden",
      })}
    >
      <Flex gap="xs" miw="0">
        <Stack sx={() => ({ flexShrink: 0 })}>
          <UserIcon size={iconWidth} iconSrc={user.image} withBorder={true} />
        </Stack>
        <Stack
          sx={() => ({
            flexShrink: 1,
            flexWrap: "nowrap",
            overflow: "hidden",
          })}
          spacing="xs"
        >
          <Text c="gray.1" fw="bold" size="sm" truncate>
            {user.name}
          </Text>
          {/* アイコン類 */}
          <Flex gap="xs">
            <Flex gap="2px" align="center">
              <TbHeart size="20" color={colors.gray[1]} />
              <Text size="sm" color={colors.gray[1]} truncate>
                {loggedInUserInfo?.allLikes ?? 0}
              </Text>
            </Flex>

            <Flex gap="2px" align="center">
              <TbFileText size="20" color={colors.gray[1]} />
              <Text size="sm" color={colors.gray[1]} truncate>
                {loggedInUserInfo?.ideas ?? 0}
              </Text>
            </Flex>

            <Flex gap="2px" align="center">
              <TbCode size="20" color={colors.gray[1]} />
              <Text size="sm" color={colors.gray[1]} truncate>
                {loggedInUserInfo?.developments ?? 0}
              </Text>
            </Flex>
          </Flex>
        </Stack>
      </Flex>
      <TbChevronDown
        size="30"
        color={colors.gray[3]}
        style={{ paddingTop: "3px", flexShrink: 0 }}
      />
    </Flex>
  );
};
