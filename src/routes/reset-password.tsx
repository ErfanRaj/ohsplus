import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تعیین رمز عبور جدید | OHS Plus" },
      { name: "description", content: "رمز عبور تازه‌ای برای حساب کاربری خود انتخاب کنید." },
      { property: "og:title", content: "تعیین رمز عبور جدید | OHS Plus" },
      { property: "og:description", content: "بازیابی دسترسی به حساب کاربری OHS Plus." },
      { property: "og:url", content: "/reset-password" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/reset-password" }],
  }),
  component: ResetPasswordPage,
});

const passwordSchema = z
  .string()
  .min(8, { message: "رمز عبور باید حداقل ۸ کاراکتر باشد" })
  .max(72);

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (password !== confirm) {
      toast.error("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setBusy(false);
    if (error) {
      toast.error("تغییر رمز عبور انجام نشد. لینک ممکن است منقضی شده باشد.");
      return;
    }
    toast.success("رمز عبور با موفقیت تغییر کرد.");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-secondary/50 px-5 py-14">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow-soft sm:p-8"
      >
        <h1 className="text-xl font-extrabold">تعیین رمز عبور جدید</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          رمز عبور تازه‌ای انتخاب کنید تا دوباره به حساب خود دسترسی داشته باشید.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">رمز عبور جدید</Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">تکرار رمز عبور</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full gap-2 font-bold" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            ذخیره رمز عبور
          </Button>
        </div>
      </form>
    </main>
  );
}
