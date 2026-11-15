import {useQuery} from "@tanstack/react-query"
import {getAll} from "../services"
import type {ServicesFiltersRequestInterface} from "../interfaces"

export const queryKey = "services"

export function useServices(filters: ServicesFiltersRequestInterface) {
    const {data, isLoading, refetch, isRefetching, isError}
        = useQuery({
        queryKey: [queryKey],
        queryFn: () => getAll(filters)
    })

    return {
        queryKey,
        data,
        isLoading,
        refetch,
        isRefetching,
        isError
    };
}
