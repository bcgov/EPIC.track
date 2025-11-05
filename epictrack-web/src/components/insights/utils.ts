import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";

export const COLORS = [
  "#4F81BD",
  "#C0504D",
  "#8064A2",
  "#4BACC6",
  "#9BBB59",
  "#F79646",
  "#2C4D75",
  "#772C2A",
  "#5F7530",
  "#4D3B62",
];
export const BAR_COLOR = "#4BACC6";

export const getChartColor = (index: number) => {
  if (index < COLORS.length) {
    return COLORS[index];
  }
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

/* Helper to export insights charts to PDF */
export const exportAccordionChartsToPdf = async (
  container: HTMLDivElement,
  name: string,
) => {
  if (!container) return;

  name = name.replace(/\s+/g, "-");

  // Clone the charts container
  const clone = container.cloneNode(true) as HTMLDivElement;

  // Offscreen wrapper to remove height restrictions
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.top = "-9999px";
  wrapper.style.left = "-9999px";
  wrapper.style.width = container.offsetWidth + "px";
  wrapper.style.display = "block";
  wrapper.classList.add("exporting");

  const style = document.createElement("style");
  style.innerHTML = `
    .exporting * {
      max-height: none !important;
      height: auto !important;
      overflow: visible !important;
    }
  `;
  wrapper.appendChild(style);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const origCharts = container.querySelectorAll(".chart-item");
  const clonedCharts = clone.querySelectorAll(".chart-item");
  origCharts.forEach((orig, idx) => {
    const rect = (orig as HTMLElement).getBoundingClientRect();
    (clonedCharts[idx] as HTMLElement).style.maxWidth = rect.width + "px";
    (clonedCharts[idx] as HTMLElement).style.height = "auto";
    (clonedCharts[idx] as HTMLElement).style.flex = "0 0 auto";
    (clonedCharts[idx] as HTMLElement).style.alignSelf = "flex-start";
  });

  try {
    const pdf = new jsPDF("p", "mm", "letter");
    const pageMargin = 10;
    const pageSpacing = 5;
    const pageWidth = pdf.internal.pageSize.getWidth() - pageMargin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - pageMargin * 2;

    const chartNodes = wrapper.querySelectorAll(".chart-item");
    let currentY = pageMargin;

    for (let i = 0; i < chartNodes.length; i++) {
      const chartNode = chartNodes[i] as HTMLDivElement;

      // Original size in mm (px * 0.2646)
      const pxToMm = 0.2646;
      const pixelRatio = 2;

      // Chart as PNG
      const dataUrl = await htmlToImage.toPng(chartNode, {
        quality: 1,
        backgroundColor: "white",
        skipFonts: true,
        pixelRatio: pixelRatio,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });

      let originalWidth = (img.width / pixelRatio) * pxToMm;
      let originalHeight = (img.height / pixelRatio) * pxToMm;

      let scaledWidth = originalWidth;
      let scaledHeight = originalHeight;

      // Only scale down if wider than page
      if (scaledWidth > pageWidth) {
        const widthScale = pageWidth / scaledWidth;
        scaledWidth *= widthScale;
        scaledHeight *= widthScale;
      }
      // Only scale down if taller than page
      if (scaledHeight > pageHeight) {
        const heightScale = pageHeight / scaledHeight;
        scaledWidth *= heightScale;
        scaledHeight *= heightScale;
      }

      // Start new page if chart doesn't fit remaining space
      if (currentY + scaledHeight > pageHeight + pageMargin) {
        pdf.addPage();
        currentY = pageMargin;
      }

      pdf.addImage(
        dataUrl,
        "PNG",
        pageMargin,
        currentY,
        scaledWidth,
        scaledHeight,
      );
      currentY += scaledHeight + pageSpacing;
    }

    pdf.save(`EPIC-Track-${name}.pdf`);
  } finally {
    // Remove offscreen wrapper
    document.body.removeChild(wrapper);
  }
};
