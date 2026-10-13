import { MANDATORY_WARNINGS, type VentInput, type VentResult } from "./ventilation";

/** Builds a formula-driven Excel workbook in the browser and triggers a download. */
export async function downloadVentWorkbook(input: VentInput, r: VentResult) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "OHS Plus — Ventilation+";
  const head = { bold: true, color: { argb: "FFFFFFFF" } };
  const fill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF1E2A4A" } };
  const blue = { color: { argb: "FF0000FF" } };

  // Sheet 1 — Project / site
  const s1 = wb.addWorksheet("Project_Summary", { views: [{ rightToLeft: false }] });
  s1.columns = [{ width: 38 }, { width: 18 }, { width: 14 }];
  s1.addRow(["OHS Plus — Ventilation+ preliminary LEV calculation"]).font = { bold: true, size: 14 };
  s1.addRow(["Project", input.projectName]);
  s1.addRow(["Air temperature", input.tempC, "°C"]).getCell(2).font = blue;
  s1.addRow(["Site elevation", input.elevation, "m"]).getCell(2).font = blue;
  s1.addRow(["Barometric pressure", { formula: "101325*(1-0.0000225577*B4)^5.25588" }, "Pa"]);
  s1.addRow(["Air density ρ = p/(R·T)", { formula: "B5/(287.05*(B3+273.15))" }, "kg/m³"]);
  s1.addRow(["Duct roughness", input.roughnessMm / 1000, "m"]).getCell(2).font = blue;
  s1.addRow(["Air viscosity μ", 1.81e-5, "Pa·s"]);
  s1.getRow(1).height = 22;

  // Sheet 2 — Hoods & branches (formulas reference the summary sheet)
  const s2 = wb.addWorksheet("Hood_Calculations");
  const cols = [
    "Hood", "Method", "Velocity m/s", "Width m", "Height m", "Direct Q m³/h", "Q m³/s",
    "V transport m/s", "D selected mm", "Duct area m²", "V actual m/s", "VP Pa", "Entry K",
    "Slot K", "Hood loss Pa", "Length m", "Re", "Friction f", "Friction Pa", "Fitting ΣK",
    "Fitting Pa", "Other Pa", "Branch SP Pa",
  ];
  const hr = s2.addRow(cols);
  hr.eachCell((c) => { c.font = head; c.fill = fill; });
  s2.columns = cols.map(() => ({ width: 14 }));
  input.hoods.forEach((h, i) => {
    const n = i + 2;
    const res = r.hoods[i];
    s2.addRow([
      h.name, h.method, h.velocity, h.width, h.height, h.directFlow,
      { formula: `IF(B${n}="direct",F${n}/3600,C${n}*D${n}*E${n})` },
      h.transportVelocity, res.diameterMm,
      { formula: `PI()*(I${n}/1000)^2/4` },
      { formula: `G${n}/J${n}` },
      { formula: `0.5*Project_Summary!$B$6*K${n}^2` },
      h.entryK, h.method === "slot" ? h.slotK : 0,
      { formula: `IF(B${n}="slot",(N${n}+1)*0.5*Project_Summary!$B$6*C${n}^2,0)+(M${n}+1)*L${n}` },
      h.length,
      { formula: `Project_Summary!$B$6*K${n}*(I${n}/1000)/Project_Summary!$B$8` },
      { formula: `0.25/(LOG10(Project_Summary!$B$7/(3.7*I${n}/1000)+5.74/Q${n}^0.9))^2` },
      { formula: `R${n}*(P${n}/(I${n}/1000))*L${n}` },
      h.elbows * h.elbowK + h.branchEntryK,
      { formula: `T${n}*L${n}` },
      h.otherLoss,
      { formula: `O${n}+S${n}+U${n}+V${n}` },
    ]);
    [3, 4, 5, 6, 8, 9, 13, 14, 16, 20, 22].forEach((c) => (s2.getRow(n).getCell(c).font = blue));
  });
  const last = input.hoods.length + 1;
  s2.addRow([]);
  s2.addRow(["Governing SP (Pa)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
    { formula: `MAX(W2:W${last})` }]).font = { bold: true };

  // Sheet 3 — Balance
  const s3 = wb.addWorksheet("Junction_Balance");
  s3.columns = [{ width: 24 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 18 }, { width: 14 }];
  const b = s3.addRow(["Hood", "SP Pa", "Diff %", "Q design m³/s", "Q corrected m³/s", "Status"]);
  b.eachCell((c) => { c.font = head; c.fill = fill; });
  const gov = `Hood_Calculations!$W$${last + 2}`;
  input.hoods.forEach((_, i) => {
    const n = i + 2;
    s3.addRow([
      { formula: `Hood_Calculations!A${n}` },
      { formula: `Hood_Calculations!W${n}` },
      { formula: `(${gov}-B${n})/${gov}*100` },
      { formula: `Hood_Calculations!G${n}` },
      { formula: `IF(C${n}>5,D${n}*SQRT(${gov}/B${n}),D${n})` },
      { formula: `IF(C${n}=0,"Governing",IF(C${n}<=5,"OK",IF(C${n}<=20,"Flow corrected","Redesign")))` },
    ]);
  });
  s3.addRow(["Total Q (m³/s)", "", "", "", { formula: `SUM(E2:E${last})` }]).font = { bold: true };

  // Sheet 4 — Main duct, cleaner, fan
  const s4 = wb.addWorksheet("AirCleaner_Fan");
  s4.columns = [{ width: 40 }, { width: 16 }, { width: 10 }];
  const rows: [string, number | { formula: string }, string][] = [
    ["Total flow Q", { formula: `Junction_Balance!E${last + 1}` }, "m³/s"],
    ["Main duct diameter (selected)", r.main.diameterMm, "mm"],
    ["Main duct velocity", { formula: "B1/(PI()*(B2/1000)^2/4)" }, "m/s"],
    ["Main duct VP", { formula: "0.5*Project_Summary!B6*B3^2" }, "Pa"],
    ["Main duct length", input.mainLength, "m"],
    ["Main duct friction (Darcy–Weisbach)", r.main.friction, "Pa"],
    ["Main fittings ΣK", input.mainElbows * input.mainElbowK, "—"],
    ["Main fittings loss", { formula: "B7*B4" }, "Pa"],
    ["Junction acceleration loss", r.accelLoss, "Pa"],
    ["Air cleaner ΔP", input.cleanerLoss, "Pa"],
    ["SP fan inlet", { formula: `${gov}+B6+B8+B9+B10` }, "Pa"],
    ["SP fan outlet (stack + outlet duct)", r.spOutlet, "Pa"],
    ["FSP = SPin + SPout − VPin", { formula: "B11+B12-B4" }, "Pa"],
    ["FTP ≈ SPin + SPout (same outlet diameter)", { formula: "B11+B12" }, "Pa"],
    ["Density factor ρ/1.204", { formula: "Project_Summary!B6/1.204" }, "—"],
    ["FSP at standard density", { formula: "B13/B15" }, "Pa"],
    ["Fan efficiency", input.fanEfficiency, "—"],
    ["Motor efficiency", input.motorEfficiency, "—"],
    ["Air power", { formula: "B1*B14/1000" }, "kW"],
    ["Shaft power", { formula: "B19/B17" }, "kW"],
    ["Motor input power", { formula: "B20/B18" }, "kW"],
    ["Existing supply air", input.supplyAir, "m³/h"],
    ["Make-up air balance (supply − exhaust)", { formula: "B22-B1*3600" }, "m³/h"],
  ];
  rows.forEach((row) => s4.addRow(row));
  [2, 5, 7, 10, 17, 18, 22].forEach((n) => (s4.getRow(n).getCell(2).font = blue));

  // Sheet 5 — Warnings / read me
  const s5 = wb.addWorksheet("Read_Me_Assumptions");
  s5.columns = [{ width: 120 }];
  s5.addRow(["Blue = user input; black = formula. Friction by SI Darcy–Weisbach (Swamee–Jain). Source basis: ACGIH Industrial Ventilation (23rd ed., 1998) and Handbook of Ventilation for Contaminant Control ch.8."]);
  s5.addRow([]);
  [...r.warnings, ...MANDATORY_WARNINGS].forEach((w) => s5.addRow([w]));

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ventilation-plus-${Date.now()}.xlsx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
