import { styled } from "@mui/material/styles";
import { Palette } from "../../styles/theme";
import Switch, { SwitchProps } from "@mui/material/Switch";

export const CustomSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(() => ({
  width: 40,
  height: 24,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#FFFFFF",
      "& + .MuiSwitch-track": {
        backgroundColor: Palette.primary.accent.main,
        opacity: 1,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
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
