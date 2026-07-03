import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServices } from "./useServices";
import type { PhotoAsset, SearchState } from "../types/domain";

export const photoKeys = {
  all: ["photos"] as const,
  list: (search: SearchState) => [...photoKeys.all, search] as const,
  detail: (id: string) => [...photoKeys.all, "detail", id] as const,
  albums: ["albums"] as const,
  user: ["user"] as const,
  dashboardStats: ["dashboardStats"] as const,
  settings: ["settings"] as const
};

export function useCurrentUser() {
  const services = useServices();
  return useQuery({
    queryKey: photoKeys.user,
    queryFn: services.auth.getCurrentUser
  });
}

export function usePhotos(search: SearchState) {
  const services = useServices();
  return useInfiniteQuery({
    queryKey: photoKeys.list(search),
    queryFn: ({ pageParam = 0 }) => services.metadata.listPhotos({ ...search, offset: pageParam, limit: 50 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 50 ? allPages.length * 50 : undefined;
    }
  });
}

export function usePhoto(photoId: string) {
  const services = useServices();
  return useQuery({
    queryKey: photoKeys.detail(photoId),
    queryFn: () => services.metadata.getPhoto(photoId)
  });
}

export function useAlbums() {
  const services = useServices();
  return useQuery({
    queryKey: photoKeys.albums,
    queryFn: services.metadata.listAlbums
  });
}

export function useDashboardStats() {
  const services = useServices();
  return useQuery({
    queryKey: photoKeys.dashboardStats,
    queryFn: services.auth.getDashboardStats
  });
}

export function useSettings() {
  const services = useServices();
  return useQuery({
    queryKey: photoKeys.settings,
    queryFn: services.auth.getSettings
  });
}

export function useUpdateSettings() {
  const services = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.auth.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(photoKeys.settings, data);
      toast.success("Settings updated");
    }
  });
}

function patchPhotoInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  patch: Partial<PhotoAsset>
) {
  queryClient.setQueriesData<unknown>({ queryKey: photoKeys.all }, (old: unknown) => {
    if (!old) return old;
    if (Array.isArray(old)) {
      return old.map((photo: PhotoAsset) => (photo.id === id ? { ...photo, ...patch } : photo));
    }
    const infiniteOld = old as { pages?: PhotoAsset[][] };
    if (infiniteOld.pages) {
      return {
        ...infiniteOld,
        pages: infiniteOld.pages.map((page: PhotoAsset[]) =>
          page.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo))
        )
      };
    }
    return old;
  });
  queryClient.setQueryData<PhotoAsset>(photoKeys.detail(id), (old: PhotoAsset | undefined) =>
    old ? { ...old, ...patch } : old
  );
}

export function usePhotoActions(search: SearchState) {
  const services = useServices();
  const queryClient = useQueryClient();

  const favorite = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      services.metadata.toggleFavorite(id, value),
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all });
      patchPhotoInCache(queryClient, id, { isFavorite: value });
      return { id, value };
    },
    onError: (_error, variables) => {
      patchPhotoInCache(queryClient, variables.id, {
        isFavorite: !variables.value
      });
      toast.error("Favorite change could not be saved.");
    },
    onSuccess: (_data, variables) => {
      toast("Updated favorites", {
        action: {
          label: "Undo",
          onClick: () =>
            services.metadata
              .toggleFavorite(variables.id, !variables.value)
              .then(() => queryClient.invalidateQueries({ queryKey: photoKeys.all }))
        }
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: photoKeys.list(search) })
  });

  const archive = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      services.metadata.archivePhoto(id, value),
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all });
      patchPhotoInCache(queryClient, id, { isArchived: value });
      return { id, value };
    },
    onError: (_error, variables) => {
      patchPhotoInCache(queryClient, variables.id, { isArchived: !variables.value });
      toast.error("Archive change could not be saved.");
    },
    onSuccess: (_data, variables) => {
      toast(variables.value ? "Photo archived" : "Photo restored", {
        action: {
          label: "Undo",
          onClick: () =>
            services.metadata
              .archivePhoto(variables.id, !variables.value)
              .then(() => queryClient.invalidateQueries({ queryKey: photoKeys.all }))
        }
      });
    }
  });

  const remove = useMutation({
    mutationFn: (id: string) => services.metadata.deletePhoto(id, true),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: photoKeys.all });
      patchPhotoInCache(queryClient, id, { isDeleted: true });
      return { id };
    },
    onError: (_error, id) => {
      patchPhotoInCache(queryClient, id, { isDeleted: false });
      toast.error("Delete could not be saved.");
    },
    onSuccess: (_data, id) => {
      toast("Photo moved to recently deleted", {
        action: {
          label: "Undo",
          onClick: () =>
            services.metadata
              .deletePhoto(id, false)
              .then(() => queryClient.invalidateQueries({ queryKey: photoKeys.all }))
        }
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: photoKeys.list(search) })
  });

  return { favorite, archive, remove };
}
