import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/Button";
import { useServices } from "../hooks/useServices";
import type { UploadItem } from "../types/domain";

export function UploadPage() {
  const services = useServices();
  const [queue, setQueue] = useState<UploadItem[]>([]);

  const dropzone = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (files) => {
      for (const file of files) {
        const pending: UploadItem = {
          id: crypto.randomUUID(),
          fileName: file.name,
          progress: 12,
          status: "queued"
        };
        setQueue((queue) => [pending, ...queue]);
        const upload = await services.storage.createUploadUrl(file.name, file.type);
        const uploaded = await services.storage.uploadFile(file, upload.uploadUrl);
        const job = await services.processing.requestThumbnailJob(upload.storageKey);
        await services.metadata.createUploadRecord(
          { ...uploaded, status: "complete" },
          upload.storageKey,
          job.thumbnailKey
        );
        setQueue((queue) =>
          queue.map((item) =>
            item.id === pending.id
              ? { ...item, progress: 100, status: "complete" }
              : item
          )
        );
      }
      toast.success("Upload queue completed");
    }
  });

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
            The uploader requests a storage URL, sends the file, asks processing
            for a thumbnail, then writes metadata through the same contracts
            future AWS services will implement.
          </p>
          <div
            {...dropzone.getRootProps()}
            className="focus-ring mt-10 rounded-[2rem] border border-charcoal/10 bg-bone p-10 shadow-soft"
          >
            <input {...dropzone.getInputProps()} />
            <p className="text-lg font-semibold">Drag images here or browse</p>
            <p className="mt-2 text-sm text-charcoal/55">
              Touch devices can tap this area to choose files.
            </p>
            <Button className="mt-6" type="button">
              Choose photos
            </Button>
          </div>
        </div>
      </section>
      {queue.length ? (
        <section className="mt-8 rounded-[2rem] bg-bone p-6 shadow-soft">
          <h2 className="font-serif text-3xl font-semibold">Upload queue</h2>
          <div className="mt-5 space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="rounded-2xl bg-ivory p-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>{item.fileName}</span>
                  <span>{item.status}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-linen">
                  <div
                    className="h-full rounded-full bg-olive transition-all"
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
