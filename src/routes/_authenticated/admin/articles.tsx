import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CrudPage } from "@/components/admin/crud-page";
import { adminListQuery, STATUS_LABELS } from "@/lib/admin";
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

function AdminArticles() {
  const { data: categories } = useQuery(adminListQuery("categories", "id,name", "sort_order"));

  return (
    <CrudPage
      table="articles"
      title="مقاله"
      description="مدیریت مقالات دانشنامه، زمان مطالعه و وضعیت انتشار."
      select="id,title,slug,status,category_id,excerpt,content,cover_image_url,reading_minutes,seo_title,seo_description,published_at,created_at"
      searchKeys={["title", "slug"]}
      columns={[
        { name: "title", label: "عنوان" },
        { name: "slug", label: "نشانی" },
        {
          name: "reading_minutes",
          label: "زمان مطالعه",
          render: (row) => `${toFa(Number(row.reading_minutes ?? 0))} دقیقه`,
        },
        {
          name: "status",
          label: "وضعیت",
          render: (row) => STATUS_LABELS[String(row.status)] ?? String(row.status),
        },
        {
          name: "created_at",
          label: "تاریخ ایجاد",
          render: (row) => formatDateFa(String(row.created_at ?? "")),
        },
      ]}
      extraOptions={{
        category_id: (categories ?? []).map((c) => ({
          value: String(c.id),
          label: String(c.name),
        })),
      }}
      fields={[
        { name: "title", label: "عنوان", type: "text" },
        { name: "slug", label: "نشانی (slug)", type: "text", slugFrom: "title" },
        { name: "category_id", label: "دسته‌بندی", type: "select" },
        { name: "reading_minutes", label: "زمان مطالعه (دقیقه)", type: "number" },
        { name: "cover_image_url", label: "تصویر شاخص (URL)", type: "text" },
        {
          name: "status",
          label: "وضعیت",
          type: "select",
          options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
        },
        { name: "excerpt", label: "چکیده", type: "textarea" },
        { name: "content", label: "متن مقاله", type: "textarea" },
        { name: "seo_title", label: "عنوان سئو", type: "text" },
        { name: "seo_description", label: "توضیح سئو", type: "textarea" },
      ]}
      defaults={{
        title: "",
        slug: "",
        category_id: null,
        reading_minutes: 5,
        cover_image_url: "",
        status: "draft",
        excerpt: "",
        content: "",
        seo_title: "",
        seo_description: "",
      }}
    />
  );
}
