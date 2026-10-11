import { createFileRoute } from "@tanstack/react-router";

import { CrudPage } from "@/components/admin/crud-page";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  head: () => ({
    meta: [
      { title: "مدیریت بنرهای تبلیغاتی | OHS Plus" },
      { name: "description", content: "مدیریت تصویر، متن و لینک بنرهای تبلیغاتی صفحه اصلی." },
      { property: "og:title", content: "مدیریت بنرهای تبلیغاتی | OHS Plus" },
      { property: "og:description", content: "مدیریت بنرهای تبلیغاتی OHS Plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminBanners,
});

function AdminBanners() {
  return (
    <CrudPage
      table="site_banners"
      title="بنر تبلیغاتی"
      description="بنری که بین محصولات و مقالات صفحه اصلی نمایش داده می‌شود. اولین بنر فعال (کمترین ترتیب) نشان داده می‌شود."
      select="id,title,subtitle,badge_text,cta_label,image_url,link_url,is_external,is_active,placement,sort_order,created_at"
      searchKeys={["title"]}
      softDelete={false}
      columns={[
        { name: "title", label: "عنوان" },
        { name: "link_url", label: "لینک" },
        { name: "is_active", label: "وضعیت", render: (r) => (r.is_active ? "فعال" : "غیرفعال") },
      ]}
      fields={[
        { name: "title", label: "عنوان", type: "text", full: true },
        { name: "subtitle", label: "توضیح", type: "textarea", full: true },
        { name: "badge_text", label: "برچسب کوچک", type: "text" },
        { name: "cta_label", label: "متن دکمه", type: "text" },
        { name: "link_url", label: "لینک مقصد", type: "text", placeholder: "https://...", full: true },
        { name: "image_url", label: "تصویر بنر (پیشنهادی ۱۹۲۰×۶۴۰)", type: "image", imageFolder: "banners", full: true },
        { name: "sort_order", label: "ترتیب", type: "number" },
        { name: "is_external", label: "باز شدن در تب جدید", type: "switch" },
        { name: "is_active", label: "فعال", type: "switch" },
      ]}
      defaults={{
        title: "", subtitle: "", badge_text: "", cta_label: "", link_url: "",
        image_url: null, sort_order: 0, is_external: true, is_active: true, placement: "home_mid",
      }}
    />
  );
}
