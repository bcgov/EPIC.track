import { SvgIconProps, SxProps } from "@mui/material";

export type Icon =
  | "AllIcon"
  | "CheckListIcon"
  | "DashboardIcon"
  | "ReportIcon"
  | "InsightIcon"
  | "GearIcon"
  | "PenIcon"
  | "GridIcon"
  | "UserIcon"
  | "CategoryIcon"
  | "PendingActions"
  | "ApproveCircle"
  | "ApplyHere"
  | "AddBubble"
  | "Submission";

export interface IconProps extends SvgIconProps {
  className?: string;
  width?: string;
  height?: string;
  viewBox?: string;
  fill?: string;
  sx?: SxProps;
  style?: React.CSSProperties;
}
