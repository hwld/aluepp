import {
  DevelopForm,
  DevelopmentFormDefaultValues,
} from "@/client/features/dev/DevelopForm/DevelopForm";
import { useDevStatusesQuery } from "@/client/features/dev/useDevStatusesQuery";
import { useDevelop } from "@/client/features/dev/useDevelop";
import { IdeaSummaryCard } from "@/client/features/idea/IdeaSummaryCard";
import { PageHeader } from "@/client/ui/PageHeader/PageHeader";
import {
  CreateRepositoryData,
  Development,
  DevelopmentFormData,
} from "@/models/development";
import { Idea } from "@/models/idea";
import { DevStatusIds } from "@/share/consts";
import { Card, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { MdOutlineEdit } from "react-icons/md";

type Props = {
  idea: Idea;
  development: Development;
  restoredValues: CreateRepositoryData;
};
export const DevelopmentEditPage: React.FC<Props> = ({
  idea,
  development,
  restoredValues,
}) => {
  const router = useRouter();

  const { developmentStatuses } = useDevStatusesQuery();

  const {
    mutations: { updateDevelopmentMutation },
  } = useDevelop({ ideaId: idea.id });

  const handleUpdateDevelopment = (data: DevelopmentFormData) => {
    updateDevelopmentMutation.mutate({
      ...data,
      ideaId: idea.id,
      developmentId: development.id,
    });
  };

  const handleBack = () => {
    router.back();
  };

  const developmentFormDefaultValues =
    useMemo((): DevelopmentFormDefaultValues => {
      const base: DevelopmentFormDefaultValues = {
        comment: development.comment,
        developedItemUrl: development.developedItemUrl,
        developmentStatusId: DevStatusIds.IN_PROGRESS,
        githubRepositoryDescription: "",
        githubRepositoryName: "",
        githubRepositoryUrl: "",
        type: "createRepository",
      };

      // 復元されたフィールドが一つ以上あれば、リポジトリの作成フォームを
      // 選択していると仮定する
      if (Object.keys(restoredValues).length > 0) {
        return {
          ...base,
          type: "createRepository",
          comment: restoredValues.developmentComment ?? "",
          developedItemUrl: restoredValues.developedItemUrl ?? "",
          githubRepositoryName: restoredValues.repositoryName ?? "",
          githubRepositoryDescription: restoredValues.repositoryDesc ?? "",
        };
      } else {
        return {
          ...base,
          type: "referenceRepository",
          githubRepositoryUrl: development.githubUrl,
          developmentStatusId: development.status.id,
        };
      }
    }, [
      development.comment,
      development.developedItemUrl,
      development.githubUrl,
      development.status.id,
      restoredValues,
    ]);

  return (
    <>
      <PageHeader icon={MdOutlineEdit} pageName="開発情報の編集" />
      <Stack w="100%" maw={800} miw={300} m="auto" spacing="lg">
        <Stack spacing="xs">
          <Text c="gray.5">開発しているお題</Text>
          <IdeaSummaryCard idea={idea} />
        </Stack>
        <Stack spacing="xs">
          <Text c="gray.5">開発情報</Text>
          <Card>
            <DevelopForm
              developmentStatuses={developmentStatuses}
              onSubmit={handleUpdateDevelopment}
              onCancel={handleBack}
              ideaId={idea.id}
              isRelogined={Object.keys(restoredValues).length > 0}
              defaultValues={developmentFormDefaultValues}
              submitText="更新する"
              isLoading={
                updateDevelopmentMutation.isLoading ||
                updateDevelopmentMutation.isSuccess
              }
            />
          </Card>
        </Stack>
      </Stack>
    </>
  );
};
