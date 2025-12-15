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
  //Fixed export size for consistency
  const EXPORT_WIDTH = 750;

  // Offscreen wrapper to remove height restrictions
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.top = "-9999px";
  wrapper.style.left = "-9999px";
  wrapper.style.width = EXPORT_WIDTH + "px";
  wrapper.style.display = "block";
  wrapper.classList.add("exporting");

  const style = document.createElement("style");
  style.innerHTML = `
    .exporting * {
      max-height: none !important;
      height: auto !important;
      overflow: visible !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-smoothing: antialiased;
    }
    .exporting svg {
      overflow: visible !important;
    }
    .exporting .recharts-wrapper {
      overflow: visible !important;
      max-width: 650px !important;
      min-width: 300px !important;
    }
    /* Recharts does not render legends inside main svg of the chart. 
    Manually set legend font sizes for export */
    .exporting .recharts-legend-wrapper .recharts-legend-item-text {
      font-size: 14px !important;
      line-height: 1 !important;
    }
    .exporting .median-phase-overage-worktype-chart .recharts-legend-wrapper {
      transform: scale(0.5) translateX(20%);
      transform-origin: top right;
    }
  }

  `;
  wrapper.appendChild(style);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const clonedCharts = clone.querySelectorAll(".chart-item");
  clonedCharts.forEach((chart) => {
    const chartEl = chart as HTMLElement;
    chartEl.style.width = EXPORT_WIDTH + "px";
    chartEl.style.maxWidth = EXPORT_WIDTH + "px";
    chartEl.style.minWidth = EXPORT_WIDTH + "px";
    chartEl.style.height = "auto";
    chartEl.style.flex = "0 0 auto";
    chartEl.style.alignSelf = "flex-start";

    const colorBoxes = chartEl.querySelectorAll(".MuiBox-root");
    colorBoxes.forEach((box) => {
      const boxEl = box as HTMLElement;
      const bgColor = boxEl.style.backgroundColor;
      if (bgColor) {
        // Re-apply background color to ensure it's captured
        boxEl.style.backgroundColor = bgColor;
        boxEl.style.setProperty("background-color", bgColor, "important");
      }
    });
  });

  // Allow time for offscreen rendering
  await new Promise((resolve) => setTimeout(resolve, 300));

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
      const pixelRatio = 4;

      // Chart as PNG
      const dataUrl = await htmlToImage.toPng(chartNode, {
        quality: 1,
        backgroundColor: "white",
        skipFonts: true,
        pixelRatio: pixelRatio,
        cacheBust: true,
        style: {
          // Force consistent font rendering
          fontFamily: window.getComputedStyle(chartNode).fontFamily,
        },
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
