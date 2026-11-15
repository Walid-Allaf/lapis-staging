import { useQuery } from "@tanstack/react-query"
import { getById } from "../services/index";
export function useServicesGetById(id: number) {
    const queryKey = "services"
    const { data, isLoading } =
        useQuery({
            queryKey: [queryKey, id],
            queryFn: () => getById(id),
            enabled: !!id,
        })

    return {
        dataById: data,
        isLoadingByID: isLoading,
    };
};
