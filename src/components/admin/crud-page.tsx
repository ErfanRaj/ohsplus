import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { adminListQuery, deleteRow, slugify, upsertRow, type AdminTable } from "@/lib/admin";

export type CrudField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "switch" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  slugFrom?: string;
  full?: boolean;
};

export type CrudColumn = {
  name: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
};

type Row = Record<string, unknown>;

export function CrudPage({
  table,
  title,
  description,
  select,
  columns,
  fields,
  defaults,
  softDelete = true,
  searchKeys = ["title", "name"],
  extraOptions,
}: {
  table: AdminTable;
  title: string;
  description?: string;
  select: string;
  columns: CrudColumn[];
  fields: CrudField[];
  defaults: Row;
  softDelete?: boolean;
  searchKeys?: string[];
  /** Dynamic options resolved at render time, keyed by field name. */
  extraOptions?: Record<string, { value: string; label: string }[]>;
}) {
  const queryClient = useQueryClient();
  const listQuery = adminListQuery(table, select);
  const { data, isLoading } = useQuery(listQuery);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>(defaults);

  const rows = useMemo(() => {
    const list = data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(term)),
    );
  }, [data, search, searchKeys]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["articles"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Row = {};
      for (const field of fields) {
        let value = form[field.name];
        if (field.type === "number") value = Number(value ?? 0);
        if (field.type === "switch") value = Boolean(value);
        if (typeof value === "string" && value.trim() === "") value = null;
        payload[field.name] = value;
      }
      await upsertRow(table, payload, editing ? String(editing.id) : null);
    },
    onSuccess: () => {
      toast.success(editing ? "تغییرات ذخیره شد" : "مورد جدید ثبت شد");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRow(table, id, softDelete),
    onSuccess: () => {
      toast.success("حذف شد");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(defaults);
    setOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    const next: Row = { ...defaults };
    for (const field of fields) next[field.name] = row[field.name] ?? defaults[field.name];
    setForm(next);
    setOpen(true);
  };

  const setValue = (field: CrudField, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [field.name]: value };
      const slugField = fields.find((f) => f.slugFrom === field.name);
      if (slugField && !editing && typeof value === "string") {
        next[slugField.name] = slugify(value);
      }
      return next;
    });
  };

  return (
    <AdminShell
      title={title}
      description={description}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو…"
            className="h-10 w-48"
          />
          <Button onClick={openCreate} className="gap-2 font-semibold">
            <Plus className="size-4" aria-hidden="true" />
            افزودن
          </Button>
        </div>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.name} className="text-right">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="py-10 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  موردی یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={String(row.id)}>
                  {columns.map((column) => (
                    <TableCell key={column.name} className="max-w-64 truncate">
                      {column.render ? column.render(row) : String(row[column.name] ?? "—")}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="ویرایش"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="حذف"
                        onClick={() => {
                          if (confirm("از حذف این مورد مطمئن هستید؟")) {
                            deleteMutation.mutate(String(row.id));
                          }
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `ویرایش ${title}` : `افزودن ${title}`}</DialogTitle>
            <DialogDescription>فیلدهای زیر را تکمیل و ذخیره کنید.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const options = extraOptions?.[field.name] ?? field.options ?? [];
              const value = form[field.name];
              return (
                <div
                  key={field.name}
                  className={
                    field.full || field.type === "textarea" ? "sm:col-span-2 grid gap-2" : "grid gap-2"
                  }
                >
                  <Label htmlFor={`field-${field.name}`}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={`field-${field.name}`}
                      rows={5}
                      value={String(value ?? "")}
                      placeholder={field.placeholder}
                      onChange={(event) => setValue(field, event.target.value)}
                    />
                  ) : field.type === "switch" ? (
                    <Switch
                      id={`field-${field.name}`}
                      checked={Boolean(value)}
                      onCheckedChange={(checked) => setValue(field, checked)}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={value ? String(value) : ""}
                      onValueChange={(next) => setValue(field, next === "__none" ? null : next)}
                    >
                      <SelectTrigger id={`field-${field.name}`}>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">—</SelectItem>
                        {options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`field-${field.name}`}
                      type={field.type === "number" ? "number" : "text"}
                      value={value === null || value === undefined ? "" : String(value)}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        setValue(
                          field,
                          field.type === "number" ? Number(event.target.value) : event.target.value,
                        )
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="gap-2 font-semibold"
            >
              {saveMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
