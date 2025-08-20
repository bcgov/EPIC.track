import { Palette } from "styles/theme";
import { Icon } from "components/icons/type";

export const DEFAULT_MIN_CELL_SIZE_PX = 24;
export const DEFAULT_LABEL_WIDTH = 95;
export const DEFAULT_DAYS_IN_ROW = 37;

export const LEGEND_COLOURS = {
  border: {
    MILESTONE: Palette.primary.light,
    TASK: "#419388",
  },
  backgroundColour: {
    MILESTONE: "#BACDDF",
    TASK: "#C6DFDB",
  },
};

interface LegendItemProps {
  icon: Icon;
  text: string;
  calendars: ("my-calendar" | "eao-calendar")[];
}

export const LEGEND_ITEMS: LegendItemProps[] = [
  {
    icon: "ApproveCircle",
    text: "Milestone",
    calendars: ["my-calendar"],
  },
  {
    icon: "AllIcon",
    text: "Task",
    calendars: ["my-calendar"],
  },
  {
    icon: "ApproveCircle",
    text: "Milestone (specific)",
    calendars: ["eao-calendar"],
  },
  {
    icon: "ApplyHere",
    text: "Decision",
    calendars: ["my-calendar", "eao-calendar"],
  },
  {
    icon: "AddBubble",
    text: "PCP",
    calendars: ["my-calendar", "eao-calendar"],
  },
  {
    icon: "Submission",
    text: "Submission",
    calendars: ["my-calendar", "eao-calendar"],
  },
];

export const WORK_LEGEND_COLOURS = [
  "#F5CACB",
  "#DAD4E8",
  "#F9E9C4",
  "#C7E3EE",
  "#E9EECB",
  "#D4E0E2",
  "#C0CDDC",
  "#DBDCDC",
  "#A9C2C6",
  "#FEDD8C",
  "#C2EACA",
  "#d29f9c",
  "#ae8e8c",
  "#d5b77f",
  "#b4e9dc",
  "#9db3e3",
  "#95a566",
  "#c39662",
  "#fff4ae",
  "#62ad83",
  "#e0ddac",
  "#b595ac",
  "#ffd6f0",
  "#a6d2d3",
  "#73a4c2",
  "#e8ffd3",
  "#9a9ac6",
  "#ffffcc",
  "#66ab93",
  "#ffc3a8",
  "#ffdbab",
  "#c2ad8e",
  "#a1947d",
  "#ac9d74",
  "#6a8a66",
  "#896660",
  "#847673",
  "#b5a857",
  "#936887",
  "#846c7d",
  "#71acc5",
  "#D6EBFF",
  "#c98c63",
  "#ad886f",
  "#776ab8",
  "#c6dae1",
  "#fffbe6",
  "#cce7ff",
  "#90a48c",
  "#d5f0dd",
  "#b39985",
  "#8ca99c",
  "#ffcca5",
  "#ffb2b6",
  "#b99a69",
  "#d38c83",
  "#43adb4",
  "#88d4ff",
  "#bfc2ff",
];
