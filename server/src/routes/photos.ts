import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import {
  createPhoto,
  getPhoto,
  listAlbums,
  listPhotos,
  patchPhotoFlag,
  renamePhoto,
  createAlbum,
  getAlbum,
  renameAlbum,
  deleteAlbum,
  addPhotosToAlbum,
  removePhotosFromAlbum,
  getDashboardStats
} from "../repositories/photos.js";
import { buildPhotoStorageKey, buildThumbnailStorageKey } from "../s3/keyBuilder.js";
import { createDownloadUrl, createUploadUrl } from "../s3/service.js";

export const photosRouter = Router();
photosRouter.use(requireAuth);

photosRouter.get("/photos", async (request, response, next) => {
  try {
    const query = z
      .object({
        q: z.string().default(""),
        filter: z.string().default("all"),
        sort: z.string().default("newest"),
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
        albumId: z.string().optional()
      })
      .parse(request.query);
    const rows = await listPhotos(request.user!.userId, {
      query: query.q,
      filter: query.filter,
      sort: query.sort,
      limit: query.limit,
      offset: query.offset,
      albumId: query.albumId
    });
    const photosWithUrls = await Promise.all(
      (rows as Record<string, unknown>[]).map(async (row) => {
        const src = await createDownloadUrl(String(row.storage_key));
        return { ...row, src };
      })
    );
    response.json(photosWithUrls);
  } catch (error) {
    next(error);
  }
});

photosRouter.get("/photos/:id", async (request, response, next) => {
  try {
    const photo = await getPhoto(request.user!.userId, request.params.id);
    if (!photo) {
      response.status(404).json({ message: "Photo not found" });
      return;
    }
    const src = await createDownloadUrl(String(photo.storage_key));
    response.json({ ...photo, src });
  } catch (error) {
    next(error);
  }
});

photosRouter.patch("/photos/:id/favorite", async (request, response, next) => {
  try {
    const body = z.object({ isFavorite: z.boolean() }).parse(request.body);
    response.json(
      await patchPhotoFlag(
        request.user!.userId,
        request.params.id,
        "is_favorite",
        body.isFavorite
      )
    );
  } catch (error) {
    next(error);
  }
});

photosRouter.patch("/photos/:id/archive", async (request, response, next) => {
  try {
    const body = z.object({ isArchived: z.boolean() }).parse(request.body);
    response.json(
      await patchPhotoFlag(
        request.user!.userId,
        request.params.id,
        "is_archived",
        body.isArchived
      )
    );
  } catch (error) {
    next(error);
  }
});

photosRouter.delete("/photos/:id", async (request, response, next) => {
  try {
    response.json(
      await patchPhotoFlag(
        request.user!.userId,
        request.params.id,
        "is_deleted",
        true
      )
    );
  } catch (error) {
    next(error);
  }
});

photosRouter.patch("/photos/:id/delete", async (request, response, next) => {
  try {
    const body = z.object({ isDeleted: z.boolean() }).parse(request.body);
    response.json(
      await patchPhotoFlag(
        request.user!.userId,
        request.params.id,
        "is_deleted",
        body.isDeleted
      )
    );
  } catch (error) {
    next(error);
  }
});

photosRouter.patch("/photos/:id", async (request, response, next) => {
  try {
    const body = z.object({ title: z.string().min(1) }).parse(request.body);
    response.json(await renamePhoto(request.user!.userId, request.params.id, body.title));
  } catch (error) {
    next(error);
  }
});

photosRouter.get("/albums", async (request, response, next) => {
  try {
    const albums = await listAlbums(request.user!.userId);
    const albumsWithCover = await Promise.all(
      albums.map(async (album) => {
        let coverPhotoSrc = undefined;
        if (album.coverStorageKey) {
          coverPhotoSrc = await createDownloadUrl(String(album.coverStorageKey));
        }
        return { ...album, coverPhotoSrc };
      })
    );
    response.json(albumsWithCover);
  } catch (error) {
    next(error);
  }
});

photosRouter.get("/albums/:id", async (request, response, next) => {
  try {
    const album = await getAlbum(request.user!.userId, request.params.id);
    if (!album) {
      response.status(404).json({ message: "Album not found" });
      return;
    }
    response.json(album);
  } catch (error) {
    next(error);
  }
});

photosRouter.post("/albums", async (request, response, next) => {
  try {
    const body = z.object({ title: z.string().min(1), description: z.string().optional() }).parse(request.body);
    response.status(201).json(await createAlbum(request.user!.userId, body.title, body.description));
  } catch (error) {
    next(error);
  }
});

photosRouter.patch("/albums/:id", async (request, response, next) => {
  try {
    const body = z.object({ title: z.string().min(1) }).parse(request.body);
    response.json(await renameAlbum(request.user!.userId, request.params.id, body.title));
  } catch (error) {
    next(error);
  }
});

photosRouter.delete("/albums/:id", async (request, response, next) => {
  try {
    response.json(await deleteAlbum(request.user!.userId, request.params.id));
  } catch (error) {
    next(error);
  }
});

photosRouter.post("/albums/:id/photos", async (request, response, next) => {
  try {
    const body = z.object({ photoIds: z.array(z.string()) }).parse(request.body);
    response.json(await addPhotosToAlbum(request.user!.userId, request.params.id, body.photoIds));
  } catch (error) {
    next(error);
  }
});

photosRouter.delete("/albums/:id/photos", async (request, response, next) => {
  try {
    const body = z.object({ photoIds: z.array(z.string()) }).parse(request.body);
    response.json(await removePhotosFromAlbum(request.user!.userId, request.params.id, body.photoIds));
  } catch (error) {
    next(error);
  }
});

photosRouter.get("/dashboard/stats", async (request, response, next) => {
  try {
    response.json(await getDashboardStats(request.user!.userId));
  } catch (error) {
    next(error);
  }
});

photosRouter.post("/uploads/presign", async (request, response, next) => {
  try {
    const body = z
      .object({
        fileName: z.string().min(1),
        contentType: z.string().regex(/^image\//)
      })
      .parse(request.body);
    const assetId = randomUUID();
    const storageKey = buildPhotoStorageKey(request.user!.userId, body.fileName, assetId);
    const thumbnailKey = buildThumbnailStorageKey(request.user!.userId, assetId);
    const uploadUrl = await createUploadUrl({
      key: storageKey,
      contentType: body.contentType
    });
    response.json({ uploadUrl, storageKey, thumbnailKey });
  } catch (error) {
    next(error);
  }
});

photosRouter.post("/uploads/complete", async (request, response, next) => {
  try {
    const body = z
      .object({
        fileName: z.string().min(1),
        storageKey: z.string().min(1),
        thumbnailKey: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        camera: z.string().optional(),
        fileSize: z.number().optional()
      })
      .parse(request.body);
    response.status(201).json(
      await createPhoto({
        userId: request.user!.userId,
        title: body.title || body.fileName.replace(/\.[^.]+$/, ""),
        description: body.description,
        camera: body.camera,
        fileSize: body.fileSize,
        storageKey: body.storageKey,
        thumbnailKey: body.storageKey
      })
    );
  } catch (error) {
    next(error);
  }
});

photosRouter.get("/photos/:id/download-url", async (request, response, next) => {
  try {
    const photo = await getPhoto(request.user!.userId, request.params.id);
    if (!photo || typeof photo !== "object" || !("storage_key" in photo)) {
      response.status(404).json({ message: "Photo not found" });
      return;
    }
    const downloadUrl = await createDownloadUrl(String(photo.storage_key));
    response.redirect(downloadUrl);
  } catch (error) {
    next(error);
  }
});
