import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { Palette } from "styles/theme";

type TabButtonProps = ButtonProps & {
  active?: boolean;
};
const TabButton: React.FC<TabButtonProps> = ({
  children,
  active = true,
  ...rest
}) => (
  <Button
    variant="outlined"
    sx={[
      active && {
        backgroundColor: Palette.primary.main,
        color: Palette.white,
      },
      !active && {
        backgroundColor: Palette.white,
        color: Palette.primary.main,
      },
    ]}
    {...rest}
  >
    {children}
  </Button>
);

export default TabButton;
