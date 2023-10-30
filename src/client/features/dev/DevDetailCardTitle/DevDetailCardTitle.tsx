import { TextLink } from "@/client/ui/TextLink/TextLink";
import { Dev } from "@/models/dev";
import { Routes } from "@/share/routes";
import { Box, Flex, Stack, Text } from "@mantine/core";
import { TbFileText } from "react-icons/tb";

type Props = { dev: Dev };

export const DevDetailCardTitle: React.FC<Props> = ({ dev }) => {
  return (
    <Flex gap={5}>
      <Box style={{ flexShrink: 0 }}>
        <TbFileText
          color={
            dev.idea
              ? "var(--mantine-color-red-7)"
              : "var(--mantine-color-gray-5)"
          }
          size={30}
        />
      </Box>
      <Stack gap={0} miw={0}>
        {dev.idea ? (
          <TextLink href={Routes.idea(dev.idea.id)}>
            <Text c="gray.7" size="xl" fw="bold" truncate>
              {dev.idea.title}
            </Text>
          </TextLink>
        ) : (
          <Text c="gray.5" size="xl">
            削除されたお題
          </Text>
        )}
        <Text c="red.7" size="lg" fw="bold" ml="md">
          の開発情報
        </Text>
      </Stack>
    </Flex>
  );
};