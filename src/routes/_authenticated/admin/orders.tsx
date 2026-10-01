import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateFa, formatToman, toFa } from "@/lib/catalog";
import { adminOrdersQuery, ORDER_STATUS_LABELS, updateOrderStatus } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [
      { title: "مدیریت سفارش‌ها | OHS Plus" },
      { name: "description", content: "پیگیری سفارش‌ها، مشتریان و وضعیت پرداخت در OHS Plus." },
      { property: "og:title", content: "مدیریت سفارش‌ها | OHS Plus" },
      { property: "og:description", content: "فهرست کامل سفارش‌های فروشگاه OHS Plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(adminOrdersQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (!term) return true;
      return [order.full_name, order.email, order.phone, order.id].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      );
    });
  }, [data, search, status]);

  const changeStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => updateOrderStatus(id, next),
    onSuccess: () => {
      toast.success("وضعیت سفارش به‌روزرسانی شد");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminShell
      title="سفارش‌ها"
      description="اطلاعات مشتری، اقلام خریداری‌شده، مبلغ کل و وضعیت پرداخت."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجوی نام، ایمیل یا شماره…"
            className="h-10 w-56"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">مشتری</TableHead>
              <TableHead className="text-right">اقلام</TableHead>
              <TableHead className="text-right">مبلغ کل</TableHead>
              <TableHead className="text-right">تاریخ</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  سفارشی یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="align-top">
                    <p className="font-semibold">{order.full_name}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {order.email}
                    </p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {order.phone}
                    </p>
                    {order.user_id ? null : (
                      <Badge variant="secondary" className="mt-1">
                        مهمان
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <ul className="space-y-1 text-xs">
                      {order.order_items.map((item) => (
                        <li key={item.id}>
                          {item.title} × {toFa(item.quantity)} —{" "}
                          {formatToman(item.unit_price_toman, false)}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="align-top font-bold">
                    {formatToman(order.total_toman, false)}
                  </TableCell>
                  <TableCell className="align-top text-xs">
                    {formatDateFa(order.created_at)}
                  </TableCell>
                  <TableCell className="align-top">
                    <Select
                      value={order.status}
                      onValueChange={(next) => changeStatus.mutate({ id: order.id, next })}
                    >
                      <SelectTrigger className="h-9 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
