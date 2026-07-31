import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CrudPage } from "@/components/admin/crud-page";
import { adminListQuery, STATUS_LABELS } from "@/lib/admin";
import { formatToman, toFa } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({
    meta: [
      { title: "مدیریت محصولات | OHS Hub" },
      { name: "description", content: "افزودن، ویرایش و انتشار محصولات دیجیتال HSE." },
      { property: "og:title", content: "مدیریت محصولات | OHS Hub" },
      { property: "og:description", content: "مدیریت کامل محصولات فروشگاه OHS Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const { data: categories } = useQuery(adminListQuery("categories", "id,name", "sort_order"));

  return (
    <CrudPage
      table="products"
      title="محصول"
      description="مدیریت فایل‌ها، قیمت و وضعیت انتشار محصولات."
      select="id,title,slug,price_toman,is_free,status,category_id,subtitle,description,file_format,compare_at_toman,cover_image_url,badge,seo_title,seo_description,created_at"
      searchKeys={["title", "slug"]}
      columns={[
        { name: "title", label: "عنوان" },
        { name: "slug", label: "نشانی" },
        {
          name: "price_toman",
          label: "قیمت",
          render: (row) => formatToman(Number(row.price_toman ?? 0), Boolean(row.is_free)),
        },
        {
          name: "status",
          label: "وضعیت",
          render: (row) => STATUS_LABELS[String(row.status)] ?? String(row.status),
        },
        {
          name: "download_count",
          label: "شناسه دسته",
          render: (row) =>
            categories?.find((c) => c.id === row.category_id)
              ? String(categories.find((c) => c.id === row.category_id)?.name)
              : "—",
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
        { name: "subtitle", label: "زیرعنوان", type: "text" },
        { name: "category_id", label: "دسته‌بندی", type: "select" },
        { name: "price_toman", label: `قیمت (تومان) ${toFa("")}`.trim(), type: "number" },
        { name: "compare_at_toman", label: "قیمت قبل از تخفیف", type: "number" },
        { name: "is_free", label: "رایگان است", type: "switch" },
        { name: "file_format", label: "فرمت فایل", type: "text", placeholder: "PDF / XLSX" },
        { name: "badge", label: "برچسب ویژه", type: "text" },
        { name: "cover_image_url", label: "تصویر شاخص (URL)", type: "text" },
        {
          name: "status",
          label: "وضعیت",
          type: "select",
          options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
        },
        { name: "description", label: "توضیحات", type: "textarea" },
        { name: "seo_title", label: "عنوان سئو", type: "text" },
        { name: "seo_description", label: "توضیح سئو", type: "textarea" },
      ]}
      defaults={{
        title: "",
        slug: "",
        subtitle: "",
        category_id: null,
        price_toman: 0,
        compare_at_toman: null,
        is_free: false,
        file_format: "",
        badge: "",
        cover_image_url: "",
        status: "draft",
        description: "",
        seo_title: "",
        seo_description: "",
      }}
    />
  );
}
