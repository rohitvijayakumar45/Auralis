import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, RefreshCw } from "lucide-react";
import { generateId } from "../utils/generateId";
import { toast } from "sonner";
import { Button } from "../components/ui/Button";
import { useQueryClient } from "@tanstack/react-query";
import { useServices } from "../hooks/useServices";
import { photoKeys } from "../hooks/usePhotoData";
import type { UploadItem } from "../types/domain";

type QueueItem = UploadItem & {
  file: File;
  abortController?: AbortController;
  hash?: string;
  error?: string;
};

export function UploadPage() {
  const services = useServices();
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const hashFile = async (file: File) => {
    if (!globalThis.crypto?.subtle) return "";
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const processItem = useCallback(async (item: QueueItem) => {
    const abortController = new AbortController();
    setQueue(q => q.map(i => i.id === item.id ? { ...i, abortController } : i));

    try {
      const hash = await hashFile(item.file);
      setQueue(q => q.map(i => i.id === item.id ? { ...i, hash } : i));

      const upload = await services.storage.createUploadUrl(item.fileName, item.file.type);
      setQueue(q => q.map(i => i.id === item.id ? { ...i, status: "uploading", progress: 0 } : i));
      
      await services.storage.uploadFile(item.file, upload.uploadUrl, {
        signal: abortController.signal,
        onProgress: (progress) => {
          setQueue(q => q.map(i => i.id === item.id ? { ...i, progress } : i));
        }
      });
      
      const job = await services.processing.requestThumbnailJob(upload.storageKey);
      await services.metadata.createUploadRecord(
        { ...item, status: "complete", fileSize: item.file.size },
        upload.storageKey,
        job.thumbnailKey
      );

      setQueue(q => q.map(i => i.id === item.id ? { ...i, status: "complete", progress: 100 } : i));
      queryClient.invalidateQueries({ queryKey: photoKeys.dashboardStats });
    } catch (error: unknown) {
      if (error instanceof Error && (error.name === "AbortError" || error.message === "canceled")) {
        setQueue(q => q.map(i => i.id === item.id ? { ...i, status: "failed", error: "Canceled" } : i));
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed";
        setQueue(q => q.map(i => i.id === item.id ? { ...i, status: "failed", error: errorMessage } : i));
      }
    }
  }, [services, queryClient]);

  useEffect(() => {
    const activeCount = queue.filter(i => i.status === "uploading" || i.status === "processing").length;
    if (activeCount < 3) {
      const nextItem = queue.find(i => i.status === "queued");
      if (nextItem) {
        setQueue(q => q.map(i => i.id === nextItem.id ? { ...i, status: "processing" } : i));
        processItem(nextItem);
      }
    }
  }, [queue, processItem]);

  const dropzone = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    onDrop: async (files, fileRejections) => {
      if (fileRejections.length > 0) {
        toast.error(`${fileRejections.length} files unsupported or too large`);
      }
      
      const newItems = files.map(file => ({
        id: generateId(),
        fileName: file.name,
        title: file.name.replace(/\.[^.]+$/, ""),
        description: "",
        camera: "",
        progress: 0,
        status: "draft" as const,
        file
      }));
      setQueue(q => [...newItems, ...q]);
    }
  });

  const retry = (id: string) => {
    setQueue(q => q.map(i => i.id === id ? { ...i, status: "queued", progress: 0, error: undefined } : i));
  };

  const cancel = (id: string) => {
    setQueue(q => {
      const item = q.find(i => i.id === id);
      if (item?.abortController) item.abortController.abort();
      return q.map(i => i.id === id ? { ...i, status: "failed", error: "Canceled" } : i);
    });
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-10">
      <section className="grid min-h-[560px] place-items-center rounded-[2.5rem] border border-dashed border-charcoal/20 bg-grain-wash p-8 text-center">
        <div className="max-w-2xl">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-charcoal text-bone shadow-soft">
            <UploadCloud className="h-10 w-10" />
          </div>
          <h1 className="mt-10 font-serif text-5xl font-semibold leading-none md:text-7xl">
            Drop a folder. Keep the rhythm.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-charcoal/62">
            Secure, concurrent uploads to your private S3 buckets. Automatic duplicate detection and thumbnail generation included.
          </p>
          <div
            {...dropzone.getRootProps()}
            className="focus-ring mt-10 rounded-[2rem] border border-charcoal/10 bg-bone p-10 shadow-soft"
          >
            <input {...dropzone.getInputProps()} />
            <p className="text-lg font-semibold">Drag images here or browse</p>
            <p className="mt-2 text-sm text-charcoal/55">
              Supports JPEG, PNG, WEBP. Touch devices can tap this area to choose files.
            </p>
            <Button className="mt-6" type="button">
              Choose photos
            </Button>
          </div>
        </div>
      </section>
      {queue.length ? (
        <section className="mt-8 rounded-[2rem] bg-bone p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl font-semibold">Upload queue</h2>
            {queue.some(i => i.status === "draft") && (
              <Button onClick={() => setQueue(q => q.map(i => i.status === "draft" ? { ...i, status: "queued" } : i))}>
                Start Upload
              </Button>
            )}
          </div>
          <div className="mt-5 space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="rounded-2xl bg-ivory p-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="truncate max-w-[60%]">{item.fileName}</span>
                  <div className="flex items-center gap-3">
                    <span className="capitalize">{item.status}</span>
                    {item.error && <span className="text-red-500 text-xs">({item.error})</span>}
                    {item.status === "failed" && (
                      <button onClick={() => retry(item.id)} className="text-charcoal/60 hover:text-charcoal"><RefreshCw size={16} /></button>
                    )}
                    {(item.status === "draft" || item.status === "queued" || item.status === "uploading" || item.status === "processing") && (
                      <button onClick={() => cancel(item.id)} className="text-charcoal/60 hover:text-charcoal"><X size={16} /></button>
                    )}
                  </div>
                </div>
                {item.status === "draft" && (
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <label className="block">
                      <span className="text-xs font-medium text-charcoal/70">Title</span>
                      <input
                        type="text"
                        value={item.title || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQueue(q => q.map(i => i.id === item.id ? { ...i, title: val } : i));
                        }}
                        className="focus-ring mt-1 w-full rounded-xl border border-charcoal/10 bg-bone px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-charcoal/70">Description (Optional)</span>
                      <input
                        type="text"
                        value={item.description || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQueue(q => q.map(i => i.id === item.id ? { ...i, description: val } : i));
                        }}
                        className="focus-ring mt-1 w-full rounded-xl border border-charcoal/10 bg-bone px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-charcoal/70">Camera (Optional)</span>
                      <input
                        type="text"
                        value={item.camera || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQueue(q => q.map(i => i.id === item.id ? { ...i, camera: val } : i));
                        }}
                        className="focus-ring mt-1 w-full rounded-xl border border-charcoal/10 bg-bone px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                )}
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-linen">
                  <div
                    className={`h-full rounded-full transition-all ${item.status === 'failed' ? 'bg-red-500' : 'bg-olive'}`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
