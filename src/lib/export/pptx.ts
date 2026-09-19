import type { Deck } from "@/lib/pitch/types";

// PitchPilot palette (hex, no #) for PptxGenJS
const C = {
  mintIce: "DDF7EF",
  mintSoft: "C8EEE4",
  mintDeep: "8FD5C5",
  cadet: "5F7F8F",
  cadetDeep: "405C69",
  navy: "17252D",
  offWhite: "F7FBFA",
};

const safeName = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "pitch";

/** Build and download a .pptx of the deck. Browser-only (dynamic import keeps SSR clean). */
export async function exportPptx(deck: Deck) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  pptx.author = "PitchPilot AI";
  pptx.title = `${deck.startupName} — Investor Pitch`;

  for (const slide of deck.slides) {
    const s = pptx.addSlide();
    s.background = { color: slide.number === 1 ? C.navy : C.offWhite };

    // left brand band
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: C.mintDeep }, line: { color: C.mintDeep } });

    if (slide.number === 1) {
      s.addText("INVESTOR PITCH", { x: 0.8, y: 1.2, w: 8, h: 0.4, fontSize: 12, color: C.mintDeep, bold: true, charSpacing: 4, fontFace: "Calibri" });
      s.addText(deck.startupName, { x: 0.8, y: 1.6, w: 8.5, h: 1.3, fontSize: 48, bold: true, color: C.mintIce, fontFace: "Calibri" });
      s.addText(deck.tagline || slide.content[0] || "", { x: 0.8, y: 2.95, w: 8, h: 0.9, fontSize: 20, color: C.mintSoft, fontFace: "Calibri" });
      s.addText(deck.industry, { x: 0.8, y: 4.6, w: 8, h: 0.4, fontSize: 12, color: C.cadet, fontFace: "Calibri" });
      continue;
    }

    s.addText(`${String(slide.number).padStart(2, "0")}  —  ${deck.startupName.toUpperCase()}`, {
      x: 0.6, y: 0.35, w: 6, h: 0.3, fontSize: 10, color: C.cadet, bold: true, charSpacing: 3, fontFace: "Calibri",
    });
    s.addText(slide.title, { x: 0.6, y: 0.65, w: slide.keyMetric ? 5.9 : 8.6, h: 0.9, fontSize: 28, bold: true, color: C.navy, fontFace: "Calibri", valign: "top" });

    if (slide.keyMetric) {
      s.addShape(pptx.ShapeType.roundRect, { x: 6.7, y: 0.6, w: 2.7, h: 1.05, fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.12 });
      s.addText("KEY METRIC", { x: 6.85, y: 0.66, w: 2.4, h: 0.25, fontSize: 8, color: C.mintDeep, bold: true, charSpacing: 2, fontFace: "Calibri" });
      s.addText(slide.keyMetric, { x: 6.85, y: 0.9, w: 2.45, h: 0.7, fontSize: 11, bold: true, color: C.mintIce, fontFace: "Calibri", valign: "top", fit: "shrink" });
    }

    const bullets = slide.content.slice(0, 6).map((line) => ({
      text: line,
      options: { bullet: { code: "25CF" }, color: C.cadetDeep, fontSize: 14, breakLine: true, paraSpaceAfter: 8 },
    }));
    s.addText(bullets, { x: 0.6, y: 1.75, w: 8.8, h: 3.2, fontFace: "Calibri", valign: "top", fit: "shrink" });

    s.addText(`${deck.startupName} · Confidential`, { x: 0.6, y: 5.2, w: 5, h: 0.3, fontSize: 9, color: C.cadet, fontFace: "Calibri" });
    s.addText(`${slide.number} / ${deck.slides.length}`, { x: 8.4, y: 5.2, w: 1, h: 0.3, fontSize: 9, color: C.cadet, align: "right", fontFace: "Calibri" });
  }

  await pptx.writeFile({ fileName: `${safeName(deck.startupName)}-pitch.pptx` });
}

/** Build and download a PDF of the deck with jsPDF (vector text, palette-consistent). */
export async function exportPdf(deck: Deck) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: [960, 540] });
  const hex = (h: string) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] as [number, number, number];

  deck.slides.forEach((slide, idx) => {
    if (idx > 0) doc.addPage([960, 540], "landscape");
    const cover = slide.number === 1;
    doc.setFillColor(...hex(cover ? C.navy : C.offWhite));
    doc.rect(0, 0, 960, 540, "F");
    doc.setFillColor(...hex(C.mintDeep));
    doc.rect(0, 0, 14, 540, "F");

    if (cover) {
      doc.setTextColor(...hex(C.mintDeep));
      doc.setFontSize(11);
      doc.text("INVESTOR PITCH", 70, 150);
      doc.setTextColor(...hex(C.mintIce));
      doc.setFont("helvetica", "bold");
      doc.setFontSize(46);
      doc.text(doc.splitTextToSize(deck.startupName, 800), 70, 215);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.setTextColor(...hex(C.mintSoft));
      doc.text(doc.splitTextToSize(deck.tagline || slide.content[0] || "", 760), 70, 290);
      doc.setFontSize(11);
      doc.setTextColor(...hex(C.cadet));
      doc.text(deck.industry, 70, 480);
      return;
    }

    doc.setTextColor(...hex(C.cadet));
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${String(slide.number).padStart(2, "0")}  —  ${deck.startupName.toUpperCase()}`, 60, 50);
    doc.setTextColor(...hex(C.navy));
    doc.setFontSize(26);
    const titleW = slide.keyMetric ? 560 : 830;
    doc.text(doc.splitTextToSize(slide.title, titleW), 60, 90);

    if (slide.keyMetric) {
      doc.setFillColor(...hex(C.navy));
      doc.roundedRect(650, 55, 250, 90, 12, 12, "F");
      doc.setTextColor(...hex(C.mintDeep));
      doc.setFontSize(7);
      doc.text("KEY METRIC", 664, 74);
      doc.setTextColor(...hex(C.mintIce));
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(slide.keyMetric, 222), 664, 92);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(...hex(C.cadetDeep));
    let y = 175;
    for (const line of slide.content.slice(0, 6)) {
      const wrapped = doc.splitTextToSize(line, 800) as string[];
      doc.setFillColor(...hex(C.mintDeep));
      doc.circle(66, y - 4, 3, "F");
      doc.text(wrapped, 82, y);
      y += wrapped.length * 17 + 10;
      if (y > 470) break;
    }

    doc.setFontSize(8);
    doc.setTextColor(...hex(C.cadet));
    doc.text(`${deck.startupName} · Confidential`, 60, 515);
    doc.text(`${slide.number} / ${deck.slides.length}`, 900, 515, { align: "right" });
  });

  doc.save(`${safeName(deck.startupName)}-pitch.pdf`);
}
