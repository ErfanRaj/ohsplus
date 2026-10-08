import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2, Loader2, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/files")({
  head: () => ({
    meta: [
      { title: "لینک دانلود محصولات | OHS Plus" },
      { name: "description", content: "ثبت و ویرایش لینک دانلود فایل هر محصول دیجیتال." },
      { property: "og:title", content: "لینک دانلود محصولات | OHS Plus" },
      { property: "og:description", content: "مدیریت تحویل فایل دیجیتال خریداران OHS Plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminFiles,
});

type ProductFile = {
  id: string;
  product_id: string;
  label: string;
  version: string;
  download_url: string | null;
  storage_path: string | null;
  size_bytes: number | null;
};

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ACCEPT = ".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.dwg,.jpg,.png";
const fmtSize = (b: number | null) => (b ? `${(b / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} مگابایت` : "");

const filesQuery = {
  queryKey: ["admin", "product-files"],
  queryFn: async () => {
    const [products, files] = await Promise.all([
      supabase
        .from("products")
        .select("id, title, slug")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("product_files")
        .select("id, product_id, label, version, download_url, storage_path, size_bytes")
        .is("deleted_at", null),
    ]);
    if (products.error) throw products.error;
    if (files.error) throw files.error;
    return {
      products: products.data ?? [],
      files: (files.data ?? []) as unknown as ProductFile[],
    };
  },
};

function AdminFiles() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(filesQuery);
  const [links, setLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const file of data.files) next[file.product_id] = file.download_url ?? "";
    setLinks(next);
  }, [data]);

  const save = useMutation({
    mutationFn: async (productId: string) => {
      const url = (links[productId] ?? "").trim();
      const existing = data?.files.find((file) => file.product_id === productId);
      if (existing) {
        const { error } = await supabase
          .from("product_files")
          .update({ download_url: url || null })
          .eq("id", existing.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("product_files").insert({
        product_id: productId,
        label: "فایل محصول",
        version: "1",
        download_url: url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("لینک دانلود ذخیره شد");
      queryClient.invalidateQueries({ queryKey: ["admin", "product-files"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const [uploading, setUploading] = useState<Record<string, number>>({});

  async function upsertFile(productId: string, patch: { storage_path?: string | null; size_bytes?: number | null; label?: string }) {
    const existing = data?.files.find((file) => file.product_id === productId);
    const { error } = existing
      ? await supabase.from("product_files").update(patch).eq("id", existing.id)
      : await supabase
          .from("product_files")
          .insert({ product_id: productId, label: "فایل محصول", version: "1", ...patch });
    if (error) throw error;
  }

  async function handleUpload(productId: string, file: File) {
    if (file.size > MAX_FILE_BYTES) return toast.error("حجم فایل باید کمتر از ۵۰ مگابایت باشد.");
    const existing = data?.files.find((f) => f.product_id === productId);
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${productId}/${crypto.randomUUID()}.${ext}`;
    setUploading((p) => ({ ...p, [productId]: 0 }));
    const timer = setInterval(
      () => setUploading((p) => ({ ...p, [productId]: Math.min(90, (p[productId] ?? 0) + 7) })),
      300,
    );
    try {
      const { error } = await supabase.storage
        .from("product-files")
        .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (error) throw error;
      await upsertFile(productId, { storage_path: path, size_bytes: file.size, label: file.name.slice(0, 120) });
      if (existing?.storage_path) await supabase.storage.from("product-files").remove([existing.storage_path]);
      setUploading((p) => ({ ...p, [productId]: 100 }));
      toast.success("فایل با موفقیت بارگذاری شد");
      queryClient.invalidateQueries({ queryKey: ["admin", "product-files"] });
    } catch {
      toast.error("بارگذاری فایل انجام نشد. دوباره تلاش کنید.");
    } finally {
      clearInterval(timer);
      setTimeout(() => setUploading((p) => { const n = { ...p }; delete n[productId]; return n; }), 600);
    }
  }

  async function handleRemove(productId: string) {
    const existing = data?.files.find((f) => f.product_id === productId);
    if (!existing?.storage_path) return;
    try {
      await supabase.storage.from("product-files").remove([existing.storage_path]);
      await upsertFile(productId, { storage_path: null, size_bytes: null });
      toast.success("فایل حذف شد");
      queryClient.invalidateQueries({ queryKey: ["admin", "product-files"] });
    } catch {
      toast.error("حذف فایل انجام نشد");
    }
  }

  return (
    <AdminShell
      title="لینک دانلود محصولات"
      description="برای هر محصول فایل را مستقیم بارگذاری کنید (حداکثر ۵۰ مگابایت) یا لینک خارجی وارد کنید. فایل فقط پس از پرداخت موفق در دسترس خریدار است."
    >
      {isLoading ? (
        <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" aria-hidden="true" />
      ) : (
        <ul className="space-y-3">
          {(data?.products ?? []).map((product) => (
            <li
              key={String(product.id)}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <p className="truncate text-sm font-bold">{String(product.title)}</p>
                <ProductFileUploader productId={String(product.id)} />
                <p className="text-xs text-muted-foreground">یا لینک خارجی:</p>
                <Input
                  dir="ltr"
                  placeholder="https://…"
                  value={links[String(product.id)] ?? ""}
                  onChange={(event) =>
                    setLinks((prev) => ({ ...prev, [String(product.id)]: event.target.value }))
                  }
                />
              </div>
              <Button
                type="button"
                className="gap-2 font-semibold"
                disabled={save.isPending}
                onClick={() => save.mutate(String(product.id))}
              >
                <Save className="size-4" aria-hidden="true" />
                ذخیره
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
