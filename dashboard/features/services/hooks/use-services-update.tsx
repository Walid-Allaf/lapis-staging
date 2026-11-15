import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from "@tanstack/react-query"
import { update, create, remove } from "../services"

export function useServicesUpdate() {
  const queryClient = useQueryClient()
    const queryKey = "services"
    const createMutation = useMutation({
        mutationFn: create,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [queryKey] })
    })
    const updateMutation = useMutation({
        mutationFn: update,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [queryKey] })
    })
    const removeMutation = useMutation({
        mutationFn: remove,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [queryKey] })
    })
    return {
        handleUpdate: updateMutation.mutateAsync,
        handleDelete: removeMutation.mutateAsync,
        handleCreate: createMutation.mutateAsync,
    };
};
