import { IdeaForm } from "@/client/features/idea/IdeaForm/IdeaForm";
import { useAllTagsQuery } from "@/client/features/idea/useAllTagsQuery";
import { __trpc_old } from "@/client/lib/trpc";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/client/lib/utils";
import { PageHeader } from "@/client/ui/PageHeader/PageHeader";
import { Idea, IdeaFormData } from "@/models/idea";
import { RouterInputs } from "@/server/lib/trpc";
import { Routes } from "@/share/routes";
import { Box, Card } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { MdOutlineEdit } from "react-icons/md";

type Props = { idea: Idea };
export const IdeaEditPage: React.FC<Props> = ({ idea }) => {
  const router = useRouter();
  const { allTags } = useAllTagsQuery();

  const updateMutation = useMutation({
    mutationFn: (data: RouterInputs["idea"]["update"]) => {
      return __trpc_old.idea.update.mutate(data);
    },
    onSuccess: () => {
      showSuccessNotification({
        title: "お題の更新",
        message: "お題を更新しました。",
      });
      router.push(Routes.idea(idea.id));
    },
    onError: () => {
      showErrorNotification({
        title: "お題の更新",
        message: "お題を更新できませんでした。",
      });
    },
  });

  const handleUpdateIdea = (data: IdeaFormData) => {
    updateMutation.mutate({ ...data, ideaId: idea.id });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <PageHeader icon={MdOutlineEdit} pageName="お題の編集" />
      <Box w="100%" miw={300} maw={800} m="auto">
        <Card mt="md" style={{ position: "static" }}>
          <IdeaForm
            submitText="更新する"
            allTags={allTags}
            onSubmit={handleUpdateIdea}
            onCancel={handleCancel}
            defaultValues={{ ...idea, tags: idea?.tags.map((t) => t.id) ?? [] }}
            isLoading={updateMutation.isLoading || updateMutation.isSuccess}
          />
        </Card>
      </Box>
    </>
  );
};
