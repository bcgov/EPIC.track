import React from "react";
import { Checkbox, CheckboxProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import * as tokens from "../../../styles/designTokens";

type IFormCheckboxProps = {
  name: string;
} & CheckboxProps;

const ControlledCheckbox: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  IFormCheckboxProps
> = ({ name, sx, ...otherProps }, ref) => {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();
  const hasError = !!errors[name];

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValues?.[name] || ""}
      render={({ field }) => (
        <Checkbox
          {...otherProps}
          {...field}
          ref={ref}
          checked={!!field.value}
          // MUI's Checkbox has no error prop, so the invalid state is drawn on
          // the icon directly. The box outline is a `stroke`, not a `fill`.
          sx={{
            ...(hasError && {
              "& svg": {
                stroke: `${tokens.supportBorderColorDanger} !important`,
              },
            }),
            ...sx,
          }}
        />
      )}
    />
  );
};

export default React.forwardRef(ControlledCheckbox);
