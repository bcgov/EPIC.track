import { styled } from "@mui/system";
import { Palette } from "../../../styles/theme";
import {
  MET_Header_Font_Weight_Bold,
  MET_Header_Font_Weight_Regular,
} from "../../../styles/constants";
import { Chip, Tab, Tabs } from "@mui/material";
import ETTabProps from "./type";

const ETTabs = styled(Tabs)({
  "& .MuiTabs-flexContainer": {
    gap: "2rem",
  },
  "& .MuiTab-root": {
    padding: "0rem",
    color: Palette.neutral.dark,
    fontWeight: MET_Header_Font_Weight_Regular,
    fontSize: "1rem",
    minWidth: "0px",
  },
  "& .Mui-disabled": {
    color: Palette.neutral.accent.light,
  },
  "& .Mui-selected": {
    fontWeight: MET_Header_Font_Weight_Bold,
    color: Palette.primary.main,
  },
  "& :hover": {
    fontWeight: MET_Header_Font_Weight_Regular,
    color: Palette.primary.main,
  },
});

const ETTab = ({ label, identifier, ...props }: ETTabProps) => {
  return (
    <>
      {identifier && (
        <Tab
          sx={{
            ...props.sx,
            flexDirection: "row",
            gap: "0.5rem",
          }}
          label={
            <>
              {label}
              <Chip
                size="small"
                label={identifier}
                sx={{
                  backgroundColor: Palette.neutral.bg.dark,
                  color: Palette.neutral.dark,
                }}
              />
            </>
          }
          {...props}
        />
      )}
      {!identifier && (
        <Tab
          sx={{
            ...props.sx,
          }}
          label={label}
          {...props}
        />
      )}
    </>
  );
};

export { ETTabs, ETTab };
