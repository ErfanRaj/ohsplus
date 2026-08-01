import { createFileRoute } from "@tanstack/react-router";

import { CrudPage } from "@/components/admin/crud-page";
import { formatDateFa } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  head: () => ({
    meta: [
      { title: "پیام‌های تماس | OHS Hub" },
      { name: "description", content: "مدیریت پیام‌های دریافتی از فرم تماس با ما." },
      { property: "og:title", content: "پیام‌های تماس | OHS Hub" },
      { property: "og:description", content: "صندوق پیام‌های فرم تماس OHS Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminMessages,
});

function AdminMessages() {
  return (
    <CrudPage
      table="contact_messages"
      title="پیام"
      description="پیام‌های ارسال‌شده از فرم تماس با ما؛ وضعیت خوانده‌شدن و پاسخ را اینجا مدیریت کنید."
      select="id,name,email,subject,message,is_read,is_answered,created_at"
      searchKeys={["name", "email", "subject", "message"]}
      softDelete={false}
      columns={[
        { name: "name", label: "فرستنده" },
        {
          name: "email",
          label: "ایمیل",
          render: (row) => (
            <a
              href={`mailto:${String(row.email ?? "")}?subject=${encodeURIComponent(
                `پاسخ: ${String(row.subject ?? "")}`,
              )}`}
              dir="ltr"
              className="font-semibold text-primary hover:underline"
            >
              {String(row.email ?? "—")}
            </a>
          ),
        },
        { name: "subject", label: "موضوع" },
        { name: "message", label: "متن پیام" },
        {
          name: "is_read",
          label: "خوانده شده",
          render: (row) => (row.is_read ? "بله" : "خیر"),
        },
        {
          name: "is_answered",
          label: "پاسخ داده شده",
          render: (row) => (row.is_answered ? "بله" : "خیر"),
        },
        {
          name: "created_at",
          label: "تاریخ",
          render: (row) => formatDateFa(String(row.created_at ?? "")),
        },
      ]}
      fields={[
        { name: "name", label: "نام فرستنده", type: "text" },
        { name: "email", label: "ایمیل", type: "text" },
        { name: "subject", label: "موضوع", type: "text" },
        { name: "message", label: "متن پیام", type: "textarea" },
        { name: "is_read", label: "خوانده شده", type: "switch" },
        { name: "is_answered", label: "پاسخ داده شده", type: "switch" },
      ]}
      defaults={{
        name: "",
        email: "",
        subject: "",
        message: "",
        is_read: false,
        is_answered: false,
      }}
    />
  );
}
