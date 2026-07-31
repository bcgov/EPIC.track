import { styled } from "@mui/system";
import { Palette } from "../../../styles/theme";
import {
  MET_Header_Font_Weight_Bold,
  MET_Header_Font_Weight_Regular,
} from "../../../styles/constants";
import * as tokens from "../../../styles/designTokens";
import { Chip, Tab, Tabs } from "@mui/material";
import ETTabProps from "./type";

const ETTabs = styled(Tabs)({
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "2px",
    backgroundColor: Palette.neutral.bg.dark,
    bottom: 0,
    zIndex: -1,
  },
  "& .MuiTabs-flexContainer": {
    gap: "2rem",
  },
  "& .MuiTab-root": {
    padding: "0rem",
    color: Palette.neutral.dark,
    fontWeight: MET_Header_Font_Weight_Regular,
    fontSize: tokens.typographyFontSizeBody,
    minWidth: "0px",
  },
  "& .Mui-disabled": {
    color: tokens.typographyColorDisabled,
  },
  "& .Mui-selected": {
    fontWeight: MET_Header_Font_Weight_Bold,
    color: Palette.primary.main,
  },
  "& .Mui-focusVisible": {
    outline: `2px solid ${tokens.surfaceColorBorderActive}`,
    outlineOffset: "2px",
  },
});

const ETTab = ({ label, identifier, icon, ...props }: ETTabProps) => {
  return (
    <>
      <Tab
        disableRipple={true}
        sx={{
          flexDirection: "row",
          gap: "0.5rem",
          ...props.sx,
        }}
        label={
          <>
            {label}
            {identifier && (
              <Chip
                size="small"
                label={identifier}
                sx={{
                  backgroundColor: Palette.neutral.bg.dark,
                  color: Palette.neutral.dark,
                }}
              />
            )}
            {icon}
          </>
        }
        {...props}
      />
    </>
  );
};

export { ETTabs, ETTab };
