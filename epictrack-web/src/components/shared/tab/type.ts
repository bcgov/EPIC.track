import { SxProps, TabTypeMap } from "@mui/material";

type ETTabProps = {
  sx?: SxProps;
  identifier?: string;
  label: string | React.ReactNode;
  value?: any;
  icon?: undefined | React.ReactNode;
  [x: string]: unknown;
};

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  className?: string;
  value?: any;
  sx?: SxProps;
}

export default ETTabProps;
