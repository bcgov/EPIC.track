import { SxProps } from "@mui/material";

export type Icon =
  | "AllIcon"
  | "DashboardIcon"
  | "ReportIcon"
  | "InsightIcon"
  | "GearIcon"
  | "PenIcon"
  | "GridIcon"
  | "UserIcon";

export interface IconProps {
  className?: string;
  width?: string;
  height?: string;
  viewBox?: string;
  fill?: string;
  sx?: SxProps;
}
