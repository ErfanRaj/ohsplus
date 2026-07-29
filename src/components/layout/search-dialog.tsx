import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAVIGATION } from "@/lib/navigation";

type SearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    navigate({ to: href });
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="جستجو"
      description="جستجو در منابع، دسته‌بندی‌ها و مقالات"
    >
      <CommandInput placeholder="نام منبع، دسته‌بندی یا مقاله را بنویسید…" />
      <CommandList>
        <CommandEmpty>نتیجه‌ای یافت نشد.</CommandEmpty>
        {NAVIGATION.filter((group) => group.children).map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.children!.map((child) => (
              <CommandItem
                key={child.label}
                value={`${child.label} ${child.description}`}
                onSelect={() => go(child.href)}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold">{child.label}</span>
                  <span className="text-xs text-muted-foreground">{child.description}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
