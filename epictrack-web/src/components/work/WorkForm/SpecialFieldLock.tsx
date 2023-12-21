import React from "react";
import { ETFormLabel } from "../../shared";
import { IconButton, Stack } from "@mui/material";
import icons from "../../icons";
import { IconProps } from "../../icons/type";
import { Palette } from "../../../styles/theme";

interface SpecialFieldLockProps {
  id: number;
  open: boolean;
  onLockClick: () => void;
  label: string;
  required?: boolean;
}
export const SpecialFieldLock = ({
  id,
  open = false,
  onLockClick,
  label,
  required = false,
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
        disabled={!id}
        sx={{ padding: 0 }}
      >
        {open ? (
          <LockOpenIcon fill={Palette.primary.accent.main} />
        ) : (
          <LockClosedIcon fill={Palette.primary.accent.main} />
        )}
      </IconButton>
    </Stack>
  );
};
