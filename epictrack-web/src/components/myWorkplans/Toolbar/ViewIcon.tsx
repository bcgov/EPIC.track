import { Box } from "@mui/material";
import { IconProps } from "components/icons/type";
import React from "react";
import { Palette } from "styles/theme";

type ViewButtonProps = {
  active: boolean;
  icon: React.FC<IconProps>;
};
export const ViewIcon = ({ active, icon: Icon }: ViewButtonProps) => {
  return (
    <Box
      sx={[
        {
          padding: "6px",
          borderRadius: "4px",
          display: "flex",
        },
        active && {
          backgroundColor: Palette.primary.bg.light,
          border: `1px solid transparent`,
        },
        !active && {
          border: `1px solid ${Palette.neutral.accent.light}`,
        },
      ]}
    >
      <Icon
        fill={
          active ? Palette.primary.accent.light : Palette.neutral.accent.light
        }
      />
    </Box>
  );
};
