import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CrudPage } from "@/components/admin/crud-page";
import { adminListQuery } from "@/lib/admin";
import { toFa } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({
    meta: [
      { title: "مدیریت دسته‌بندی‌ها | OHS Hub" },
      { name: "description", content: "ساختاردهی دسته‌بندی‌های محصولات و مقالات HSE." },
      { property: "og:title", content: "مدیریت دسته‌بندی‌ها | OHS Hub" },
      { property: "og:description", content: "مدیریت درخت دسته‌بندی‌های OHS Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCategories,
});

function AdminCategories() {
  const { data: categories } = useQuery(adminListQuery("categories", "id,name", "sort_order"));

  return (
    <CrudPage
      table="categories"
      title="دسته‌بندی"
      description="مدیریت دسته‌بندی‌های اصلی و زیرشاخه‌ها."
      select="id,name,slug,description,icon,sort_order,is_active,parent_id,seo_title,seo_description,created_at"
      searchKeys={["name", "slug"]}
      columns={[
        { name: "name", label: "نام" },
        { name: "slug", label: "نشانی" },
        {
          name: "sort_order",
          label: "ترتیب",
          render: (row) => toFa(Number(row.sort_order ?? 0)),
        },
        {
          name: "is_active",
          label: "فعال",
          render: (row) => (row.is_active ? "بله" : "خیر"),
        },
      ]}
      extraOptions={{
        parent_id: (categories ?? []).map((c) => ({
          value: String(c.id),
          label: String(c.name),
        })),
      }}
      fields={[
        { name: "name", label: "نام", type: "text" },
        { name: "slug", label: "نشانی (slug)", type: "text", slugFrom: "name" },
        { name: "parent_id", label: "دسته والد", type: "select" },
        { name: "icon", label: "آیکون", type: "text", placeholder: "shield" },
        { name: "sort_order", label: "ترتیب نمایش", type: "number" },
        { name: "is_active", label: "فعال باشد", type: "switch" },
        { name: "description", label: "توضیحات", type: "textarea" },
        { name: "seo_title", label: "عنوان سئو", type: "text" },
        { name: "seo_description", label: "توضیح سئو", type: "textarea" },
      ]}
      defaults={{
        name: "",
        slug: "",
        parent_id: null,
        icon: "",
        sort_order: 0,
        is_active: true,
        description: "",
        seo_title: "",
        seo_description: "",
      }}
    />
  );
}
