import React, { useMemo } from "react";
import { SpecialFieldGrid } from "../../shared/specialField";
import {
  SPECIAL_FIELDS,
  SpecialFieldEntityEnum,
} from "../../../constants/application-constant";
import { ETCaption3 } from "../../shared";
import { Grid } from "@mui/material";
import { When } from "react-if";
import { Staff } from "../../../models/staff";
import { SpecialFieldLock } from "../../shared/specialField/components/SpecialFieldLock";
import { FocusTrap } from "@mui/base/FocusTrap";

interface EPDSpecialFieldProps {
  id: number;
  options: Staff[];
  onSave: () => void;
  open: boolean;
  onLockClick: () => void;
  children?: React.ReactNode;
}
export const EPDSpecialField = ({
  id,
  onSave,
  open = false,
  onLockClick,
  options,
  children,
}: EPDSpecialFieldProps) => {
  const selectOptions = useMemo(() => {
    return options.map((option) => ({
      label: option.full_name,
      value: String(option.id),
    }));
  }, [options]);

  return (
    <>
      <Grid item xs={6}>
        <SpecialFieldLock
          id={id}
          open={open}
          onLockClick={onLockClick}
          label={"Responsible EPD"}
          required
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
