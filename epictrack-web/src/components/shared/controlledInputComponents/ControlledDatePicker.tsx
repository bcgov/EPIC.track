import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import { DATE_FORMAT } from "../../../constants/application-constant";
import TrackDatePicker from "../DatePicker";

type ControlledDatePickerProps = {
  name: string;
  defaultValue?: any;
  disabled?: boolean;
  datePickerProps?: {
    placeholder?: string;
    referenceDate?: dayjs.Dayjs;
    minDate?: dayjs.Dayjs | undefined;
    maxDate?: dayjs.Dayjs | undefined;
    onDateChange?: (
      value: dayjs.Dayjs | null,
      defaultOnChangeFunc: (value: dayjs.Dayjs | null) => void
    ) => void;
    // Add any other DatePicker-specific props you want to pass
  };
  datePickerSlotProps?: {
    inputRef?: React.Ref<any>;
  };
};

const ControlledDatePicker: React.FC<ControlledDatePickerProps> = ({
  name,
  datePickerProps,
  datePickerSlotProps,
  defaultValue,
  disabled,
}) => {
  const { control, register } = useFormContext();
  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TrackDatePicker
          slotProps={{
            textField: {
              id: name,
              error: !!error,
              placeholder: datePickerProps?.placeholder || DATE_FORMAT,
              helperText: error?.message || "",
              ...datePickerSlotProps,
            },
            ...register(name),
          }}
          {...datePickerProps}
          value={value ? dayjs(value) : value}
          onChange={(event: Dayjs | null) => {
            if (datePickerProps?.onDateChange) {
              datePickerProps.onDateChange(event, onChange);
            } else {
              onChange(event?.format() || "");
            }
          }}
          disabled={disabled}
        />
      )}
    />
  );
};

export default ControlledDatePicker;
