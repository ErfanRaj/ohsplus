import { queryOptions, useQuery } from "@tanstack/react-query";
import { ArrowUpLeft } from "lucide-react";

import fallbackImage from "@/assets/promo-osha.jpg";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl } from "@/lib/uploads";

export const promoBannersQuery = (placement = "home_mid") =>
  queryOptions({
    queryKey: ["site_banners", placement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_banners")
        .select("*")
        .eq("placement", placement)
        .eq("is_active", true)
        .order("sort_order")
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

export function PromoBanner() {
  const { data: banner } = useQuery(promoBannersQuery());
  if (!banner || !banner.link_url) return null;

  const img = banner.image_url ? resolveImageUrl(banner.image_url) : fallbackImage;
  const external = banner.is_external;

  return (
    <section className="container-page py-10 md:py-14" aria-label={banner.title}>
      <a
        href={banner.link_url}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer sponsored" : undefined}
        className="group relative block overflow-hidden rounded-3xl border border-border shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="relative aspect-[16/9] sm:aspect-[3/1] md:max-h-[300px] md:w-full">
          <img
            src={img ?? fallbackImage}
            alt={banner.title}
            loading="lazy"
            width={1920}
            height={640}
            className="absolute inset-0 h-full w-full object-cover object-left transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-ink/95 via-ink/70 to-transparent sm:via-ink/50" />
          {/* light sweep */}
          <div className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-ink-foreground/15 to-transparent opacity-0 transition-all duration-1000 group-hover:left-[120%] group-hover:opacity-100" />

          <div className="absolute inset-y-0 right-0 flex w-full flex-col justify-center gap-2 p-5 text-ink-foreground sm:w-3/5 sm:gap-3 sm:p-8 md:p-10">
            {banner.badge_text && (
              <span className="w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {banner.badge_text}
              </span>
            )}
            <h2 className="text-lg font-extrabold leading-snug sm:text-2xl md:text-3xl">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="line-clamp-2 text-xs text-ink-foreground/80 sm:line-clamp-3 sm:text-sm md:text-base">
                {banner.subtitle}
              </p>
            )}
            <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl bg-ink-foreground px-4 py-2 text-sm font-bold text-ink transition-all group-hover:gap-3 group-hover:bg-primary group-hover:text-primary-foreground">
              {banner.cta_label || "مشاهده"}
              <ArrowUpLeft className="size-4 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </a>
    </section>
  );
}
