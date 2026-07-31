import { createFileRoute } from "@tanstack/react-router";

import { CrudPage } from "@/components/admin/crud-page";
import { formatDateFa } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/tags")({
  head: () => ({
    meta: [
      { title: "مدیریت برچسب‌ها | OHS Hub" },
      { name: "description", content: "مدیریت برچسب‌های موضوعی محصولات و مقالات." },
      { property: "og:title", content: "مدیریت برچسب‌ها | OHS Hub" },
      { property: "og:description", content: "مدیریت برچسب‌های محتوایی OHS Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminTags,
});

function AdminTags() {
  return (
    <CrudPage
      table="tags"
      title="برچسب"
      description="برچسب‌های موضوعی برای دسته‌بندی دقیق‌تر محتوا."
      select="id,name,slug,created_at"
      searchKeys={["name", "slug"]}
      softDelete={false}
      columns={[
        { name: "name", label: "نام" },
        { name: "slug", label: "نشانی" },
        {
          name: "created_at",
          label: "تاریخ ایجاد",
          render: (row) => formatDateFa(String(row.created_at ?? "")),
        },
      ]}
      fields={[
        { name: "name", label: "نام", type: "text" },
        { name: "slug", label: "نشانی (slug)", type: "text", slugFrom: "name" },
      ]}
      defaults={{ name: "", slug: "" }}
    />
  );
}
