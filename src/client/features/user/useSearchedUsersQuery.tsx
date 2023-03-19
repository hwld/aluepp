import { useQuery } from "@tanstack/react-query";
import { trpc } from "../../lib/trpc";

export const searchedUsersQueryKey = (userName: string) => [
  "userName",
  userName,
];

export const useSearchedUsersQuery = (userName: string) => {
  const { data: resultUserNames, ...others } = useQuery({
    queryKey: searchedUsersQueryKey(userName),
    queryFn: () => {
      return trpc.user.search.query({ userName: userName });
    },
    keepPreviousData: true,
  });
  return { resultUserNames, ...others };
};
