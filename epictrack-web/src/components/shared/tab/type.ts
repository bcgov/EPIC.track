import { SxProps, TabTypeMap } from "@mui/material";

type ETTabProps = {
  sx?: SxProps;
  identifier?: string;
  label: string | React.ReactNode;
  value?: any;
  [x: string]: unknown;
};

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  className?: string;
  value?: any;
}

export default ETTabProps;
