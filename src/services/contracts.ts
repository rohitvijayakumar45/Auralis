import type { Album, PhotoAsset, SearchState, UploadItem, User } from "../types/domain";

export type AuthService = {
  getCurrentUser: () => Promise<User>;
  getDashboardStats: () => Promise<{ photoCount: number; albumCount: number; favoriteCount: number; storageUsedBytes: number }>;
  getSettings: () => Promise<unknown>;
  updateSettings: (settings: unknown) => Promise<unknown>;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

export type StorageService = {
  createUploadUrl: (fileName: string, contentType?: string) => Promise<{ uploadUrl: string; storageKey: string; thumbnailKey?: string }>;
  uploadFile: (file: File, uploadUrl: string, options?: { onProgress?: (progress: number) => void; signal?: AbortSignal }) => Promise<UploadItem>;
};

export type ProcessingService = {
  requestThumbnailJob: (storageKey: string) => Promise<{ jobId: string; thumbnailKey: string }>;
};

export type MetadataService = {
  listPhotos: (search: SearchState) => Promise<PhotoAsset[]>;
  getPhoto: (id: string) => Promise<PhotoAsset | undefined>;
  listAlbums: () => Promise<Album[]>;
  getAlbum: (id: string) => Promise<Album | undefined>;
  createAlbum: (title: string, description?: string) => Promise<Album>;
  renameAlbum: (id: string, title: string) => Promise<{ success: boolean }>;
  deleteAlbum: (id: string) => Promise<{ success: boolean }>;
  addPhotosToAlbum: (id: string, photoIds: string[]) => Promise<{ success: boolean }>;
  removePhotosFromAlbum: (id: string, photoIds: string[]) => Promise<{ success: boolean }>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<PhotoAsset>;
  archivePhoto: (id: string, isArchived: boolean) => Promise<PhotoAsset>;
  deletePhoto: (id: string, isDeleted: boolean) => Promise<PhotoAsset>;
  renamePhoto: (id: string, title: string) => Promise<PhotoAsset>;
  createUploadRecord: (item: UploadItem, storageKey: string, thumbnailKey: string) => Promise<PhotoAsset>;
};

export type ServiceRegistry = {
  auth: AuthService;
  storage: StorageService;
  processing: ProcessingService;
  metadata: MetadataService;
};
