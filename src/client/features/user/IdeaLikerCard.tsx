import { UserIcon } from "@/client/features/user/UserIcon";
import { formatDate } from "@/client/lib/utils";
import { TextLink } from "@/client/ui/TextLink";
import { IdeaLiker } from "@/server/models/ideaLike";
import { Routes } from "@/share/routes";
import { Card, Flex, Text } from "@mantine/core";
import { useRouter } from "next/router";

export const ideaLikerCardMinWidthPx = 350;

type Props = {
  liker: IdeaLiker;
};
export const IdeaLikerCard: React.FC<Props> = ({ liker }) => {
  const router = useRouter();

  const handleGoUserDetail = () => {
    router.push(Routes.user(liker.id));
  };

  //お題をいいねしたユーザーのカード
  return (
    <Card
      miw={ideaLikerCardMinWidthPx}
      w="100%"
      sx={(theme) => ({
        gap: theme.spacing.sm,
        maxHeight: "100px",
        cursor: "pointer",
        position: "static",
        transition: "all 100ms",
        outline: "transparent solid 0px",
        "&:hover": {
          outline: `${theme.colors.red[6]} solid 2px`,
          outlineOffset: "2px",
        },
      })}
      onClick={handleGoUserDetail}
    >
      <Flex justify="space-between">
        <Flex gap={10} miw={0}>
          {/* アイコン　*/}
          <UserIcon iconSrc={liker.image} />
          {/* 名前 */}
          <TextLink href={Routes.user(liker.id)}>
            <Text
              truncate
              sx={{
                flexShrink: 0,
              }}
              fw="bold"
              size="lg"
            >
              {liker.name}
            </Text>
          </TextLink>
        </Flex>
      </Flex>
      {/* いいねをした日付 */}
      <Flex align="center" justify="flex-start" mt={10}>
        <Text size="sm" color="gray.5">
          いいねした日: {formatDate(liker.likedDate)}
        </Text>
      </Flex>
    </Card>
  );
};
