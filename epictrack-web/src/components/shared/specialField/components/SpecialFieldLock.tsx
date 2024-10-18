import React from "react";
import { ETFormLabel } from "../..";
import { IconButton, Stack } from "@mui/material";
import icons from "../../../icons";
import { IconProps } from "../../../icons/type";
import { Palette } from "../../../../styles/theme";

interface SpecialFieldLockProps {
  id: number;
  open: boolean;
  onLockClick: () => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
}
export const SpecialFieldLock = ({
  id,
  open = false,
  onLockClick,
  label,
  required = false,
  disabled = false,
}: SpecialFieldLockProps) => {
  const LockClosedIcon: React.FC<IconProps> = icons["LockClosedIcon"];
  const LockOpenIcon: React.FC<IconProps> = icons["LockOpenIcon"];

  return (
    <Stack
      direction="row"
      justifyContent={"space-between"}
      sx={{
        paddingTop: "3px",
      }}
    >
      <ETFormLabel required={required}>{label}</ETFormLabel>
      <IconButton
        onClick={onLockClick}
        disableRipple
        disabled={disabled}
        sx={{ padding: 0 }}
      >
        {open ? (
          <LockOpenIcon
            htmlColor={disabled ? "inherit" : Palette.primary.accent.main}
          />
        ) : (
          <LockClosedIcon
            htmlColor={disabled ? "inherit" : Palette.primary.accent.main}
          />
        )}
      </IconButton>
    </Stack>
  );
};
