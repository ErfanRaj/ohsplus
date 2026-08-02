import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminListQuery, ROLE_LABELS } from "@/lib/admin";
import { formatDateFa } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "مدیریت کاربران | OHS Plus" },
      { name: "description", content: "فهرست کاربران ثبت‌نام‌شده و نقش‌های دسترسی آن‌ها." },
      { property: "og:title", content: "مدیریت کاربران | OHS Plus" },
      { property: "og:description", content: "مشاهده کاربران و نقش‌های OHS Plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const { data: profiles, isLoading } = useQuery(
    adminListQuery("profiles", "id,full_name,phone,company,job_title,created_at"),
  );
  const { data: roles } = useQuery(adminListQuery("user_roles", "user_id,role"));

  const rolesFor = (userId: unknown) =>
    (roles ?? []).filter((r) => r.user_id === userId).map((r) => String(r.role));

  return (
    <AdminShell
      title="کاربران"
      description="فهرست کاربران و نقش‌های آن‌ها. تغییر نقش‌ها از سمت سرور و توسط مدیر ارشد انجام می‌شود."
    >
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">سازمان</TableHead>
              <TableHead className="text-right">سمت</TableHead>
              <TableHead className="text-right">نقش‌ها</TableHead>
              <TableHead className="text-right">تاریخ عضویت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (profiles ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  کاربری یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              (profiles ?? []).map((row) => (
                <TableRow key={String(row.id)}>
                  <TableCell>{String(row.full_name ?? "بدون نام")}</TableCell>
                  <TableCell>{String(row.company ?? "—")}</TableCell>
                  <TableCell>{String(row.job_title ?? "—")}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {rolesFor(row.id).length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        rolesFor(row.id).map((role) => (
                          <Badge key={role} variant="secondary">
                            {ROLE_LABELS[role] ?? role}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDateFa(String(row.created_at ?? ""))}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
