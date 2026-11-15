import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { create, remove, update } from '../services'
import { queryKey } from './use-youtube-galleries'

export function useYouTubeGalleriesUpdate() {
  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
  })

  const updateMutation = useMutation({
    mutationFn: update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
  })

  const removeMutation = useMutation({
    mutationFn: remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
  })

  return {
    handleUpdate: updateMutation.mutateAsync,
    handleDelete: removeMutation.mutateAsync,
    handleCreate: createMutation.mutateAsync
  }
}
