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

interface WorkLeadSpecialFieldProps {
  id?: number;
  options: Staff[];
  onSave?: () => void;
  open: boolean;
  onLockClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}
const TITLE = "Work Lead";
export const WorkLeadSpecialField = ({
  id,
  onSave,
  open = false,
  disabled = false,
  onLockClick,
  options,
  children,
}: WorkLeadSpecialFieldProps) => {
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
      <When condition={open && Boolean(id)}>
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
