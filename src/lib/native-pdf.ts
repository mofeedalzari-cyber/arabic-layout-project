// Native/Web PDF generation & sharing helper.
// - On Android (Capacitor): render HTML → PDF (html2pdf.js) → save via Filesystem
//   → open the native Share Sheet (WhatsApp / Print Service / Gmail / Drive / …).
// - On Web: keep existing behaviour — open a new tab that auto-triggers print/save.

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  // @ts-ignore
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

function safeFileName(name: string): string {
  return (
    name
      .replace(/[\\/:*?"<>|]+/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 80) || "document"
  );
}

/**
 * Open an HTML document in a new window (Web fallback) that auto-prints.
 * Users can then choose "Save as PDF" or a printer from the browser dialog.
 */
function openHtmlForPrintWeb(html: string) {
  const w = window.open("", "_blank");
  if (!w) {
    alert("يرجى السماح بالنوافذ المنبثقة للطباعة");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/**
 * Render the given HTML string into a PDF Blob using html2pdf.js.
 * Rendered off-screen inside a hidden container.
 */
async function htmlToPdfBlob(html: string): Promise<Blob> {
  const html2pdf: any = (await import("html2pdf.js")).default;

  // Extract body content to avoid double <html> nesting
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const inner = bodyMatch ? bodyMatch[1] : html;
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  const styles = styleMatch ? styleMatch.join("\n") : "";

  const container = document.createElement("div");
  container.setAttribute("dir", "rtl");
  container.style.cssText =
    "position:fixed;left:-99999px;top:0;width:800px;background:#fff;color:#111;font-family:Cairo,Tahoma,Arial,sans-serif;";
  container.innerHTML = styles + inner;
  document.body.appendChild(container);

  try {
    const opt = {
      margin: [8, 8, 8, 8],
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    const blob: Blob = await html2pdf().set(opt).from(container).outputPdf("blob");
    return blob;
  } finally {
    container.remove();
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => {
      const s = String(r.result || "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.readAsDataURL(blob);
  });
}

/**
 * Generate a PDF from HTML and open the native Android Share Sheet,
 * or fall back to browser print on the web.
 *
 * @param html        Full HTML document (with <html><head><style></style></head><body>…</body></html>).
 * @param filename    Human filename (without extension). E.g. "كشف_حساب_المندوب".
 * @param dialogTitle Title of the share sheet.
 */
export async function sharePdfOrPrint(opts: {
  html: string;
  filename: string;
  dialogTitle?: string;
}) {
  const { html, filename, dialogTitle } = opts;

  if (!isNativeApp()) {
    openHtmlForPrintWeb(html);
    return;
  }

  try {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import("@capacitor/filesystem"),
      import("@capacitor/share"),
    ]);

    const blob = await htmlToPdfBlob(html);
    const base64 = await blobToBase64(blob);
    const name = `${safeFileName(filename)}_${Date.now()}.pdf`;

    // Write to Cache dir so we can share via file:// URI
    const written = await Filesystem.writeFile({
      path: name,
      data: base64,
      directory: Directory.Cache,
    });

    await Share.share({
      title: dialogTitle || filename,
      text: filename,
      url: written.uri,
      dialogTitle: dialogTitle || "مشاركة أو طباعة الملف",
    });
  } catch (err) {
    console.error("[sharePdfOrPrint] failed:", err);
    // Fallback — at least let the user see the document
    openHtmlForPrintWeb(html);
  }
}
