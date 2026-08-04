import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";

import logoAsset from "@/assets/ohs-plus-logo.png.asset.json";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "ورود و ثبت‌نام | OHS Plus" },
      {
        name: "description",
        content: "به حساب کاربری OHS Plus وارد شوید یا حساب تازه بسازید تا به منابع تخصصی HSE دسترسی داشته باشید.",
      },
      { property: "og:title", content: "ورود و ثبت‌نام | OHS Plus" },
      { property: "og:description", content: "دسترسی به پیشخوان، خریدها و دانلودهای شما." },
      { property: "og:url", content: "/auth" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email({ message: "ایمیل معتبر وارد کنید" }).max(255);
const passwordSchema = z
  .string()
  .min(8, { message: "رمز عبور باید حداقل ۸ کاراکتر باشد" })
  .max(72);

function sanitizeRedirect(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const { user, loading } = useAuth();
  const destination = sanitizeRedirect(search.redirect);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: destination, replace: true });
  }, [loading, user, destination, navigate]);

  const validate = () => {
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      toast.error(parsedEmail.error.issues[0].message);
      return null;
    }
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) {
      toast.error(parsedPassword.error.issues[0].message);
      return null;
    }
    return { email: parsedEmail.data, password: parsedPassword.data };
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const values = validate();
    if (!values) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    setBusy(false);
    if (error) {
      toast.error("ایمیل یا رمز عبور نادرست است.");
      return;
    }
    toast.success("خوش آمدید!");
    navigate({ to: destination, replace: true });
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    const values = validate();
    if (!values) return;
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      ...values,
      options: {
        emailRedirectTo: `${window.location.origin}${destination}`,
        data: { full_name: fullName.trim().slice(0, 100) },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "این ایمیل قبلاً ثبت شده است."
          : "ثبت‌نام انجام نشد، دوباره تلاش کنید.",
      );
      return;
    }
    toast.success("حساب ساخته شد. در صورت نیاز ایمیل تأیید را بررسی کنید.");
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("ورود با گوگل انجام نشد.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: destination, replace: true });
  };

  const handleForgotPassword = async () => {
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      toast.error("ابتدا ایمیل خود را وارد کنید.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error("ارسال ایمیل بازیابی انجام نشد.");
      return;
    }
    toast.success("لینک بازیابی رمز عبور ارسال شد.");
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-secondary/50 px-5 py-14">
      <Link to="/" className="mb-8 flex flex-col items-center gap-2">
        <span className="flex items-center justify-center rounded-2xl border border-safe/30 bg-safe/10 p-3 shadow-soft">
          <img
            src={logoAsset.url}
            alt="لوگوی OHS Plus"
            width={254}
            height={129}
            className="h-14 w-auto object-contain"
          />
        </span>
        <span className="font-display text-lg font-extrabold text-safe">OHS Plus</span>
      </Link>


      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-soft sm:p-8">
        <h1 className="text-center text-xl font-extrabold">ورود به حساب کاربری</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          برای دسترسی به خریدها و دانلودهای خود وارد شوید.
        </p>

        <Tabs defaultValue="signin" className="mt-6" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">ورود</TabsTrigger>
            <TabsTrigger value="signup">ثبت‌نام</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">ایمیل</Label>
                <Input
                  id="signin-email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">رمز عبور</Label>
                <Input
                  id="signin-password"
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
              >
                رمز عبور را فراموش کرده‌اید؟
              </button>
              <Button type="submit" className="w-full gap-2 font-bold" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                ورود
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">نام و نام خانوادگی</Label>
                <Input
                  id="signup-name"
                  autoComplete="name"
                  maxLength={100}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">ایمیل</Label>
                <Input
                  id="signup-email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">رمز عبور</Label>
                <Input
                  id="signup-password"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">حداقل ۸ کاراکتر.</p>
              </div>
              <Button type="submit" className="w-full gap-2 font-bold" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                ساخت حساب کاربری
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          یا
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 font-semibold"
          onClick={handleGoogle}
          disabled={busy}
        >
          ورود با حساب گوگل
        </Button>
      </div>

      <Link to="/" className="mt-6 text-sm text-muted-foreground hover:text-foreground">
        بازگشت به صفحه اصلی
      </Link>
    </main>
  );
}
