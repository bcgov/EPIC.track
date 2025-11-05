import { ReactNode } from "react";

export interface WarningBoxProps {
  title?: string;
  isTitleBold: boolean;
  subTitle?: ReactNode;
  onCloseHandler?: () => void;
}
