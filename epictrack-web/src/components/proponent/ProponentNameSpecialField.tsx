import React from "react";
import { SpecialFieldGrid } from "../shared/specialField";
import {
  EPIC_SUPPORT_LINKS,
  SPECIAL_FIELD_TYPES,
  SPECIAL_FIELDS,
  SpecialFieldEntityEnum,
} from "../../constants/application-constant";
import { ETCaption3, ETFormLabel } from "../shared";
import { Grid, Link } from "@mui/material";
import { When } from "react-if";
import { SpecialFieldLock } from "../shared/specialField/components/SpecialFieldLock";

interface ProponentNameSpecialFieldProps {
  children?: React.ReactNode;
  id?: number;
  isPositionLeft?: boolean; // Is special field position leftmost in dialog
  onLockClick: () => void;
  onSave: () => void;
  open: boolean;
  title: string;
}
const LABEL = "Name";
export const ProponentNameSpecialField = ({
  children,
  id,
  isPositionLeft = false,
  onLockClick,
  onSave,
  open = false,
  title,
}: ProponentNameSpecialFieldProps) => {
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
      <Grid item xs={6}>
        <SpecialFieldLock
          id={id}
          open={open}
          onLockClick={onLockClick}
          label={"Name"}
          required
        />
        {children}
      </Grid>
      <When condition={open}>
        <Grid item xs={12} sx={{ order: isPositionLeft ? 1 : 0 }}>
          <SpecialFieldGrid
            entity={SpecialFieldEntityEnum.PROPONENT}
            entity_id={id}
            fieldName={SPECIAL_FIELDS.PROPONENT.NAME}
            fieldValueType={SPECIAL_FIELD_TYPES.STRING}
            fieldLabel={"Name"}
            fieldType={"text"}
            title={title}
            description={
              <ETCaption3>
                Update the legal name of the Proponent and the dates each name
                was in legal use.{" "}
                <Link href={EPIC_SUPPORT_LINKS.SPECIAL_HISTORY} target="_blank">
                  Click this link
                </Link>{" "}
                for detailed instructions.
              </ETCaption3>
            }
            onSave={onSave}
          />
        </Grid>
      </When>
    </>
  );
};
