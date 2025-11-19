import { ReactNode } from "react";

export interface WarningBoxProps {
  title?: string;
  isTitleBold: boolean;
  subTitle?: ReactNode;
  variant?: "warning" | "error";
  onCloseHandler?: () => void;
}
