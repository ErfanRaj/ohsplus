import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminListQuery, deleteRow, upsertRow } from "@/lib/admin";
import { formatDateFa, toFa } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  head: () => ({
    meta: [
      { title: "مدیریت دیدگاه‌ها | OHS Plus" },
      { name: "description", content: "بررسی و تایید دیدگاه‌های کاربران درباره محصولات HSE." },
      { property: "og:title", content: "مدیریت دیدگاه‌ها | OHS Plus" },
      { property: "og:description", content: "تایید یا رد دیدگاه‌های کاربران OHS Plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminReviews,
});

function AdminReviews() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    adminListQuery("reviews", "id,rating,body,is_approved,created_at,product_id,user_id"),
  );
  const { data: products } = useQuery(adminListQuery("products", "id,title"));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const toggle = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      upsertRow("reviews", { is_approved: approved }, id),
    onSuccess: () => {
      toast.success("وضعیت دیدگاه به‌روزرسانی شد");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("reviews", id, true),
    onSuccess: () => {
      toast.success("دیدگاه حذف شد");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const productName = (id: unknown) =>
    products?.find((p) => p.id === id)?.title ? String(products.find((p) => p.id === id)?.title) : "—";

  return (
    <AdminShell title="دیدگاه‌ها" description="تایید، رد یا حذف دیدگاه‌های ثبت‌شده توسط کاربران.">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">محصول</TableHead>
              <TableHead className="text-right">امتیاز</TableHead>
              <TableHead className="text-right">متن</TableHead>
              <TableHead className="text-right">تاریخ</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  هنوز دیدگاهی ثبت نشده است.
                </TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((row) => (
                <TableRow key={String(row.id)}>
                  <TableCell className="max-w-48 truncate">{productName(row.product_id)}</TableCell>
                  <TableCell>{toFa(Number(row.rating ?? 0))}</TableCell>
                  <TableCell className="max-w-72 truncate">{String(row.body ?? "—")}</TableCell>
                  <TableCell>{formatDateFa(String(row.created_at ?? ""))}</TableCell>
                  <TableCell>
                    <Badge variant={row.is_approved ? "default" : "secondary"}>
                      {row.is_approved ? "تایید شده" : "در انتظار"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={row.is_approved ? "لغو تایید" : "تایید"}
                        onClick={() =>
                          toggle.mutate({ id: String(row.id), approved: !row.is_approved })
                        }
                      >
                        {row.is_approved ? (
                          <X className="size-4" aria-hidden="true" />
                        ) : (
                          <Check className="size-4 text-primary" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="حذف"
                        onClick={() => {
                          if (confirm("این دیدگاه حذف شود؟")) remove.mutate(String(row.id));
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
