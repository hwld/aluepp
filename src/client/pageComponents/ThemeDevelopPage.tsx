import { Card, Flex, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { Theme } from "../../server/models/theme";
import { Routes } from "../../share/routes";
import { CreateRepositoryData, ThemeDevelopFormData } from "../../share/schema";
import { ThemeDevelopForm } from "../features/theme/ThemeDevelopForm";
import { ThemeSummaryCard } from "../features/theme/ThemeSummaryCard";
import { useThemeDevelop } from "../features/theme/useThemeDevelop";
import { ComputerIcon } from "../ui/ComputerIcon";

type Props = {
  theme: Theme;
  restoredValues: CreateRepositoryData;
};
export const ThemeDevelopPage: React.FC<Props> = ({
  theme,
  restoredValues,
}) => {
  const router = useRouter();
  const mantineTheme = useMantineTheme();

  const {
    mutations: { developMutation },
  } = useThemeDevelop(theme.id);

  const handleDevelopTheme = (data: ThemeDevelopFormData) => {
    developMutation.mutate(data, {
      onSuccess: () => router.replace(Routes.theme(theme.id)),
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Stack w="100%" maw={800} miw={300} m="auto" spacing="lg">
      <Flex align="center" gap="xs">
        <ComputerIcon size="30px" fill={mantineTheme.colors.red[7]} />
        <Title order={3}>お題を開発</Title>
      </Flex>
      <Stack spacing="xs">
        <Text c="gray.5">開発するお題</Text>
        <ThemeSummaryCard theme={theme} />
      </Stack>
      <Stack spacing="xs">
        <Text c="gray.5">開発情報</Text>
        <Card>
          <ThemeDevelopForm
            onSubmit={handleDevelopTheme}
            onCancel={handleBack}
            themeId={theme.id}
            submitText="開発する"
            isLoading={developMutation.isLoading || developMutation.isSuccess}
            isRelogined={Object.keys(restoredValues).length > 0}
            defaultValues={{
              type: "createRepository",
              comment: restoredValues?.developmentComment ?? "",
              githubRepositoryName: restoredValues?.repositoryName ?? "",
              githubRepositoryDescription: restoredValues?.repositoryDesc ?? "",
            }}
          />
        </Card>
      </Stack>
    </Stack>
  );
};