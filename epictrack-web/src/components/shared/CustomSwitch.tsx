import { styled } from "@mui/material/styles";
import { Palette } from "../../styles/theme";
import * as tokens from "../../styles/designTokens";
import Switch, { SwitchProps } from "@mui/material/Switch";

export const CustomSwitch = styled((props: SwitchProps) => (
  <Switch
    focusVisibleClassName=".Mui-focusVisible"
    disableRipple
    {...props}
    disabled={props.disabled}
  />
))((props: SwitchProps) => ({
  width: 40,
  height: 24,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: Palette.white,
      "& + .MuiSwitch-track": {
        backgroundColor: `${
          props.disabled ? Palette.neutral.light : Palette.primary.accent.main
        }`,
        opacity: 1,
      },
    },
    "&.Mui-focusVisible": {
      outline: `2px solid ${tokens.surfaceColorBorderActive}`,
      outlineOffset: "2px",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: Palette.white,
    },
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: Palette.neutral.accent.light,
    opacity: 1,
  },
}));
