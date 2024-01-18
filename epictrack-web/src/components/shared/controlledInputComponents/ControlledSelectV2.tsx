import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import TrackSelect from "../TrackSelect";

type IFormInputProps = {
  placeholder?: string;
  name: string;
  options: Array<any>;
  defaultValue?: string | number | undefined | number[];
  isMulti?: boolean;
  getOptionLabel: (option: any) => string;
  getOptionValue: (option: any) => string;
  helperText?: string | undefined;
  disabled?: boolean;
  onHandleChange?: (val: any) => void;
  testId?: string;
  // menuPortalTarget: HTMLElement | undefined;
};

const ControlledSelectV2: React.ForwardRefRenderFunction<
  HTMLDivElement,
  IFormInputProps
> = ({
  placeholder,
  name,
  options,
  getOptionLabel,
  getOptionValue,
  isMulti,
  disabled,
  helperText,
  onHandleChange,
  testId,
  // menuPortalTarget,
  ...otherProps
}) => {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();
  return (
    <div data-cy={testId}>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValues?.[name] || ""}
        render={({ field, fieldState }) => {
          const { onChange, value } = field;
          const { error } = fieldState;
          return (
            <TrackSelect
              placeholder={placeholder}
              {...field}
              {...otherProps}
              isMulti={isMulti}
              options={options}
              getOptionValue={getOptionValue}
              getOptionLabel={getOptionLabel}
              value={options.filter((c) => {
                if (isMulti && value) {
                  return (value as any[])
                    .map((p) => p.toString())
                    .includes(getOptionValue(c));
                }
                return getOptionValue(c) === value?.toString();
              })}
              onChange={(val: any) => {
                let v;
                if (isMulti) v = val.map((v: any) => getOptionValue(v));
                else v = getOptionValue(val);
                if (onHandleChange !== undefined) onHandleChange(v);
                return onChange(v);
              }}
              disabled={disabled}
              error={!!error}
              helperText={String(error?.message) || helperText}
            />
          );
        }}
      />
    </div>
  );
};

export default React.forwardRef(ControlledSelectV2);
