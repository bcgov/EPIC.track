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

  // Fixed export dimensions
  const EXPORT_WIDTH = 750;
  // Use a fixed pixelRatio
  const FIXED_PIXEL_RATIO = 2;

  // Conversion factor: standard 96 DPI
  const PX_TO_MM = 25.4 / 96;

  // Offscreen wrapper to remove height restrictions
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.top = "-9999px";
  wrapper.style.left = "-9999px";
  wrapper.style.width = EXPORT_WIDTH + "px";
  wrapper.style.display = "block";
  wrapper.classList.add("exporting");

  // Force standard DPI scaling
  wrapper.style.transform = "scale(1)";
  wrapper.style.transformOrigin = "top left";

  const style = document.createElement("style");
  style.innerHTML = `
    .exporting * {
      max-height: none !important;
      height: auto !important;
      overflow: visible !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-smoothing: antialiased;
      transform: none !important;
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
      transform: scale(0.5) translateX(20%) !important;
      transform-origin: top right !important;
    }`;
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

  // Allow more time for offscreen rendering to stabilize
  await new Promise((resolve) => setTimeout(resolve, 500));

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

      // Get the actual rendered size in logical pixels
      const rect = chartNode.getBoundingClientRect();
      const logicalWidth = rect.width;
      const logicalHeight = rect.height;

      // Chart as png with fixed pixel ratio for consistency
      const dataUrl = await htmlToImage.toPng(chartNode, {
        quality: 1,
        backgroundColor: "white",
        skipFonts: true,
        pixelRatio: FIXED_PIXEL_RATIO,
        cacheBust: true,
        // Explicitly set width/height to avoid browser scaling
        width: logicalWidth,
        height: logicalHeight,
        style: {
          // Force consistent font rendering
          fontFamily: window.getComputedStyle(chartNode).fontFamily,
          margin: "0",
          padding: "0",
        },
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });

      // Calculate size in mm using the logical pixel dimensions
      // This ensures consistency regardless of device pixel ratio
      let widthMm = logicalWidth * PX_TO_MM;
      let heightMm = logicalHeight * PX_TO_MM;

      // Scale to fit page width if necessary
      if (widthMm > pageWidth) {
        const scale = pageWidth / widthMm;
        widthMm = pageWidth;
        heightMm *= scale;
      }

      // Scale to fit page height if necessary
      if (heightMm > pageHeight) {
        const scale = pageHeight / heightMm;
        heightMm = pageHeight;
        widthMm *= scale;
      }

      // Start new page if chart doesn't fit remaining space
      if (currentY + heightMm > pageHeight + pageMargin) {
        pdf.addPage();
        currentY = pageMargin;
      }

      pdf.addImage(dataUrl, "PNG", pageMargin, currentY, widthMm, heightMm);
      currentY += heightMm + pageSpacing;
    }

    pdf.save(`EPIC-Track-${name}.pdf`);
  } finally {
    // Remove offscreen wrapper
    document.body.removeChild(wrapper);
  }
};
