import type { Album, PhotoAsset, SearchState, UploadItem, User } from "../types/domain";

export type AuthService = {
  getCurrentUser: () => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

export type StorageService = {
  createUploadUrl: (fileName: string, contentType?: string) => Promise<{ uploadUrl: string; storageKey: string; thumbnailKey?: string }>;
  uploadFile: (file: File, uploadUrl: string) => Promise<UploadItem>;
};

export type ProcessingService = {
  requestThumbnailJob: (storageKey: string) => Promise<{ jobId: string; thumbnailKey: string }>;
};

export type MetadataService = {
  listPhotos: (search: SearchState) => Promise<PhotoAsset[]>;
  getPhoto: (id: string) => Promise<PhotoAsset | undefined>;
  listAlbums: () => Promise<Album[]>;
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
