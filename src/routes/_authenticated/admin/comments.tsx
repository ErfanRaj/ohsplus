import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateFa } from "@/lib/catalog";
import { COMMENT_STATUS_LABELS, deleteComment, moderateComment } from "@/lib/comments";

export const Route = createFileRoute("/_authenticated/admin/comments")({
  head: () => ({
    meta: [
      { title: "مدیریت دیدگاه‌ها | OHS Plus" },
      { name: "description", content: "بررسی، تأیید یا رد دیدگاه‌های کاربران روی محصولات و مقالات." },
      { property: "og:title", content: "مدیریت دیدگاه‌ها | OHS Plus" },
      { property: "og:description", content: "کارتابل بررسی دیدگاه‌های کاربران OHS Plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminComments,
});

type AdminCommentRow = {
  id: string;
  body: string;
  author_name: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  products: { title: string; slug: string } | null;
  articles: { title: string; slug: string } | null;
};

const FILTERS = [
  { value: "pending", label: "در انتظار تأیید" },
  { value: "approved", label: "تأیید شده" },
  { value: "rejected", label: "رد شده" },
  { value: "all", label: "همه" },
] as const;

function AdminComments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "comments", filter],
    queryFn: async () => {
      let query = supabase
        .from("comments")
        .select(
          "id, body, author_name, status, created_at, products(title, slug), articles(title, slug)",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter !== "all") query = query.eq("status", filter);
      const { data: rows, error } = await query;
      if (error) throw error;
      return (rows ?? []) as unknown as AdminCommentRow[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
    queryClient.invalidateQueries({ queryKey: ["comments"] });
  };

  const moderate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      moderateComment(id, status, user!.id),
    onSuccess: () => {
      toast.success("وضعیت دیدگاه به‌روزرسانی شد");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      toast.success("دیدگاه حذف شد");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminShell
      title="دیدگاه‌ها"
      description="دیدگاه‌های کاربران تا زمان تأیید در سایت نمایش داده نمی‌شوند."
      actions={
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={filter === item.value ? "default" : "outline"}
              className="font-semibold"
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">متن دیدگاه</TableHead>
              <TableHead className="text-right">کاربر</TableHead>
              <TableHead className="text-right">مربوط به</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">تاریخ</TableHead>
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
                  دیدگاهی در این وضعیت وجود ندارد.
                </TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-96 whitespace-normal text-sm leading-7">
                    {row.body}
                  </TableCell>
                  <TableCell>{row.author_name ?? "—"}</TableCell>
                  <TableCell className="max-w-48 truncate">
                    {row.products?.title ?? row.articles?.title ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === "approved" ? "default" : "secondary"}>
                      {COMMENT_STATUS_LABELS[row.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatDateFa(row.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="تأیید دیدگاه"
                        disabled={row.status === "approved" || moderate.isPending}
                        onClick={() => moderate.mutate({ id: row.id, status: "approved" })}
                      >
                        <Check className="size-4 text-primary" aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="رد دیدگاه"
                        disabled={row.status === "rejected" || moderate.isPending}
                        onClick={() => moderate.mutate({ id: row.id, status: "rejected" })}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="حذف دیدگاه"
                        onClick={() => {
                          if (confirm("این دیدگاه حذف شود؟")) remove.mutate(row.id);
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
