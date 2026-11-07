import { MANDATORY_WARNINGS, type VentInput, type VentResult } from "./ventilation";

/** Two-sheet workbook: all inputs/outputs in one table, plus a plain-language guide. */
export async function createVentWorkbook(input: VentInput, r: VentResult) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "OHS Plus — Ventilation+";
  const head = { name: "B Zar", bold: true, color: { argb: "FFFFFFFF" } };
  const fill = (argb: string) => ({ type: "pattern" as const, pattern: "solid" as const, fgColor: { argb } });
  const r2 = (n: number, d = 2) => (Number.isFinite(n) ? Number(n.toFixed(d)) : null);

  const s1 = wb.addWorksheet("ورودی‌ها و نتایج", { views: [{ rightToLeft: false }] });
  s1.columns = [{ width: 12 }, { width: 22 }, { width: 46 }, { width: 18 }, { width: 14 }];
  const t = s1.addRow(["OHS Plus — Ventilation+ : " + input.projectName]);
  t.font = { name: "B Titr", bold: true, size: 14 };
  s1.mergeCells(1, 1, 1, 5);
  s1.addRow([]);
  const h = s1.addRow(["نوع", "بخش", "پارامتر", "مقدار", "واحد"]);
  h.eachCell((c) => { c.font = head; c.fill = fill("FF1E2A4A"); });

  const add = (kind: "ورودی" | "خروجی", sec: string, name: string, v: number | string | null, unit = "") => {
    const row = s1.addRow([kind, sec, name, v, unit]);
    row.getCell(1).fill = fill(kind === "ورودی" ? "FFE3F2FD" : "FFE8F5E9");
    row.getCell(4).numFmt = "#,##0.###";
  };
  const methodFa = { face: "دهانه / کابین", slot: "شیاری", direct: "دبی مستقیم" } as const;

  add("ورودی", "پروژه", "دمای هوا", input.tempC, "°C");
  add("ورودی", "پروژه", "ارتفاع از سطح دریا", input.elevation, "m");
  add("ورودی", "پروژه", "زبری کانال", input.roughnessMm, "mm");
  add("خروجی", "پروژه", "فشار بارومتریک", r2(r.pressure / 1000), "kPa");
  add("خروجی", "پروژه", "چگالی هوا", r2(r.density, 3), "kg/m³");

  input.hoods.forEach((hd, i) => {
    const x = r.hoods[i];
    const sec = `هود ${i + 1}: ${hd.name}`;
    add("ورودی", sec, "روش محاسبه", methodFa[hd.method]);
    if (hd.method === "direct") add("ورودی", sec, "دبی طراحی", hd.directFlow, "m³/h");
    else {
      add("ورودی", sec, "سرعت دهانه / شیار", hd.velocity, "m/s");
      add("ورودی", sec, "عرض", hd.width, "m");
      add("ورودی", sec, "ارتفاع / طول", hd.height, "m");
    }
    add("ورودی", sec, "ضریب افت ورودی هود", hd.entryK);
    if (hd.method === "slot") add("ورودی", sec, "ضریب افت شیار", hd.slotK);
    add("ورودی", sec, "سرعت حداقل انتقال", hd.transportVelocity, "m/s");
    add("ورودی", sec, "طول کانال شاخه", hd.length, "m");
    add("ورودی", sec, "تعداد زانویی", hd.elbows);
    add("ورودی", sec, "ضریب هر زانویی", hd.elbowK);
    add("ورودی", sec, "ضریب ورود به اتصال", hd.branchEntryK);
    add("ورودی", sec, "افت‌های دیگر", hd.otherLoss, "Pa");
    add("خروجی", sec, "دبی هود", r2(x.flow * 3600, 0), "m³/h");
    add("خروجی", sec, "قطر کانال انتخابی", x.diameterMm, "mm");
    add("خروجی", sec, "سرعت واقعی کانال", r2(x.velocity, 1), "m/s");
    add("خروجی", sec, "فشار سرعت (VP)", r2(x.vp, 1), "Pa");
    add("خروجی", sec, "افت هود", r2(x.hoodLoss, 0), "Pa");
    add("خروجی", sec, "افت اصطکاک", r2(x.friction, 0), "Pa");
    add("خروجی", sec, "افت اتصالات", r2(x.fittings, 0), "Pa");
    add("خروجی", sec, "فشار استاتیک شاخه", r2(x.sp, 0), "Pa");
    add("خروجی", sec, "اختلاف با شاخه حاکم", r2(x.diffPct, 1), "%");
    add("خروجی", sec, "دبی اصلاح‌شده", r2(x.correctedFlow * 3600, 0), "m³/h");
    add("خروجی", sec, "وضعیت بالانس", { governing: "شاخه حاکم", ok: "متعادل", corrected: "تصحیح دبی", redesign: "نیاز به بازطراحی" }[x.status]);
  });

  const m = "کانال اصلی و غبارگیر";
  add("ورودی", m, "طول کانال اصلی", input.mainLength, "m");
  add("ورودی", m, "تعداد زانویی", input.mainElbows);
  add("ورودی", m, "ضریب هر زانویی", input.mainElbowK);
  add("ورودی", m, "افت غبارگیر / فیلتر", input.cleanerLoss, "Pa");
  add("خروجی", m, "دبی کل سیستم", r2(r.totalFlow * 3600, 0), "m³/h");
  add("خروجی", m, "قطر کانال اصلی", r.main.diameterMm, "mm");
  add("خروجی", m, "سرعت کانال اصلی", r2(r.main.velocity, 1), "m/s");
  add("خروجی", m, "افت کانال اصلی", r2(r.main.friction + r.main.fittings, 0), "Pa");
  add("خروجی", m, "افت شتاب در اتصال", r2(r.accelLoss, 0), "Pa");

  const f = "فن و هوای جبرانی";
  add("ورودی", f, "طول کانال خروجی / دودکش", input.outletLength, "m");
  add("ورودی", f, "افت‌های دیگر خروجی", input.outletOtherLoss, "Pa");
  add("ورودی", f, "راندمان فن", input.fanEfficiency);
  add("ورودی", f, "راندمان موتور", input.motorEfficiency);
  add("ورودی", f, "هوای جبرانی موجود", input.supplyAir, "m³/h");
  add("خروجی", f, "فشار استاتیک ورودی فن", r2(r.spInlet, 0), "Pa");
  add("خروجی", f, "فشار استاتیک خروجی فن", r2(r.spOutlet, 0), "Pa");
  add("خروجی", f, "فشار استاتیک فن (FSP)", r2(r.fsp, 0), "Pa");
  add("خروجی", f, "فشار کل فن (FTP)", r2(r.ftp, 0), "Pa");
  add("خروجی", f, "FSP در هوای استاندارد", r2(r.fspStd, 0), "Pa");
  add("خروجی", f, "توان هوا", r2(r.airPowerKw), "kW");
  add("خروجی", f, "توان شفت", r2(r.shaftKw), "kW");
  add("خروجی", f, "توان ورودی موتور", r2(r.motorKw), "kW");
  add("خروجی", f, "تراز هوای جبرانی (تأمین − تخلیه)", r2(r.makeupBalance, 0), "m³/h");

  const s2 = wb.addWorksheet("راهنمای استفاده", { views: [{ rightToLeft: false }] });
  s2.columns = [{ width: 110 }];
  const lines = [
    "راهنمای ساده استفاده از نتایج Ventilation+",
    "",
    "۱. ردیف‌های آبی «ورودی» داده‌هایی هستند که وارد کرده‌اید؛ ردیف‌های سبز «خروجی» نتایج محاسبه‌اند.",
    "۲. «دبی کل سیستم» مقدار هوایی است که فن باید جابه‌جا کند؛ هنگام خرید فن همین عدد را اعلام کنید.",
    "۳. «FSP در هوای استاندارد» را برای مقایسه با منحنی کاتالوگ فن به کار ببرید (کاتالوگ‌ها معمولاً بر پایه هوای استاندارد هستند).",
    "۴. «توان ورودی موتور» را به نزدیک‌ترین توان استاندارد بالاتر گرد کنید و حاشیه اطمینان در نظر بگیرید.",
    "۵. «قطر کانال انتخابی» قطر استاندارد پیشنهادی هر شاخه است؛ سرعت واقعی کانال نباید از سرعت حداقل انتقال کمتر باشد.",
    "۶. وضعیت بالانس: «متعادل» یعنی نیازی به اصلاح نیست؛ «تصحیح دبی» یعنی دبی آن شاخه افزایش یافته؛ «نیاز به بازطراحی» یعنی قطر یا مسیر آن شاخه باید تغییر کند.",
    "۷. «تراز هوای جبرانی» منفی یعنی هوای تازه کافی وارد سالن نمی‌شود و باید هوای جبرانی تأمین شود.",
    "",
    "هشدارها:",
    ...[...r.warnings, ...MANDATORY_WARNINGS].map((w) => "• " + w),
    "",
    "برای طراحی دقیق‌تر و حرفه‌ای‌تر با ما در ارتباط باشید: erfann.rag@gmail.com",
  ];
  lines.forEach((l, i) => {
    const row = s2.addRow([l]);
    if (i === 0) row.font = { name: "B Titr", bold: true, size: 14 };
    else if (l === "هشدارها:") row.font = { name: "B Zar", bold: true, size: 12 };
  });

  for (const sheet of wb.worksheets) {
    sheet.eachRow((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        if (cell.font?.name) return;
        cell.font = { name: "B Mitra", size: 12 };
        if (sheet === s1 && cell.col === 2 && row.number > 3) {
          cell.font = { name: "B Zar", size: 12, bold: true };
        } else if (typeof cell.value === "number") {
          cell.font = { name: "Times New Roman", size: 12 };
        } else if (typeof cell.value === "string") {
          // Mixed-language cells retain Persian typography while Latin text and SI units use Times.
          const parts = cell.value.split(/([A-Za-z0-9][A-Za-z0-9\s+_.@/°³²−%()–—:-]*)/g).filter(Boolean);
          cell.value = { richText: parts.map((text) => ({
            text,
            font: { name: /[A-Za-z0-9]/.test(text) ? "Times New Roman" : "B Mitra", size: 12 },
          })) };
        }
      });
      row.height = sheet === s2 ? 48 : row.number === 1 ? 36 : 30;
    });
  }
  return wb;
}

export async function downloadVentWorkbook(input: VentInput, r: VentResult) {
  const wb = await createVentWorkbook(input, r);
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ventilation-plus-${Date.now()}.xlsx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
