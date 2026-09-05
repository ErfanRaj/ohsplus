import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { ImageField } from "@/components/admin/image-field";
import { RichEditor } from "@/components/admin/rich-editor";
import { ArticleContent, KeyTakeaways } from "@/components/catalog/article-content";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { adminListQuery, deleteRow, slugify, STATUS_LABELS, upsertRow } from "@/lib/admin";
import { formatDateFa, toFa } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/articles")({
  head: () => ({
    meta: [
      { title: "مدیریت مقالات | OHS Plus" },
      { name: "description", content: "نگارش و انتشار مقالات دانشنامه ایمنی و بهداشت کار." },
      { property: "og:title", content: "مدیریت مقالات | OHS Plus" },
      { property: "og:description", content: "مدیریت محتوای دانشنامه OHS Plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminArticles,
});

type Row = Record<string, unknown>;

const SELECT =
  "id,title,slug,status,category_id,excerpt,content,content_html,key_takeaways,cover_image_url,reading_minutes,seo_title,seo_description,published_at,created_at";

const EMPTY = {
  title: "",
  slug: "",
  category_id: null as string | null,
  reading_minutes: 5,
  cover_image_url: null as string | null,
  status: "draft",
  excerpt: "",
  content_html: "",
  seo_title: "",
  seo_description: "",
};

function AdminArticles() {
  const queryClient = useQueryClient();
  const listQuery = adminListQuery("articles", SELECT);
  const { data, isLoading } = useQuery(listQuery);
  const { data: categories } = useQuery(adminListQuery("categories", "id,name", "sort_order"));

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [takeaways, setTakeaways] = useState<string[]>([]);
  const [poll, setPoll] = useState({ question: "", options: ["", ""], is_active: true });
  const [pollId, setPollId] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["articles"] });
    queryClient.invalidateQueries({ queryKey: ["article"] });
    queryClient.invalidateQueries({ queryKey: ["article-poll"] });
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setTakeaways([]);
    setPoll({ question: "", options: ["", ""], is_active: true });
    setPollId(null);
    setOpen(true);
  };

  const openEdit = async (row: Row) => {
    setEditing(row);
    setForm({
      title: String(row.title ?? ""),
      slug: String(row.slug ?? ""),
      category_id: (row.category_id as string | null) ?? null,
      reading_minutes: Number(row.reading_minutes ?? 5),
      cover_image_url: (row.cover_image_url as string | null) ?? null,
      status: String(row.status ?? "draft"),
      excerpt: String(row.excerpt ?? ""),
      content_html: String(row.content_html ?? row.content ?? ""),
      seo_title: String(row.seo_title ?? ""),
      seo_description: String(row.seo_description ?? ""),
    });
    setTakeaways(Array.isArray(row.key_takeaways) ? (row.key_takeaways as string[]) : []);
    setOpen(true);

    const { data: existingPoll } = await supabase
      .from("article_polls")
      .select("id, question, options, is_active")
      .eq("article_id", String(row.id))
      .maybeSingle();

    if (existingPoll) {
      setPollId(existingPoll.id);
      setPoll({
        question: existingPoll.question,
        options: Array.isArray(existingPoll.options)
          ? (existingPoll.options as string[])
          : ["", ""],
        is_active: existingPoll.is_active,
      });
    } else {
      setPollId(null);
      setPoll({ question: "", options: ["", ""], is_active: true });
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        category_id: form.category_id,
        reading_minutes: Number(form.reading_minutes) || 1,
        cover_image_url: form.cover_image_url,
        status: form.status,
        excerpt: form.excerpt.trim() || null,
        content_html: form.content_html,
        content: form.content_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        key_takeaways: takeaways.filter((item) => item.trim()),
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        published_at:
          form.status === "published"
            ? ((editing?.published_at as string | null) ?? new Date().toISOString())
            : null,
      };

      await upsertRow("articles", payload, editing ? String(editing.id) : null);

      // Polls need the article id, so they are saved for existing articles only.
      if (editing) {
        const cleanOptions = poll.options.map((option) => option.trim()).filter(Boolean);
        if (poll.question.trim() && cleanOptions.length >= 2) {
          if (pollId) {
            const { error } = await supabase
              .from("article_polls")
              .update({
                question: poll.question.trim(),
                options: cleanOptions,
                is_active: poll.is_active,
              })
              .eq("id", pollId);
            if (error) throw error;
          } else {
            const { error } = await supabase.from("article_polls").insert({
              article_id: String(editing.id),
              question: poll.question.trim(),
              options: cleanOptions,
              is_active: poll.is_active,
            });
            if (error) throw error;
          }
        } else if (pollId) {
          const { error } = await supabase.from("article_polls").delete().eq("id", pollId);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast.success(editing ? "مقاله به‌روزرسانی شد" : "مقاله ثبت شد");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("articles", id, true),
    onSuccess: () => {
      toast.success("مقاله حذف شد");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminShell
      title="مقالات"
      description="نگارش پیشرفته مقالات با متن غنی، نکات کلیدی و نظرسنجی."
      actions={
        <Button onClick={openCreate} className="gap-2 font-semibold">
          <Plus className="size-4" aria-hidden="true" />
          مقاله جدید
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right">نشانی</TableHead>
              <TableHead className="text-right">زمان مطالعه</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">تاریخ ایجاد</TableHead>
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
                  هنوز مقاله‌ای ثبت نشده است.
                </TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((row) => (
                <TableRow key={String(row.id)}>
                  <TableCell className="max-w-64 truncate">{String(row.title ?? "")}</TableCell>
                  <TableCell className="max-w-40 truncate" dir="ltr">
                    {String(row.slug ?? "")}
                  </TableCell>
                  <TableCell>{toFa(Number(row.reading_minutes ?? 0))} دقیقه</TableCell>
                  <TableCell>{STATUS_LABELS[String(row.status)] ?? String(row.status)}</TableCell>
                  <TableCell className="text-xs">
                    {formatDateFa(String(row.created_at ?? ""))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="ویرایش"
                        onClick={() => void openEdit(row)}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="حذف"
                        onClick={() => {
                          if (confirm("این مقاله حذف شود؟")) remove.mutate(String(row.id));
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش مقاله" : "مقاله جدید"}</DialogTitle>
            <DialogDescription>
              متن مقاله را با ابزارهای قالب‌بندی بنویسید و پیش از انتشار پیش‌نمایش بگیرید.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basics">
            <TabsList className="flex-wrap">
              <TabsTrigger value="basics">اطلاعات پایه</TabsTrigger>
              <TabsTrigger value="content">متن مقاله</TabsTrigger>
              <TabsTrigger value="takeaways">نکات کلیدی</TabsTrigger>
              <TabsTrigger value="poll">نظرسنجی</TabsTrigger>
              <TabsTrigger value="preview">پیش‌نمایش</TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="title">عنوان</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                      slug: editing ? prev.slug : slugify(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">نشانی (slug)</Label>
                <Input
                  id="slug"
                  dir="ltr"
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">دسته‌بندی</Label>
                <Select
                  value={form.category_id ?? "__none"}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      category_id: value === "__none" ? null : value,
                    }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">—</SelectItem>
                    {(categories ?? []).map((category) => (
                      <SelectItem key={String(category.id)} value={String(category.id)}>
                        {String(category.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reading">زمان مطالعه (دقیقه)</Label>
                <Input
                  id="reading"
                  type="number"
                  min={1}
                  value={form.reading_minutes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reading_minutes: Number(event.target.value) }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">وضعیت</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-2 block">تصویر شاخص</Label>
                <ImageField
                  value={form.cover_image_url}
                  folder="articles"
                  onChange={(url) => setForm((prev) => ({ ...prev, cover_image_url: url }))}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="excerpt">چکیده</Label>
                <Textarea
                  id="excerpt"
                  rows={3}
                  value={form.excerpt}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, excerpt: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seo_title">عنوان سئو</Label>
                <Input
                  id="seo_title"
                  value={form.seo_title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, seo_title: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seo_description">توضیح سئو</Label>
                <Input
                  id="seo_description"
                  value={form.seo_description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, seo_description: event.target.value }))
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="pt-4">
              <RichEditor
                value={form.content_html}
                onChange={(html) => setForm((prev) => ({ ...prev, content_html: html }))}
              />
            </TabsContent>

            <TabsContent value="takeaways" className="space-y-3 pt-4">
              {takeaways.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    placeholder={`نکته ${toFa(index + 1)}`}
                    onChange={(event) =>
                      setTakeaways((prev) =>
                        prev.map((value, i) => (i === index ? event.target.value : value)),
                      )
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="حذف نکته"
                    onClick={() => setTakeaways((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <X className="size-4 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="gap-2 font-semibold"
                onClick={() => setTakeaways((prev) => [...prev, ""])}
              >
                <Plus className="size-4" aria-hidden="true" />
                افزودن نکته
              </Button>
            </TabsContent>

            <TabsContent value="poll" className="space-y-4 pt-4">
              {editing ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="poll-question">پرسش نظرسنجی</Label>
                    <Input
                      id="poll-question"
                      value={poll.question}
                      placeholder="برای حذف نظرسنجی، این فیلد را خالی بگذارید"
                      onChange={(event) =>
                        setPoll((prev) => ({ ...prev, question: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>گزینه‌ها</Label>
                    {poll.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option}
                          placeholder={`گزینه ${toFa(index + 1)}`}
                          onChange={(event) =>
                            setPoll((prev) => ({
                              ...prev,
                              options: prev.options.map((value, i) =>
                                i === index ? event.target.value : value,
                              ),
                            }))
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="حذف گزینه"
                          onClick={() =>
                            setPoll((prev) => ({
                              ...prev,
                              options: prev.options.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          <X className="size-4 text-destructive" aria-hidden="true" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="gap-2 font-semibold"
                      onClick={() =>
                        setPoll((prev) => ({ ...prev, options: [...prev.options, ""] }))
                      }
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      افزودن گزینه
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="poll-active"
                      checked={poll.is_active}
                      onCheckedChange={(checked) =>
                        setPoll((prev) => ({ ...prev, is_active: checked }))
                      }
                    />
                    <Label htmlFor="poll-active">نظرسنجی فعال باشد</Label>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ابتدا مقاله را ذخیره کنید، سپس می‌توانید برای آن نظرسنجی بسازید.
                </p>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-5 pt-4">
              <h2 className="text-xl font-extrabold">{form.title || "بدون عنوان"}</h2>
              {form.cover_image_url ? (
                <img
                  src={form.cover_image_url}
                  alt=""
                  className="w-full rounded-lg border border-border/70 object-cover"
                />
              ) : null}
              <KeyTakeaways items={takeaways.filter((item) => item.trim())} />
              <ArticleContent html={form.content_html || "<p>متنی وارد نشده است.</p>"} />
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button
              className="gap-2 font-semibold"
              disabled={save.isPending || !form.title.trim()}
              onClick={() => save.mutate()}
            >
              {save.isPending ? (
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
