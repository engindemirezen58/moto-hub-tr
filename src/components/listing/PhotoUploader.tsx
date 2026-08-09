import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const MAX_PHOTOS = 15;
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Tarayıcıda görseli küçültüp JPEG olarak sıkıştırır. */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.82),
  );
}

type Props = {
  value: string[];
  onChange: (photos: string[]) => void;
};

export function PhotoUploader({ value, onChange }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!user) {
      toast.error("Fotoğraf yüklemek için giriş yapmalısınız.");
      return;
    }
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    if (value.length + list.length > MAX_PHOTOS) {
      toast.error(`En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.`);
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    for (const file of list) {
      try {
        const blob = await compressImage(file);
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from("listing-photos")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (error) throw error;
        const { data } = await supabase.storage
          .from("listing-photos")
          .createSignedUrl(path, ONE_YEAR);
        if (data?.signedUrl) uploaded.push(data.signedUrl);
      } catch {
        toast.error(`${file.name} yüklenemedi.`);
      }
    }
    setUploading(false);
    if (uploaded.length) {
      onChange([...value, ...uploaded]);
      toast.success(`${uploaded.length} fotoğraf yüklendi.`);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-primary bg-accent" : "border-border bg-muted/40 hover:bg-muted"
        }`}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-primary" />
        ) : (
          <ImagePlus className="size-6 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">Fotoğrafları sürükleyip bırakın</p>
        <p className="text-xs text-muted-foreground">
          veya tıklayarak seçin — en fazla {MAX_PHOTOS} adet, otomatik sıkıştırılır
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {value.map((url, index) => (
            <li key={url} className="group relative overflow-hidden rounded-lg border border-border">
              <img
                src={url}
                alt={`Yüklenen fotoğraf ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                  Kapak
                </span>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1 top-1 size-6"
                onClick={() => onChange(value.filter((p) => p !== url))}
                aria-label="Fotoğrafı kaldır"
              >
                <X className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
