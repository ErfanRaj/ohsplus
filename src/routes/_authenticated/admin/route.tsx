import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { isStaffQuery } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const { data: isStaff, isLoading } = useQuery(isStaffQuery(user.id));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : isStaff ? (
          <Outlet />
        ) : (
          <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
            <ShieldAlert className="size-10 text-destructive" aria-hidden="true" />
            <h1 className="text-2xl font-extrabold">دسترسی محدود</h1>
            <p className="max-w-md text-sm text-muted-foreground">
              این بخش تنها برای اعضای تیم محتوا و مدیران OHS Hub در دسترس است.
            </p>
            <Button asChild className="font-semibold">
              <Link to="/dashboard">بازگشت به پیشخوان</Link>
            </Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
