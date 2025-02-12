import React, { useMemo } from "react";
import { Grid, Link } from "@mui/material";
import { SpecialFieldLock } from "components/shared/specialField/components/SpecialFieldLock";
import { SpecialFieldGrid } from "components/shared/specialField";
import { ETCaption3, ETFormLabel } from "components/shared";
import { When } from "react-if";
import {
  EPIC_SUPPORT_LINKS,
  SpecialFieldEntityEnum,
} from "constants/application-constant";
import { ListType } from "models/code";
import { Staff } from "models/staff";

interface SpecialFieldProps {
  id?: number;
  options: ListType[] | Staff[];
  onSave?: () => void;
  open: boolean;
  onLockClick: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  entity: SpecialFieldEntityEnum;
  fieldName: string;
  fieldLabel: string;
  fieldValueType: string;
}

export const WorkFormSpecialField = ({
  id,
  onSave,
  open = false,
  onLockClick,
  options,
  disabled = false,
  children,
  entity,
  fieldName,
  fieldLabel,
  fieldValueType,
}: SpecialFieldProps) => {
  const selectOptions = useMemo(() => {
    return options.map((option) => ({
      label: "name" in option ? option.name : option.full_name,
      value: String(option.id),
    }));
  }, [options]);

  if (!id) {
    return (
      <Grid item xs={6}>
        <ETFormLabel required>{fieldLabel}</ETFormLabel>
        {children}
      </Grid>
    );
  }

  return (
    <>
      <Grid item xs={6}>
        <SpecialFieldLock
          id={id}
          open={open}
          onLockClick={onLockClick}
          label={fieldLabel}
          required
          disabled={disabled}
        />
        {children}
      </Grid>
      <When condition={open}>
        <Grid item xs={12}>
          <SpecialFieldGrid
            entity={entity}
            entity_id={id}
            fieldName={fieldName}
            fieldLabel={fieldLabel}
            fieldValueType={fieldValueType}
            fieldType="select"
            title={`${fieldLabel} History`}
            description={
              <ETCaption3>
                Update the {fieldLabel} of this work.{" "}
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
