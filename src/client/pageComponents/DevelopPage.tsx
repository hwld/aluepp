import { Card, Flex, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { Idea } from "../../server/models/idea";
import { DevelopmentStatusIds } from "../../share/consts";
import { Routes } from "../../share/routes";
import { CreateRepositoryData, DevelopmentFormData } from "../../share/schema";
import { useDevelopmentStatusesQuery } from "../features/development/useDevelopmentStatusesQuery";
import { DevelopmentForm } from "../features/idea/DevelopmentForm";
import { IdeaSummaryCard } from "../features/idea/IdeaSummaryCard";
import { useDevelop } from "../features/idea/useDevelop";
import { ComputerIcon } from "../ui/ComputerIcon";

type Props = {
  idea: Idea;
  restoredValues: CreateRepositoryData;
};
export const DevelopIdeaPage: React.FC<Props> = ({ idea, restoredValues }) => {
  const router = useRouter();
  const mantineTheme = useMantineTheme();

  const { developmentStatuses } = useDevelopmentStatusesQuery();

  const {
    mutations: { developMutation },
  } = useDevelop(idea.id);

  const handleDevelopIdea = (data: DevelopmentFormData) => {
    developMutation.mutate(data, {
      onSuccess: () => router.replace(Routes.idea(idea.id)),
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
        <IdeaSummaryCard idea={idea} />
      </Stack>
      <Stack spacing="xs">
        <Text c="gray.5">開発情報</Text>
        <Card>
          <DevelopmentForm
            developmentStatuses={developmentStatuses}
            onSubmit={handleDevelopIdea}
            onCancel={handleBack}
            ideaId={idea.id}
            submitText="開発する"
            isLoading={developMutation.isLoading || developMutation.isSuccess}
            isRelogined={Object.keys(restoredValues).length > 0}
            defaultValues={{
              type: "createRepository",
              comment: restoredValues?.developmentComment ?? "",
              githubRepositoryName: restoredValues?.repositoryName ?? "",
              githubRepositoryDescription: restoredValues?.repositoryDesc ?? "",
              developmentStatusId: DevelopmentStatusIds.IN_PROGRESS,
              githubRepositoryUrl: "",
            }}
          />
        </Card>
      </Stack>
    </Stack>
  );
};
