import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileCheck2, Loader2, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const PRODUCT_FILE_BUCKET = "product-files";
export const MAX_PRODUCT_FILE_BYTES = 50 * 1024 * 1024;
const ACCEPT = ".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.dwg,.jpg,.png";

const fmtSize = (b: number | null) =>
  b ? `${(b / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} مگابایت` : "";

type FileRow = { id: string; label: string; storage_path: string | null; size_bytes: number | null };

/** Direct upload / replace / delete of the downloadable file for one product. */
export function ProductFileUploader({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["admin", "product-file", productId];
  const { data: file, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_files")
        .select("id, label, storage_path, size_bytes")
        .eq("product_id", productId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as FileRow | null;
    },
  });
  const [progress, setProgress] = useState<number | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["admin", "product-files"] });
  };

  async function save(patch: { storage_path: string | null; size_bytes: number | null; label?: string }) {
    const { error } = file
      ? await supabase.from("product_files").update(patch).eq("id", file.id)
      : await supabase
          .from("product_files")
          .insert({ product_id: productId, label: patch.label ?? "فایل محصول", version: "1", ...patch });
    if (error) throw error;
  }

  async function handleUpload(selected: File) {
    if (selected.size > MAX_PRODUCT_FILE_BYTES) {
      toast.error("حجم فایل باید کمتر از ۵۰ مگابایت باشد.");
      return;
    }
    const ext = (selected.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${productId}/${crypto.randomUUID()}.${ext}`;
    setProgress(5);
    const timer = setInterval(() => setProgress((p) => Math.min(90, (p ?? 0) + 7)), 300);
    try {
      const { error } = await supabase.storage
        .from(PRODUCT_FILE_BUCKET)
        .upload(path, selected, { contentType: selected.type || "application/octet-stream", upsert: false });
      if (error) throw error;
      const old = file?.storage_path;
      await save({ storage_path: path, size_bytes: selected.size, label: selected.name.slice(0, 120) });
      if (old) await supabase.storage.from(PRODUCT_FILE_BUCKET).remove([old]);
      setProgress(100);
      toast.success("فایل با موفقیت بارگذاری شد");
      refresh();
    } catch (error) {
      console.error("product file upload failed", error);
      toast.error("بارگذاری فایل انجام نشد. دوباره تلاش کنید.");
    } finally {
      clearInterval(timer);
      setTimeout(() => setProgress(null), 600);
    }
  }

  async function handleRemove() {
    if (!file?.storage_path) return;
    try {
      await supabase.storage.from(PRODUCT_FILE_BUCKET).remove([file.storage_path]);
      await save({ storage_path: null, size_bytes: null });
      toast.success("فایل حذف شد");
      refresh();
    } catch {
      toast.error("حذف فایل انجام نشد");
    }
  }

  if (isLoading) return <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />;

  return (
    <div className="space-y-2">
      {file?.storage_path ? (
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
          <FileCheck2 className="size-4 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate" dir="ltr">
            {file.label}
          </span>
          <span className="text-muted-foreground">{fmtSize(file.size_bytes)}</span>
          <Button type="button" size="icon" variant="ghost" className="size-7" aria-label="حذف فایل" onClick={handleRemove}>
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 px-3 py-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/10">
        <Upload className="size-5 text-primary" aria-hidden="true" />
        {file?.storage_path ? "جایگزینی فایل دانلودی" : "انتخاب و آپلود فایل (PDF، ZIP، Word، Excel…)"}
        <input
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={progress !== null}
          onChange={(e) => {
            const selected = e.target.files?.[0];
            e.target.value = "";
            if (selected) handleUpload(selected);
          }}
        />
      </label>
      {progress !== null ? (
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">حداکثر ۵۰ مگابایت. فقط خریداران پس از پرداخت به فایل دسترسی دارند.</p>
    </div>
  );
}
