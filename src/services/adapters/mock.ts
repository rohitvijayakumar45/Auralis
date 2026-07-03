import type { ServiceRegistry } from "../contracts";
import type { Album, PhotoAsset, SearchState, User } from "../../types/domain";

const currentUser: User = {
  id: "user_auralis_01",
  name: "Mira Chen",
  email: "mira@auralis.photos",
  avatarUrl: "https://picsum.photos/seed/mira-portrait/240/240",
  storageUsedGb: 42.8,
  storageLimitGb: 128
};

let photos: PhotoAsset[] = [
  {
    id: "ph_alpine_room",
    title: "Alpine quiet room",
    description: "Soft morning light against linen curtains and warm oak.",
    storageKey: "photos/alpine-quiet-room.jpg",
    thumbnailKey: "thumbnails/alpine-quiet-room.jpg",
    src: "https://picsum.photos/seed/alpine-quiet-room/1600/1200",
    blurSrc: "https://picsum.photos/seed/alpine-quiet-room/32/24",
    width: 1600,
    height: 1200,
    capturedAt: "2026-05-18T08:24:00.000Z",
    createdAt: "2026-05-18T13:24:00.000Z",
    albumIds: ["al_weekend"],
    tags: ["alpine", "interior", "quiet"],
    location: "Arosa, Switzerland",
    camera: "Leica Q3",
    isFavorite: true,
    isArchived: false,
    isDeleted: false
  },
  {
    id: "ph_sage_cliffs",
    title: "Sage cliffs",
    description: "A muted green ridge line above copper grasses.",
    storageKey: "photos/sage-cliffs.jpg",
    thumbnailKey: "thumbnails/sage-cliffs.jpg",
    src: "https://picsum.photos/seed/sage-cliffs/1400/1800",
    blurSrc: "https://picsum.photos/seed/sage-cliffs/28/36",
    width: 1400,
    height: 1800,
    capturedAt: "2026-04-04T18:12:00.000Z",
    createdAt: "2026-04-05T09:02:00.000Z",
    albumIds: ["al_earth"],
    tags: ["landscape", "sage", "travel"],
    location: "Big Sur, California",
    camera: "Sony A7R V",
    isFavorite: false,
    isArchived: false,
    isDeleted: false
  },
  {
    id: "ph_linen_table",
    title: "Linen table study",
    description: "Editorial still life with cream ceramic and late sun.",
    storageKey: "photos/linen-table-study.jpg",
    thumbnailKey: "thumbnails/linen-table-study.jpg",
    src: "https://picsum.photos/seed/linen-table-study/1800/1300",
    blurSrc: "https://picsum.photos/seed/linen-table-study/36/26",
    width: 1800,
    height: 1300,
    capturedAt: "2026-03-12T16:45:00.000Z",
    createdAt: "2026-03-12T17:10:00.000Z",
    albumIds: ["al_studio"],
    tags: ["still-life", "linen", "editorial"],
    location: "Hudson, New York",
    camera: "Fujifilm GFX 100 II",
    isFavorite: true,
    isArchived: false,
    isDeleted: false
  },
  {
    id: "ph_copper_window",
    title: "Copper window",
    description: "A quiet architectural frame washed in terracotta light.",
    storageKey: "photos/copper-window.jpg",
    thumbnailKey: "thumbnails/copper-window.jpg",
    src: "https://picsum.photos/seed/copper-window/1700/1100",
    blurSrc: "https://picsum.photos/seed/copper-window/34/22",
    width: 1700,
    height: 1100,
    capturedAt: "2026-02-21T07:36:00.000Z",
    createdAt: "2026-02-21T11:42:00.000Z",
    albumIds: ["al_studio"],
    tags: ["architecture", "copper", "light"],
    location: "Marrakesh, Morocco",
    camera: "Canon R5",
    isFavorite: false,
    isArchived: false,
    isDeleted: false
  },
  {
    id: "ph_bone_coast",
    title: "Bone coast",
    description: "Low tide, pale stone, and a horizon that barely moves.",
    storageKey: "photos/bone-coast.jpg",
    thumbnailKey: "thumbnails/bone-coast.jpg",
    src: "https://picsum.photos/seed/bone-coast/1900/1200",
    blurSrc: "https://picsum.photos/seed/bone-coast/38/24",
    width: 1900,
    height: 1200,
    capturedAt: "2026-01-16T15:20:00.000Z",
    createdAt: "2026-01-17T10:12:00.000Z",
    albumIds: ["al_earth"],
    tags: ["coast", "minimal", "travel"],
    location: "Puglia, Italy",
    camera: "Nikon Z8",
    isFavorite: false,
    isArchived: false,
    isDeleted: false
  },
  {
    id: "ph_shadow_gallery",
    title: "Shadow gallery",
    description: "Museum corridor with soft silhouettes and stone walls.",
    storageKey: "photos/shadow-gallery.jpg",
    thumbnailKey: "thumbnails/shadow-gallery.jpg",
    src: "https://picsum.photos/seed/shadow-gallery/1300/1700",
    blurSrc: "https://picsum.photos/seed/shadow-gallery/26/34",
    width: 1300,
    height: 1700,
    capturedAt: "2025-12-03T12:02:00.000Z",
    createdAt: "2025-12-03T12:28:00.000Z",
    albumIds: ["al_studio"],
    tags: ["museum", "shadow", "minimal"],
    location: "Paris, France",
    camera: "Leica M11",
    isFavorite: true,
    isArchived: false,
    isDeleted: false
  }
];

const albums: Album[] = [
  {
    id: "al_weekend",
    title: "Quiet Weekends",
    description: "Slow rooms, alpine air, and intimate morning light.",
    coverPhotoId: "ph_alpine_room",
    photoIds: ["ph_alpine_room"],
    updatedAt: "2026-05-18T13:24:00.000Z"
  },
  {
    id: "al_earth",
    title: "Earth Tones",
    description: "Sage, bone, sand, and coastal restraint.",
    coverPhotoId: "ph_sage_cliffs",
    photoIds: ["ph_sage_cliffs", "ph_bone_coast"],
    updatedAt: "2026-04-05T09:02:00.000Z"
  },
  {
    id: "al_studio",
    title: "Studio Notes",
    description: "Still life, galleries, and quiet interiors.",
    coverPhotoId: "ph_linen_table",
    photoIds: ["ph_linen_table", "ph_copper_window", "ph_shadow_gallery"],
    updatedAt: "2026-03-12T17:10:00.000Z"
  }
];

function delay<T>(value: T, ms = 220) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

function updatePhoto(id: string, patch: Partial<PhotoAsset>) {
  photos = photos.map((photo) =>
    photo.id === id ? { ...photo, ...patch } : photo
  );
  const updated = photos.find((photo) => photo.id === id);
  if (!updated) throw new Error("Photo not found");
  return updated;
}

function filterPhotos(search: SearchState) {
  const query = search.query.trim().toLowerCase();
  let result = photos.filter((photo) => !photo.isDeleted);

  if (search.filter === "favorites") {
    result = result.filter((photo) => photo.isFavorite);
  }
  if (search.filter === "archive") {
    result = result.filter((photo) => photo.isArchived);
  }
  if (query) {
    result = result.filter((photo) =>
      [photo.title, photo.description, photo.location, photo.camera, ...photo.tags]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  return result.sort((left, right) => {
    if (search.sort === "name") return left.title.localeCompare(right.title);
    const delta =
      new Date(right.capturedAt).getTime() - new Date(left.capturedAt).getTime();
    return search.sort === "newest" ? delta : -delta;
  });
}

export function createMockServiceAdapters(): ServiceRegistry {
  return {
    auth: {
      getCurrentUser: () => delay(currentUser),
      login: () => delay(currentUser),
      signup: (name, email) => delay({ ...currentUser, name, email }),
      logout: () => delay(undefined)
    },
    storage: {
      createUploadUrl: (fileName) =>
        delay({
          uploadUrl: `mock-s3-presigned://${encodeURIComponent(fileName)}`,
          storageKey: `photos/${crypto.randomUUID()}-${fileName}`
        }),
      uploadFile: (file, uploadUrl) =>
        delay({
          id: crypto.randomUUID(),
          fileName: file.name || uploadUrl,
          progress: 100,
          status: "complete"
        })
    },
    processing: {
      requestThumbnailJob: (storageKey) =>
        delay({
          jobId: `lambda_${crypto.randomUUID()}`,
          thumbnailKey: storageKey.replace("photos/", "thumbnails/")
        })
    },
    metadata: {
      listPhotos: (search) => delay(filterPhotos(search)),
      getPhoto: (id) => delay(photos.find((photo) => photo.id === id)),
      listAlbums: () => delay(albums),
      toggleFavorite: (id, isFavorite) => delay(updatePhoto(id, { isFavorite })),
      archivePhoto: (id, isArchived) => delay(updatePhoto(id, { isArchived })),
      deletePhoto: (id, isDeleted) => delay(updatePhoto(id, { isDeleted })),
      renamePhoto: (id, title) => delay(updatePhoto(id, { title })),
      createUploadRecord: (item, storageKey, thumbnailKey) => {
        const created: PhotoAsset = {
          id: `ph_${item.id}`,
          title: item.fileName.replace(/\.[^.]+$/, ""),
          description: "Newly uploaded and queued for quiet cataloging.",
          storageKey,
          thumbnailKey,
          src: "https://picsum.photos/seed/new-upload/1600/1200",
          blurSrc: "https://picsum.photos/seed/new-upload/32/24",
          width: 1600,
          height: 1200,
          capturedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          albumIds: [],
          tags: ["recently-added"],
          location: "Imported",
          camera: "Unknown",
          isFavorite: false,
          isArchived: false,
          isDeleted: false
        };
        photos = [created, ...photos];
        return delay(created);
      }
    }
  };
}
