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
