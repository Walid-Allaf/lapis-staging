import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from "@tanstack/react-query"
import { update } from "../services"

export function useSettingUpdate() {
  const queryClient = useQueryClient()
    const queryKey = "setting"
    const updateMutation = useMutation({
        mutationFn: update,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [queryKey] })
    })
    return {
        handleUpdate: updateMutation.mutateAsync,
    };
};
