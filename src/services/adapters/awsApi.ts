import axios, { AxiosHeaders, type AxiosInstance } from "axios";
import { generateId } from "../../utils/generateId";
import type { ServiceRegistry } from "../contracts";
import type { PhotoAsset, SearchState, UploadItem, User } from "../../types/domain";

const tokenKey = "auralis.aws.tokens";

type TokenSet = {
  AccessToken?: string;
  IdToken?: string;
  RefreshToken?: string;
};

function readTokens(): TokenSet {
  try {
    return JSON.parse(localStorage.getItem(tokenKey) ?? "{}") as TokenSet;
  } catch {
    return {};
  }
}

function writeTokens(tokens: TokenSet) {
  localStorage.setItem(tokenKey, JSON.stringify(tokens));
}

function authHeaders() {
  const token = readTokens().IdToken ?? readTokens().AccessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toPhoto(row: Record<string, unknown>): PhotoAsset {
  const storageKey = String(row.storage_key ?? row.storageKey ?? "");
  const thumbnailKey = String(row.thumbnail_key ?? row.thumbnailKey ?? storageKey);
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    storageKey,
    thumbnailKey,
    src: String(row.src ?? `${import.meta.env.VITE_API_URL ?? "/api"}/photos/${row.id}/download-url`),
    blurSrc: String(row.blurSrc ?? "https://picsum.photos/seed/auralis-blur/32/24"),
    width: Number(row.width ?? 1600),
    height: Number(row.height ?? 1200),
    capturedAt: String(row.captured_at ?? row.capturedAt ?? row.created_at ?? new Date().toISOString()),
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    albumIds: [],
    tags: [],
    location: String(row.location ?? "Imported"),
    camera: String(row.camera ?? "Unknown"),
    isFavorite: Boolean(row.is_favorite ?? row.isFavorite),
    isArchived: Boolean(row.is_archived ?? row.isArchived),
    isDeleted: Boolean(row.is_deleted ?? row.isDeleted)
  };
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "/api",
    timeout: 30000
  });
  client.interceptors.request.use((config) => {
    const headers = new AxiosHeaders(config.headers);
    const token = authHeaders().Authorization;
    if (token) headers.set("Authorization", token);
    config.headers = headers;
    return config;
  });
  
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const tokens = readTokens();
        if (tokens.RefreshToken) {
          try {
            const { data } = await axios.post(`${client.defaults.baseURL}/auth/refresh`, {
              refreshToken: tokens.RefreshToken
            });
            writeTokens({ ...tokens, ...data });
            if (originalRequest.headers) {
               originalRequest.headers["Authorization"] = `Bearer ${data.IdToken ?? data.AccessToken}`;
            }
            return client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem(tokenKey);
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        } else {
          localStorage.removeItem(tokenKey);
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export function createAwsApiAdapters(): ServiceRegistry {
  const client = createClient();
  return {
    auth: {
      async getCurrentUser() {
        const { data } = await client.get("/auth/me");
        return {
          id: String(data.id),
          name: String(data.name),
          email: String(data.email),
          avatarUrl: String(data.avatarUrl ?? data.avatar_url ?? ""),
          storageUsedGb: Number(data.storageUsedBytes ?? 0) / 1_073_741_824,
          storageLimitGb: Number(data.storageLimitBytes ?? 137_438_953_472) / 1_073_741_824
        } satisfies User;
      },
      async getDashboardStats() {
        const { data } = await client.get("/dashboard/stats");
        return data;
      },
      async getSettings() {
        const { data } = await client.get("/auth/settings");
        return data;
      },
      async updateSettings(settings: unknown) {
        const { data } = await client.patch("/auth/settings", settings);
        return data;
      },
      async login(email, password) {
        const { data } = await client.post("/auth/login", { email, password });
        writeTokens(data);
        return this.getCurrentUser();
      },
      async signup(name, email, password) {
        await client.post("/auth/signup", { name, email, password });
        return {
          id: "pending",
          name,
          email,
          avatarUrl: "",
          storageUsedGb: 0,
          storageLimitGb: 128
        };
      },
      async logout() {
        localStorage.removeItem(tokenKey);
        window.location.href = "/login";
      }
    },
    storage: {
      async createUploadUrl(fileName, contentType) {
        const { data } = await client.post("/uploads/presign", {
          fileName,
          contentType: contentType || "image/jpeg"
        });
        return data;
      },
      async uploadFile(file: File, uploadUrl: string, options?: { onProgress?: (progress: number) => void; signal?: AbortSignal }) {
        await axios.put(uploadUrl, file, {
          headers: { "Content-Type": file.type || "image/jpeg" },
          signal: options?.signal,
          onUploadProgress: (progressEvent) => {
            if (options?.onProgress && progressEvent.total) {
              options.onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
          }
        });
        return {
          id: generateId(),
          fileName: file.name,
          progress: 100,
          status: "complete"
        } satisfies UploadItem;
      }
    },
    processing: {
      async requestThumbnailJob(storageKey) {
        return {
          jobId: "s3-lambda-trigger",
          thumbnailKey: storageKey
            .replace("/photos/", "/thumbnails/")
            .replace(/\.[^.]+$/, ".webp")
        };
      }
    },
    metadata: {
      async listPhotos(search: SearchState) {
        const { data } = await client.get("/photos", {
          params: {
            q: search.query,
            filter: search.filter,
            sort: search.sort,
            limit: search.limit,
            offset: search.offset,
            albumId: search.albumId
          }
        });
        return data.map(toPhoto);
      },
      async getPhoto(id) {
        const { data } = await client.get(`/photos/${id}`);
        return toPhoto(data);
      },
      async listAlbums() {
        const { data } = await client.get("/albums");
        return data.map((album: Record<string, unknown>) => ({
          id: String(album.id),
          title: String(album.title),
          description: String(album.description ?? ""),
          coverPhotoId: String(album.coverPhotoId ?? ""),
          coverPhotoSrc: album.coverPhotoSrc ? String(album.coverPhotoSrc) : undefined,
          photoIds: Array.isArray(album.photoIds) ? album.photoIds.map(String) : [],
          updatedAt: String(album.updatedAt ?? new Date().toISOString())
        }));
      },
      async getAlbum(id) {
        const { data } = await client.get(`/albums/${id}`);
        return {
          id: String(data.id),
          title: String(data.title),
          description: String(data.description ?? ""),
          coverPhotoId: String(data.coverPhotoId ?? ""),
          photoIds: Array.isArray(data.photoIds) ? data.photoIds.map(String) : [],
          updatedAt: String(data.updatedAt ?? new Date().toISOString())
        };
      },
      async createAlbum(title, description) {
        const { data } = await client.post("/albums", { title, description });
        return {
          id: String(data.id),
          title: String(data.title),
          description: String(data.description ?? ""),
          coverPhotoId: String(data.coverPhotoId ?? ""),
          photoIds: Array.isArray(data.photoIds) ? data.photoIds.map(String) : [],
          updatedAt: String(data.updatedAt ?? new Date().toISOString())
        };
      },
      async renameAlbum(id, title) {
        const { data } = await client.patch(`/albums/${id}`, { title });
        return data;
      },
      async deleteAlbum(id) {
        const { data } = await client.delete(`/albums/${id}`);
        return data;
      },
      async addPhotosToAlbum(id, photoIds) {
        const { data } = await client.post(`/albums/${id}/photos`, { photoIds });
        return data;
      },
      async removePhotosFromAlbum(id, photoIds) {
        const { data } = await client.delete(`/albums/${id}/photos`, { data: { photoIds } });
        return data;
      },
      async toggleFavorite(id, isFavorite) {
        const { data } = await client.patch(`/photos/${id}/favorite`, { isFavorite });
        return toPhoto(data);
      },
      async archivePhoto(id, isArchived) {
        const { data } = await client.patch(`/photos/${id}/archive`, { isArchived });
        return toPhoto(data);
      },
      async deletePhoto(id, isDeleted) {
        const { data } = await client.patch(`/photos/${id}/delete`, { isDeleted });
        return toPhoto(data);
      },
      async renamePhoto(id, title) {
        const { data } = await client.patch(`/photos/${id}`, { title });
        return toPhoto(data);
      },
      async createUploadRecord(item, storageKey, thumbnailKey) {
        const { data } = await client.post("/uploads/complete", {
          fileName: item.fileName,
          title: item.title,
          description: item.description,
          camera: item.camera,
          fileSize: item.fileSize,
          storageKey,
          thumbnailKey
        });
        return toPhoto(data);
      }
    }
  };
}
