import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با ما | OHS Hub" },
      {
        name: "description",
        content:
          "با تیم OHS Hub تماس بگیرید؛ پشتیبانی خرید، درخواست منابع اختصاصی HSE و همکاری سازمانی.",
      },
      { property: "og:title", content: "تماس با ما | OHS Hub" },
      { property: "og:description", content: "راه‌های ارتباطی و فرم پیام تیم OHS Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, { message: "نام را کامل وارد کنید" }).max(100),
  email: z.string().trim().email({ message: "ایمیل معتبر وارد کنید" }).max(255),
  subject: z.string().trim().min(3, { message: "موضوع را وارد کنید" }).max(150),
  message: z.string().trim().min(10, { message: "متن پیام حداقل ۱۰ کاراکتر باشد" }).max(2000),
});

const CHANNELS = [
  { icon: Mail, label: "ایمیل", value: "info@ohshub.ir", href: "mailto:info@ohshub.ir" },
  { icon: Phone, label: "تلفن", value: "۰۲۱-۰۰۰۰۰۰۰۰", href: "tel:+982100000000" },
  { icon: Clock, label: "ساعات پاسخ‌گویی", value: "شنبه تا چهارشنبه، ۹ تا ۱۷" },
  { icon: MapPin, label: "نشانی", value: "تهران، ایران" },
];

function ContactPage() {
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    window.location.href = `mailto:info@ohshub.ir?subject=${encodeURIComponent(
      parsed.data.subject,
    )}&body=${encodeURIComponent(`${parsed.data.message}\n\n${parsed.data.name} — ${parsed.data.email}`)}`;
    setBusy(false);
    toast.success("پیام شما آماده ارسال شد.");
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page py-8">
          <PageBreadcrumb items={[{ label: "تماس با ما" }]} />

          <header className="mt-6 max-w-2xl">
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">تماس با ما</h1>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">
              برای پشتیبانی خرید، درخواست فایل اختصاصی یا همکاری سازمانی پیام بگذارید؛ معمولاً در یک
              روز کاری پاسخ می‌دهیم.
            </p>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
            <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-soft">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">نام و نام خانوادگی</Label>
                  <Input
                    id="contact-name"
                    required
                    maxLength={100}
                    value={values.name}
                    onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">ایمیل</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    dir="ltr"
                    required
                    value={values.email}
                    onChange={(event) => setValues((v) => ({ ...v, email: event.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="contact-subject">موضوع</Label>
                <Input
                  id="contact-subject"
                  required
                  maxLength={150}
                  value={values.subject}
                  onChange={(event) => setValues((v) => ({ ...v, subject: event.target.value }))}
                />
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="contact-message">متن پیام</Label>
                <Textarea
                  id="contact-message"
                  required
                  rows={6}
                  maxLength={2000}
                  value={values.message}
                  onChange={(event) => setValues((v) => ({ ...v, message: event.target.value }))}
                />
              </div>
              <Button type="submit" className="mt-6 gap-2 font-bold" disabled={busy}>
                <Send className="size-4" aria-hidden="true" />
                ارسال پیام
              </Button>
            </form>

            <aside className="space-y-3">
              {CHANNELS.map((channel) => (
                <div key={channel.label} className="rounded-xl border bg-card p-4">
                  <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <channel.icon className="size-4 text-primary" aria-hidden="true" />
                    {channel.label}
                  </span>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="mt-2 block text-sm font-bold hover:text-primary"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm font-bold">{channel.value}</p>
                  )}
                </div>
              ))}
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
