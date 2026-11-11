import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Save, Trash2, MapPin, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { scenariosQuery, type Scenario } from "@/lib/hazard-queries";
import { CATEGORY_LABEL, RISK_LABEL, type Hazard } from "@/lib/hazards";
import { controlLevels, scenarioSchema } from "@/lib/hazard-schema";
import { resolveImageUrl, uploadImage, ACCEPTED_IMAGE_TYPES } from "@/lib/uploads";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/hazards")({
  head: () => ({ meta: [
    { title: "مدیریت سناریوهای Hazard+ | OHS Plus" }, { name: "description", content: "ویرایش تصاویر، نقاط خطر، روش‌های کنترل و مراجع آموزشی Hazard+." },
    { property: "og:title", content: "مدیریت Hazard+ | OHS Plus" }, { property: "og:description", content: "مدیریت سناریوهای آموزش ایمنی OHS Plus." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }), component: AdminHazards,
});
const blank = (): Scenario => ({ id: "", title: "", description: "", image_url: "", hazards: [], is_active: false, sort_order: 0 });

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return <Label className="flex min-w-0 flex-col gap-2"><span>{title}</span>{children}</Label>;
}

function AdminHazards() {
  const { data: rows, isLoading, error } = useQuery(scenariosQuery(true));
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Scenario | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const hazard = draft?.hazards.find(h => h.id === selected);
  const patch = (changes: Partial<Scenario>) => setDraft(d => d ? { ...d, ...changes } : d);
  const patchHazard = (changes: Partial<Hazard>) => setDraft(d => d ? { ...d, hazards: d.hazards.map(h => h.id === selected ? { ...h, ...changes } : h) } : d);
  const open = (row: Scenario) => { setDraft(structuredClone(row)); setSelected(row.hazards[0]?.id ?? null); setPlacing(false); };
  const save = async () => {
    if (!draft) return;
    const parsed = scenarioSchema.safeParse(draft);
    if (!parsed.success) { toast.error("عنوان، تصویر، پیامد و حداقل یک روش کنترل برای هر خطر الزامی است؛ محدوده نقاط را بررسی کنید."); return; }
    setBusy(true);
    try {
      const payload = { ...parsed.data, hazards: parsed.data.hazards as unknown as Json };
      const result = draft.id ? await supabase.from("hazard_scenarios").update(payload).eq("id", draft.id).select("id").single() : await supabase.from("hazard_scenarios").insert(payload).select("id").single();
      if (result.error) throw result.error;
      await qc.invalidateQueries({ queryKey: ["hazard-scenarios"] });
      setDraft(null); toast.success("سناریو ذخیره شد");
    } catch { toast.error("ذخیره سناریو ناموفق بود؛ دسترسی و اتصال را بررسی کنید."); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const { error: err } = await supabase.from("hazard_scenarios").delete().eq("id", deleting).select("id").single();
      if (err) throw err;
      await qc.invalidateQueries({ queryKey: ["hazard-scenarios"] }); setDeleting(null); toast.success("سناریو حذف شد");
    } catch { toast.error("حذف ناموفق بود"); } finally { setBusy(false); }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try { const { url } = await uploadImage(file, "hazard-scenes"); patch({ image_url: url }); toast.success("تصویر بارگذاری شد؛ نقاط خطر را بررسی کنید."); }
    catch (e) { toast.error(e instanceof Error ? e.message : "بارگذاری ناموفق بود"); }
    finally { setUploading(false); }
  };

  return <AdminShell title="سناریوهای Hazard+" actions={!draft && <Button onClick={() => open(blank())}><Plus className="size-4" /> سناریوی جدید</Button>}>
    {isLoading && <Loader2 className="size-6 animate-spin" />}
    {error && <p role="alert" className="text-destructive">دریافت سناریوها ناموفق بود.</p>}
    {!draft ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rows?.map(row => <article key={row.id} className="overflow-hidden rounded-lg border border-border bg-card">
      <img src={resolveImageUrl(row.image_url) ?? ""} alt={row.title} className="aspect-video w-full object-cover" />
      <div className="space-y-3 p-4"><h2 className="font-bold">{row.title}</h2><p className="text-sm text-muted-foreground">{row.hazards.length} خطر · {row.is_active ? "فعال" : "پیش‌نویس"}</p>
      <div className="flex gap-2"><Button variant="outline" onClick={() => open(row)}>ویرایش سناریو</Button><Button variant="ghost" size="icon" aria-label={`حذف ${row.title}`} onClick={() => setDeleting(row.id)}><Trash2 className="size-4" /></Button></div></div>
    </article>)}{rows?.length === 0 && <p>هنوز سناریویی ثبت نشده است.</p>}</div> : <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-bold">{draft.id ? "ویرایش سناریو" : "سناریوی جدید"}</h2><div className="flex gap-2"><Button variant="outline" onClick={() => { setDraft(null); setPlacing(false); }}>انصراف</Button><Button disabled={busy || uploading} onClick={save}><Save className="size-4" />{busy ? "در حال ذخیره" : "ذخیره سناریو"}</Button></div></div>
      <div className="grid gap-4 md:grid-cols-2"><Field title="عنوان سناریو"><Input value={draft.title} onChange={e => patch({ title: e.target.value })} /></Field><Field title="ترتیب نمایش"><Input type="number" dir="ltr" value={draft.sort_order} onChange={e => patch({ sort_order: Number(e.target.value) })} /></Field><div className="md:col-span-2"><Field title="توضیح سناریو"><Textarea value={draft.description} onChange={e => patch({ description: e.target.value })} /></Field></div>
      <Label className="flex items-center gap-3"><Switch checked={draft.is_active} onCheckedChange={v => patch({ is_active: v })} /> نمایش عمومی</Label></div>
      <div className="flex flex-wrap items-center gap-3"><Button asChild variant="outline" disabled={uploading}><label><Upload className="size-4" />{uploading ? "بارگذاری…" : "بارگذاری / جایگزینی تصویر"}<input aria-label="تصویر سناریو" type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} className="hidden" disabled={uploading} onChange={e => { void upload(e.target.files?.[0]); e.target.value = ""; }} /></label></Button><Input className="min-w-0 flex-1" aria-label="نشانی تصویر" dir="ltr" value={draft.image_url} onChange={e => patch({ image_url: e.target.value })} /></div>
      <div className="flex flex-wrap gap-2"><Button variant={placing ? "default" : "outline"} disabled={!draft.image_url} onClick={() => { setSelected(null); setPlacing(true); }}><Plus className="size-4" /> افزودن نقطه خطر</Button><Button variant="outline" disabled={!hazard} onClick={() => setPlacing(true)}><MapPin className="size-4" /> جابه‌جایی نقطه انتخاب‌شده</Button>{placing && <span role="status" className="self-center text-sm text-primary">محل خطر را روی تصویر انتخاب کنید</span>}</div>
      {draft.image_url && <div className="overflow-x-auto rounded-lg border border-border" dir="ltr"><div className="relative min-w-[640px]" role="application" aria-label="نقشه نقاط خطر" onClick={e => {
        if (!placing) return;
        const box = e.currentTarget.getBoundingClientRect(); const x = Math.round((e.clientX - box.left) / box.width * 1000) / 10; const y = Math.round((e.clientY - box.top) / box.height * 1000) / 10;
        if (selected) patchHazard({ x, y });
        else { const id = crypto.randomUUID(); patch({ hazards: [...draft.hazards, { id, x, y, r: 6, title: "", category: "mechanical", risk: "medium", consequence: "", hint: "", controls: [{ level: "کنترل مهندسی", text: "" }], standards: [] }] }); setSelected(id); }
        setPlacing(false);
      }}><img src={resolveImageUrl(draft.image_url) ?? ""} alt={draft.title || "تصویر سناریو"} className="block w-full" draggable={false} />
      {draft.hazards.map((h, i) => <Button key={h.id} variant="ghost" aria-label={`نقطه ${i + 1}`} className={`absolute aspect-square h-auto -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-0 ${selected === h.id ? "border-hz-amber bg-hz-amber/30 text-hz-steel" : "border-iso-concrete bg-hz-steel/40 text-iso-concrete"}`} style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.r * 2}%` }} onClick={e => { e.stopPropagation(); setSelected(h.id); setPlacing(false); }}><span className="rounded bg-hz-steel px-2 py-1 font-bold text-hz-amber">{i + 1}</span></Button>)}
      </div></div>}
      <div className="flex flex-wrap gap-2">{draft.hazards.map((h, i) => <Button variant={selected === h.id ? "default" : "outline"} key={h.id} onClick={() => { setSelected(h.id); setPlacing(false); }}>{i + 1}. {h.title || "خطر جدید"}</Button>)}</div>
      {hazard && <div className="space-y-5 border-t border-border pt-5"><div className="flex items-center justify-between"><h3 className="font-bold">اطلاعات خطر</h3><Button variant="ghost" onClick={() => { patch({ hazards: draft.hazards.filter(h => h.id !== selected) }); setSelected(null); }}><Trash2 className="size-4" /> حذف خطر</Button></div>
        <div className="grid gap-4 md:grid-cols-2"><Field title="عنوان خطر"><Input value={hazard.title} onChange={e => patchHazard({ title: e.target.value })} /></Field><Field title="شعاع محدوده (درصد عرض تصویر)"><Input type="number" dir="ltr" min={1} max={30} value={hazard.r} onChange={e => patchHazard({ r: Number(e.target.value) })} /></Field>
        <Field title="دسته خطر"><Select value={hazard.category} onValueChange={v => patchHazard({ category: v as Hazard["category"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORY_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></Field>
        <Field title="سطح ریسک"><Select value={hazard.risk} onValueChange={v => patchHazard({ risk: v as Hazard["risk"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(RISK_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></Field>
        <Field title="پیامد احتمالی"><Textarea value={hazard.consequence} onChange={e => patchHazard({ consequence: e.target.value })} /></Field><Field title="راهنمای کشف خطر"><Textarea value={hazard.hint} onChange={e => patchHazard({ hint: e.target.value })} /></Field></div>
        <h4 className="font-bold">روش‌های کنترل</h4>{hazard.controls.map((c, i) => <div key={i} className="flex flex-wrap items-start gap-2"><Select value={c.level} onValueChange={v => patchHazard({ controls: hazard.controls.map((a, j) => j === i ? { ...a, level: v as typeof c.level } : a) })}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent>{controlLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><Textarea aria-label={`روش کنترل ${i + 1}`} className="min-w-[200px] flex-1" value={c.text} onChange={e => patchHazard({ controls: hazard.controls.map((a, j) => j === i ? { ...a, text: e.target.value } : a) })} /><Button size="icon" variant="ghost" aria-label={`حذف روش کنترل ${i + 1}`} onClick={() => patchHazard({ controls: hazard.controls.filter((_, j) => j !== i) })}><X className="size-4" /></Button></div>)}
        <Button variant="outline" onClick={() => patchHazard({ controls: [...hazard.controls, { level: "کنترل مهندسی", text: "" }] })}><Plus className="size-4" /> افزودن روش کنترل</Button>
        <Field title="استانداردها و مراجع (هر مورد یک خط)"><Textarea dir="auto" value={hazard.standards.join("\n")} onChange={e => patchHazard({ standards: e.target.value.split("\n") })} /></Field>
      </div>}
    </div>}
    {deleting && <div role="dialog" aria-label="تأیید حذف سناریو" className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-4"><div className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6"><h2 className="font-bold">این سناریو و تمام نقاط خطر آن حذف شود؟</h2><div className="flex gap-2"><Button variant="destructive" onClick={remove} disabled={busy}>حذف سناریو</Button><Button variant="outline" onClick={() => setDeleting(null)}>انصراف</Button></div></div></div>}
  </AdminShell>;
}