import React, { useMemo } from "react";
import { SpecialFieldGrid } from "../../shared/specialField";
import {
  SPECIAL_FIELDS,
  SpecialFieldEntityEnum,
} from "../../../constants/application-constant";
import { ETCaption3, ETFormLabel } from "../../shared";
import { Box, Grid, IconButton } from "@mui/material";
import icons from "../../icons";
import { IconProps } from "../../icons/type";
import { Palette } from "../../../styles/theme";
import { When } from "react-if";
import { Staff } from "../../../models/staff";

interface WorkLeadSpecialFieldProps {
  id: number;
  options: Staff[];
  onSave?: () => void;
  open: boolean;
  onLockClick: () => void;
  children: React.ReactNode;
}
export const WorkLeadSpecialField = ({
  id,
  onSave,
  open = false,
  onLockClick,
  options,
  children,
}: WorkLeadSpecialFieldProps) => {
  const LockClosedIcon: React.FC<IconProps> = icons["LockClosedIcon"];
  const LockOpenIcon: React.FC<IconProps> = icons["LockOpenIcon"];

  const selectOptions = useMemo(() => {
    return options.map((option) => ({
      label: option.full_name,
      value: String(option.id),
    }));
  }, [options]);

  return (
    <>
      <Grid item xs={6}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "3px",
          }}
        >
          <ETFormLabel required>Work Lead</ETFormLabel>
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
        </Box>
        {children}
      </Grid>
      <When condition={open}>
        <Grid item xs={12}>
          <SpecialFieldGrid
            entity={SpecialFieldEntityEnum.WORK}
            entity_id={id}
            fieldName={SPECIAL_FIELDS.WORK.WORK_LEAD}
            fieldLabel={"Work Lead"}
            fieldType={"select"}
            title={"Work Lead History"}
            description={
              <ETCaption3>
                Update the Work Lead of this work.{" "}
                <a href="#">Click this link</a> for detailed instructions.
              </ETCaption3>
            }
            options={selectOptions}
            onSave={onSave}
          />
        </Grid>
      </When>
    </>
  );
};
