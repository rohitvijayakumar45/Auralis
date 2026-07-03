export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  storageUsedGb: number;
  storageLimitGb: number;
};

export type PhotoAsset = {
  id: string;
  title: string;
  description: string;
  storageKey: string;
  thumbnailKey: string;
  src: string;
  blurSrc: string;
  width: number;
  height: number;
  capturedAt: string;
  createdAt: string;
  albumIds: string[];
  tags: string[];
  location: string;
  camera: string;
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
};

export type Album = {
  id: string;
  title: string;
  description: string;
  coverPhotoId: string;
  photoIds: string[];
  updatedAt: string;
};

export type Collection = {
  id: string;
  title: string;
  description: string;
  photoIds: string[];
};

export type UploadItem = {
  id: string;
  fileName: string;
  progress: number;
  status: "queued" | "uploading" | "processing" | "complete" | "failed";
};

export type SearchState = {
  query: string;
  filter: "all" | "favorites" | "albums" | "archive";
  sort: "newest" | "oldest" | "name";
  view: "grid" | "list";
};

export type ActivityEvent = {
  id: string;
  label: string;
  createdAt: string;
};

export type UndoAction = {
  id: string;
  label: string;
  run: () => Promise<void>;
};
