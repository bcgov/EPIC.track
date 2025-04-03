import { ReactNode, useMemo } from "react";
import { Grid, Link } from "@mui/material";
import {
  EPIC_SUPPORT_LINKS,
  SPECIAL_FIELD_TYPES,
  SPECIAL_FIELDS,
  SpecialFieldEntityEnum,
} from "../../constants/application-constant";
import { ETCaption3, ETFormLabel } from "components/shared";
import { SpecialFieldGrid } from "components/shared/specialField";
import { SpecialFieldLock } from "components/shared/specialField/components/SpecialFieldLock";
import { ListType } from "models/code";

interface StaffPositionSpecialFieldProps {
  children?: ReactNode;
  disabled?: boolean;
  id?: number;
  onLockClick: () => void;
  onSave: () => void;
  open: boolean;
  options: ListType[];
}
const LABEL = "Position";
export const StaffPositionSpecialField = ({
  children,
  disabled = false,
  id,
  onLockClick,
  onSave,
  open = false,
  options,
}: StaffPositionSpecialFieldProps) => {
  const selectOptions = useMemo(() => {
    return options.map((option) => ({
      label: option.name,
      value: String(option.id),
    }));
  }, [options]);

  if (!id) {
    return (
      <Grid item xs={12}>
        <ETFormLabel>{LABEL}</ETFormLabel>
        {children}
      </Grid>
    );
  }

  return (
    <>
      <Grid item xs={12} />
      <Grid item xs={12}>
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
      {open && (
        <Grid item xs={12}>
          <SpecialFieldGrid
            entity={SpecialFieldEntityEnum.STAFF}
            entity_id={id}
            fieldName={SPECIAL_FIELDS.STAFF.POSITION}
            fieldValueType={SPECIAL_FIELD_TYPES.INTEGER}
            fieldLabel={"Position Name"}
            fieldType={"select"}
            title={"Position History"}
            description={
              <ETCaption3>
                Update the Position for this Staff.{" "}
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
      )}{" "}
    </>
  );
};
