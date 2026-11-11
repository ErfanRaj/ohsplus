<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Ventilation+ calculations run entirely in the browser (src/lib/ventilation.ts, SI units, covered by ventilation.test.ts); Excel export is built client-side with exceljs loaded on demand — deterministic engineering math must never go through AI.
- Keep workbook creation separate from browser download so the actual exported workbook can be inspected without DOM side effects.
- Hazard+ scenarios and percentage-based hotspots are stored together in hazard_scenarios; staff-only RLS protects editing and active-only reads serve visitors. Validate the shared schema before saving to keep the image and teaching content consistent.
