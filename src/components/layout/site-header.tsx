import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchDialog } from "@/components/layout/search-dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { NAVIGATION } from "@/lib/navigation";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-3 md:h-18">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              aria-label="باز کردن منوی اصلی"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-right">منوی اصلی</SheetTitle>
            </SheetHeader>
            <nav aria-label="پیمایش موبایل" className="px-4 pb-8">
              <Accordion type="multiple">
                {NAVIGATION.map((group) =>
                  group.children ? (
                    <AccordionItem key={group.label} value={group.label}>
                      <AccordionTrigger className="text-sm font-bold">
                        {group.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="flex flex-col">
                          {group.children.map((child) => (
                            <li key={child.label}>
                              <Link
                                to={child.href}
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-md px-2 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Link
                      key={group.label}
                      to={group.href}
                      onClick={() => setMenuOpen(false)}
                      className="block border-b py-4 text-sm font-bold"
                    >
                      {group.label}
                    </Link>
                  ),
                )}
              </Accordion>
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          className="flex min-w-0 items-center gap-2"
          aria-label="OHS Hub، صفحه اصلی"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-ink text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-display text-base font-extrabold tracking-tight">OHS Hub</span>
            <span className="mt-1 truncate text-[11px] text-muted-foreground">
              مرجع تخصصی ایمنی
            </span>
          </span>
        </Link>

        <NavigationMenu className="hidden lg:flex" dir="rtl">
          <NavigationMenuList>
            {NAVIGATION.map((group) =>
              group.children ? (
                <NavigationMenuItem key={group.label}>
                  <NavigationMenuTrigger className="bg-transparent text-sm font-semibold">
                    {group.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[34rem] grid-cols-2 gap-1 p-3">
                      {group.children.map((child) => (
                        <li key={child.label}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={child.href}
                              className="block rounded-md p-3 transition-colors hover:bg-muted"
                            >
                              <span className="block text-sm font-bold">{child.label}</span>
                              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                {child.description}
                              </span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={group.label}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={group.href}
                      className="inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {group.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ms-auto flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="جستجو در منابع"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" aria-hidden="true" />
          </Button>

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" aria-hidden="true" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1.5 font-semibold">
                  <User className="size-4" aria-hidden="true" />
                  <span className="hidden max-w-28 truncate sm:inline">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="gap-2">
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    پیشخوان من
                  </Link>
                </DropdownMenuItem>
                {isStaff ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="gap-2">
                      <ShieldCheck className="size-4" aria-hidden="true" />
                      پنل مدیریت
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut} className="gap-2">
                  <LogOut className="size-4" aria-hidden="true" />
                  خروج از حساب
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" className="gap-2 font-semibold" asChild>
              <Link to="/auth">
                <User className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">ورود / ثبت‌نام</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
