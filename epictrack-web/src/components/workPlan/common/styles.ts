import { SxProps } from "@mui/material";
import { Palette } from "../../../styles/theme";

export const titleStyle: SxProps = {
  borderBottom: `2px solid ${Palette.primary.main}`,
  paddingBottom: "0.5rem",
};
export const tabStyle: SxProps = {
  paddingBottom: "0.5rem !important",
  fontSize: "1.5rem !important",
  fontWeight: 400,
  lineHeight: "1.3rem",
  "&.Mui-selected": {
    fontWeight: 400,
  },
  minHeight: "0px",
};
export const tabPanelStyle: SxProps = {
  padding: "1.5rem 0px 1rem 1rem",
  minHeight: "0px",
};
