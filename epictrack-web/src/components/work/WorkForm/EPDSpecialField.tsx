import React, { useMemo } from "react";
import { SpecialFieldGrid } from "../../shared/specialField";
import {
  EPIC_SUPPORT_LINKS,
  SPECIAL_FIELDS,
  SpecialFieldEntityEnum,
} from "../../../constants/application-constant";
import { ETCaption3, ETFormLabel } from "../../shared";
import { Grid, Link } from "@mui/material";
import { When } from "react-if";
import { Staff } from "../../../models/staff";
import { SpecialFieldLock } from "../../shared/specialField/components/SpecialFieldLock";
interface EPDSpecialFieldProps {
  id?: number;
  options: Staff[];
  onSave: () => void;
  open: boolean;
  onLockClick: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}
const TITLE = "Responsible EPD";
export const EPDSpecialField = ({
  id,
  onSave,
  open = false,
  onLockClick,
  options,
  disabled = false,
  children,
}: EPDSpecialFieldProps) => {
  const selectOptions = useMemo(() => {
    return options.map((option) => ({
      label: option.full_name,
      value: String(option.id),
    }));
  }, [options]);

  if (!id)
    return (
      <Grid item xs={6}>
        <ETFormLabel required>{TITLE}</ETFormLabel>
        {children}
      </Grid>
    );

  return (
    <>
      <Grid item xs={6}>
        <SpecialFieldLock
          id={id}
          open={open}
          onLockClick={onLockClick}
          label={TITLE}
          required
          disabled={disabled}
        />
        {children}
      </Grid>
      <When condition={open}>
        <Grid item xs={12}>
          <SpecialFieldGrid
            entity={SpecialFieldEntityEnum.WORK}
            entity_id={id}
            fieldName={SPECIAL_FIELDS.WORK.RESPONSIBLE_EPD}
            fieldLabel={"Responsible EPD"}
            fieldType={"select"}
            title={"Responsible EPD History"}
            description={
              <ETCaption3>
                Update the Responsible EPD of this work.{" "}
                <Link href={EPIC_SUPPORT_LINKS.SPECIAL_HISTORY} target="_blank">
                  Click this link
                </Link>{" "}
                for detailed instructions.
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
