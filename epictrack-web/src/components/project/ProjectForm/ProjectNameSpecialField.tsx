import React from "react";
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
import { SpecialFieldLock } from "../../shared/specialField/components/SpecialFieldLock";

interface ProjectNameSpecialFieldProps {
  id?: number;
  onSave: () => void;
  open: boolean;
  onLockClick: () => void;
  children?: React.ReactNode;
  title: string;
  disabled?: boolean;
}
const LABEL = "Name";
export const ProjectNameSpecialField = ({
  id,
  onSave,
  open = false,
  disabled = false,
  onLockClick,
  children,
  title,
}: ProjectNameSpecialFieldProps) => {
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
            fieldName={SPECIAL_FIELDS.PROJECT.NAME}
            fieldValueType={SPECIAL_FIELD_TYPES.STRING}
            fieldLabel={"Name"}
            fieldType={"text"}
            title={title}
            description={
              <ETCaption3>
                Update the legal name of the Project and the dates each name was
                in legal use.{" "}
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
