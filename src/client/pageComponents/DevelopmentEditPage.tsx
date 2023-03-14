import { Card, Flex, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { MdComputer } from "react-icons/md";
import { RouterInputs } from "../../server/lib/trpc";
import { Theme } from "../../server/models/theme";
import { ThemeDevelopment } from "../../server/models/themeDevelopment";
import { Routes } from "../../share/routes";
import { RepositoryFormData, ThemeDevelopFormData } from "../../share/schema";
import { ThemeDevelopForm } from "../features/theme/ThemeDevelopForm";
import { ThemeSummaryCard } from "../features/theme/ThemeSummaryCard";
import { trpc } from "../lib/trpc";
import { showErrorNotification, showSuccessNotification } from "../lib/utils";

type Props = {
  theme: Theme;
  development: ThemeDevelopment;
  repoUrl?: string;
  repoFormData?: RepositoryFormData;
  reRepo?: string;
};
export const DevelopmentEditPage: React.FC<Props> = ({
  theme,
  development,
  repoUrl,
  repoFormData,
  reRepo,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const mantineTheme = useMantineTheme();

  const updateMutation = useMutation({
    mutationFn: (data: RouterInputs["development"]["update"]) => {
      return trpc.development.update.mutate(data);
    },
    onSuccess: () => {
      showSuccessNotification({
        title: "お題開発情報の更新",
        message: "お題開発情報を更新しました。",
      });
      queryClient.invalidateQueries(["developments", development.id]);
      router.push(Routes.development(theme.id, development.id));
    },
    onError: () => {
      showErrorNotification({
        title: "お題開発情報の更新",
        message: "お題開発情報を更新できませんでした。",
      });
    },
  });

  const handleUpdateDevelopment = (data: ThemeDevelopFormData) => {
    updateMutation.mutate(data);
  };

  const handleBack = () => {
    router.back();
  };

  const repository: string = reRepo ?? "edit";

  return (
    <Stack w="100%" maw={800} miw={300} m="auto" spacing="lg">
      <Flex align="center" gap="xs">
        <MdComputer
          size="30px"
          color={mantineTheme.colors.red[7]}
          style={{ marginTop: "3px" }}
        />
        <Title order={3}>お題開発情報の更新</Title>
      </Flex>
      <Stack spacing="xs">
        <Text c="gray.5">開発しているお題</Text>
        <ThemeSummaryCard theme={theme} />
      </Stack>
      <Stack spacing="xs">
        <Text c="gray.5">開発情報</Text>
        <Card>
          <ThemeDevelopForm
            onSubmit={handleUpdateDevelopment}
            onCancel={handleBack}
            themeId={theme.id}
            defaultValues={development}
            submitText="更新する"
            isLoading={updateMutation.isLoading || updateMutation.isSuccess}
            repository={repository}
            repoFormData={repoFormData}
          />
        </Card>
      </Stack>
    </Stack>
  );
};
