import { useMemo } from "react";
import { Grid, Link } from "@mui/material";
import { SpecialFieldLock } from "components/shared/specialField/components/SpecialFieldLock";
import { SpecialFieldGrid } from "components/shared/specialField";
import { ETCaption3, ETFormLabel } from "components/shared";
import {
  EPIC_SUPPORT_LINKS,
  SpecialFieldEntityEnum,
} from "constants/application-constant";
import { ListType } from "models/code";
import { Staff } from "models/staff";

interface SpecialFieldProps {
  children?: React.ReactNode;
  disabled?: boolean;
  entity: SpecialFieldEntityEnum;
  fieldLabel: string;
  fieldName: string;
  fieldValueType: string;
  id?: number;
  isPositionLeft?: boolean; // Is special field position leftmost
  onLockClick: () => void;
  onSave?: () => void;
  open: boolean;
  options: ListType[] | Staff[];
  positionStyle?: React.CSSProperties; // Special position for locked position fields}
  gridSize?: number;
  fieldType?: "select" | "text";
}

export const WorkFormSpecialField = ({
  children,
  disabled = false,
  entity,
  fieldLabel,
  fieldName,
  fieldValueType,
  id,
  isPositionLeft = false,
  onLockClick,
  onSave,
  open = false,
  options,
  positionStyle = {},
  gridSize = 6,
  fieldType = "select",
}: SpecialFieldProps) => {
  const selectOptions = useMemo(() => {
    return options.map((option) => ({
      label: "name" in option ? option.name : option.full_name,
      value: String(option.id),
    }));
  }, [options]);

  if (!id) {
    return (
      <Grid item xs={gridSize}>
        <ETFormLabel required>{fieldLabel}</ETFormLabel>
        {children}
      </Grid>
    );
  }

  return (
    <>
      <Grid item xs={gridSize} sx={{ position: positionStyle }}>
        <SpecialFieldLock
          disabled={disabled}
          id={id}
          label={fieldLabel}
          onLockClick={onLockClick}
          open={open}
          required
        />
        {children}
      </Grid>
      {open && (
        <Grid item xs={12} sx={{ order: isPositionLeft ? 1 : 0 }}>
          <SpecialFieldGrid
            entity={entity}
            entity_id={id}
            fieldName={fieldName}
            fieldLabel={fieldLabel}
            fieldValueType={fieldValueType}
            fieldType={fieldType}
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
      )}
    </>
  );
};
