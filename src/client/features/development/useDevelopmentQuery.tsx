import { developmentKeys } from "@/client/features/development/queryKeys";
import { trpc } from "@/client/lib/trpc";
import { useQuery } from "@tanstack/react-query";

type UseDevelopmentQueryArgs = { developmentId: string };

export const useDevelopmentQuery = ({
  developmentId,
}: UseDevelopmentQueryArgs) => {
  const { data: development, ...others } = useQuery({
    queryKey: developmentKeys.detail(developmentId),
    queryFn: () => {
      return trpc.development.get.query({ developmentId: developmentId });
    },
  });

  return { development, ...others };
};
