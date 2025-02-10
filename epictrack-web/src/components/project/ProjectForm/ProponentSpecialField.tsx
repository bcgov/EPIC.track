import React, { useMemo } from "react";
import { SpecialFieldGrid } from "../../shared/specialField";
import {
  EPIC_SUPPORT_LINKS,
  SPECIAL_FIELD_TYPES,
  SPECIAL_FIELDS,
  SpecialFieldEntityEnum,
} from "../../../constants/application-constant";
import { ETCaption3, ETFormLabel } from "../../shared";
import { Grid, Link } from "@mui/material";
import { When } from "react-if";
import { Proponent } from "../../../models/proponent";
import { SpecialFieldLock } from "../../shared/specialField/components/SpecialFieldLock";

interface ProponentSpecialFieldProps {
  id?: number;
  options: Proponent[];
  onSave: () => void;
  open: boolean;
  onLockClick: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}
const LABEL = "Proponent";
export const ProponentSpecialField = ({
  id,
  onSave,
  open = false,
  disabled = false,
  onLockClick,
  options,
  children,
}: ProponentSpecialFieldProps) => {
  const selectOptions = useMemo(() => {
    return options.map((option) => ({
      label: option.name,
      value: String(option.id),
    }));
  }, [options]);

  if (!id) {
    return (
      <Grid item xs={6}>
        <ETFormLabel>{LABEL}</ETFormLabel>
        {children}
      </Grid>
    );
  }

  return (
    <>
      <Grid item xs={12} />
      <Grid
        item
        xs={6}
        sx={{
          position: "absolute",
          right: 2,
          width: 372,
        }}
      >
        <SpecialFieldLock
          id={id}
          open={open}
          onLockClick={onLockClick}
          label={LABEL}
          required
          disabled={disabled}
        />
        {children}
      </Grid>
      <When condition={open}>
        <Grid item xs={12}>
          <SpecialFieldGrid
            entity={SpecialFieldEntityEnum.PROJECT}
            entity_id={id}
            fieldName={SPECIAL_FIELDS.PROJECT.PROPONENT}
            fieldValueType={SPECIAL_FIELD_TYPES.INTEGER}
            fieldLabel={"Proponent Name"}
            fieldType={"select"}
            title={"Proponent History"}
            description={
              <ETCaption3>
                Update the Proponent of this Project.{" "}
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
