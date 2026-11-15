import { useQuery } from "@tanstack/react-query"
import { getAll } from "../services"

export const queryKey = "setting"
export function useSetting() {
  const { data, isLoading, refetch, isRefetching, isError }
    = useQuery({
      queryKey: [queryKey],
      queryFn: () => getAll()
    })
  return {
    queryKey,
    dataAll:data,
    isLoading,
    refetch,
    isRefetching,
    isError
  };
};