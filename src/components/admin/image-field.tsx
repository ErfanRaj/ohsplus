import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCEPTED_IMAGE_TYPES, removeImageByUrl, uploadImage } from "@/lib/uploads";

/**
 * Upload / replace / delete a single image and expose its URL to the parent form.
 * Used for product covers and category icons.
 */
export function ImageField({
  value,
  onChange,
  folder,
  label = "تصویر",
  rounded = false,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
  rounded?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const previous = value;
      const { url } = await uploadImage(file, folder);
      onChange(url);
      if (previous) {
        await removeImageByUrl(previous).catch(() => undefined);
      }
      toast.success("تصویر بارگذاری شد");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "بارگذاری تصویر ناموفق بود");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    const previous = value;
    onChange(null);
    if (previous) await removeImageByUrl(previous).catch(() => undefined);
    toast.success("تصویر حذف شد");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div
          className={`flex size-24 shrink-0 items-center justify-center overflow-hidden border border-dashed border-border bg-muted/40 ${
            rounded ? "rounded-full" : "rounded-lg"
          }`}
        >
          {value ? (
            <img src={value} alt={label} className="size-full object-cover" loading="lazy" />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : value ? (
                <RefreshCw className="size-4" aria-hidden="true" />
              ) : (
                <ImagePlus className="size-4" aria-hidden="true" />
              )}
              {value ? "جایگزینی تصویر" : "بارگذاری تصویر"}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive"
                disabled={busy}
                onClick={handleDelete}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                حذف
              </Button>
            ) : null}
          </div>
          <Input
            value={value ?? ""}
            placeholder="یا نشانی تصویر را وارد کنید"
            onChange={(event) => onChange(event.target.value || null)}
            className="h-9 text-xs"
            dir="ltr"
          />
          <p className="text-[11px] text-muted-foreground">
            فرمت‌های PNG، JPG، WEBP، AVIF، GIF و SVG تا ۸ مگابایت.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
