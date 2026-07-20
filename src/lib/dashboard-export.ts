import * as XLSX from "xlsx";

export type SummaryRow = { label: string; value: string | number };
export type TableSection = { title: string; cols: string[]; rows: (string | number)[][] };

export function exportToExcel(fileName: string, summary: SummaryRow[], sections: TableSection[]) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const sumAoA: (string | number)[][] = [["البند", "القيمة"], ...summary.map((s) => [s.label, s.value])];
  const wsSum = XLSX.utils.aoa_to_sheet(sumAoA);
  wsSum["!cols"] = [{ wch: 28 }, { wch: 20 }];
  (wsSum as unknown as { "!rtl": boolean })["!rtl"] = true;
  XLSX.utils.book_append_sheet(wb, wsSum, "الملخص");

  // Each section as its own sheet
  sections.forEach((sec) => {
    const aoa: (string | number)[][] = [sec.cols, ...sec.rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = sec.cols.map(() => ({ wch: 20 }));
    (ws as unknown as { "!rtl": boolean })["!rtl"] = true;
    const sheetName = sec.title.slice(0, 30);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportToPDF(title: string, summary: SummaryRow[], sections: TableSection[]) {
  const esc = (v: string | number) =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const summaryHtml = `
    <table>
      <thead><tr><th>البند</th><th>القيمة</th></tr></thead>
      <tbody>${summary.map((s) => `<tr><td>${esc(s.label)}</td><td>${esc(s.value)}</td></tr>`).join("")}</tbody>
    </table>`;

  const sectionsHtml = sections
    .map(
      (sec) => `
      <h2>${esc(sec.title)}</h2>
      <table>
        <thead><tr>${sec.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
        <tbody>${
          sec.rows.length === 0
            ? `<tr><td colspan="${sec.cols.length}" style="text-align:center;color:#888">لا توجد بيانات</td></tr>`
            : sec.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")
        }</tbody>
      </table>`,
    )
    .join("");

  const date = new Date().toLocaleString("ar-SA");
  const html = `<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", "Tahoma", "Arial", sans-serif; color: #111; margin: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 22px 0 8px; border-bottom: 2px solid #333; padding-bottom: 4px; }
  .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #bbb; padding: 6px 8px; text-align: right; }
  th { background: #f0f0f0; font-weight: 700; }
  tbody tr:nth-child(even) td { background: #fafafa; }
  .actions { margin-top: 20px; display: flex; gap: 12px; justify-content: center; }
  .actions button { padding: 8px 24px; border-radius: 8px; border: none; font-size: 14px; cursor: pointer; }
  .btn-print { background: #009688; color: #fff; }
  .btn-close { background: #eee; color: #333; border: 1px solid #ccc; }
  @media print {
    .actions { display: none; }
    body { margin: 12mm; }
    h2 { page-break-after: avoid; }
    tr { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <div class="meta">تاريخ التصدير: ${esc(date)}</div>
  <h2>الملخص</h2>
  ${summaryHtml}
  ${sectionsHtml}
  <div class="actions">
    <button class="btn-print" onclick="window.print()">🖨️ طباعة</button>
    <button class="btn-close" onclick="window.close()">✖ إغلاق</button>
  </div>
  <script>
    // طباعة تلقائية بعد تحميل النافذة مباشرة (مع تأخير صغير)
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
    // إغلاق النافذة بعد الطباعة (في حال تمت)
    window.onafterprint = function() {
      // إعطاء المستخدم خيار الإغلاق أو يمكن إغلاق تلقائي بعد 3 ثوانٍ
      // لكننا نفضل ترك المستخدم يغلق يدوياً لأن بعض المتصفحات تمنع الإغلاق التلقائي
      // فقط ننبه المستخدم
      console.log("تمت الطباعة، يمكنك إغلاق النافذة.");
    };
  </script>
</body>
</html>`;

  // فتح النافذة الجديدة مع خصائص مناسبة
  const w = window.open("", "_blank", "width=800,height=700,scrollbars=yes,menubar=no,location=no,status=no");
  if (!w) {
    alert("يرجى السماح بالنوافذ المنبثقة لتصدير PDF");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();

  // محاولة تركيز النافذة واستدعاء الطباعة (لكن سيتم عبر onload)
  w.focus();
}
