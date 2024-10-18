import { Grid, TextField } from "@mui/material";
import React from "react";
import Moment from "moment";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller, useFormContext } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DATE_FORMAT } from "../../../../constants/application-constant";
import { WorkplanContext } from "../../WorkPlanContext";
import { dateUtils } from "../../../../utils";
import { SyntheticEvent } from "react-draft-wysiwyg";
import { ETFormLabel } from "../../../shared";
import ExtensionSuspensionInput from "./ExtensionSuspensionInput";
import ControlledDatePicker from "../../../shared/controlledInputComponents/ControlledDatePicker";

interface ExtensionInputProps {
  isFormFieldsLocked: boolean;
  onChangeDay: () => void;
}
const ExtensionInput = (props: ExtensionInputProps) => {
  const {
    register,
    unregister,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useFormContext();
  const ctx = React.useContext(WorkplanContext);
  React.useEffect(() => {
    return () => {
      unregister("phase_end_date");
    };
  }, []);

  React.useEffect(() => {
    let numberOfDays = Number(getValues("number_of_days"));
    if (numberOfDaysRef.current as any) {
      numberOfDays = (numberOfDaysRef.current as any)["value"];
    }
    setValue(
      "phase_end_date",
      Moment(ctx.selectedWorkPhase?.work_phase.end_date)
        .add(numberOfDays, "days")
        .format()
    );
  }, []);
  const numberOfDaysRef = React.useRef();
  const endDateRef = React.useRef();
  const onDayChange = (event: SyntheticEvent) => {
    if (endDateRef.current as any) {
      setValue(
        "phase_end_date",
        Moment(ctx.selectedWorkPhase?.work_phase.end_date)
          .add(Number((event.target as any)["value"]), "days")
          .format(DATE_FORMAT)
      );
      setValue("number_of_days", Number((event.target as any)["value"]));
    }
    return Promise.resolve();
  };
  const onEndDateChange = (endDate: any) => {
    if (numberOfDaysRef.current as any) {
      setValue(
        "number_of_days",
        Moment(endDate).diff(
          Moment(ctx.selectedWorkPhase?.work_phase.end_date),
          "days"
        )
      );
      props.onChangeDay();
    }
  };
  return (
    <>
      <Grid item xs={12}>
        <ETFormLabel required>Current Phase End Date</ETFormLabel>
        <TextField
          fullWidth
          disabled
          placeholder="MM-DD-YYYY"
          defaultValue={dateUtils.formatDate(
            String(ctx.selectedWorkPhase?.work_phase.end_date)
          )}
        />
      </Grid>
      <Grid item xs={6}>
        <ETFormLabel required>Number of Days</ETFormLabel>
        <TextField
          fullWidth
          disabled={props.isFormFieldsLocked}
          helperText={errors?.number_of_days?.message?.toString()}
          error={!!errors?.number_of_days?.message}
          inputRef={numberOfDaysRef}
          InputProps={{
            inputProps: {
              min: 0,
            },
          }}
          type="number"
          {...register("number_of_days")}
          onChange={async (e) => {
            await onDayChange(e);
            props.onChangeDay();
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <ETFormLabel required>End Date</ETFormLabel>
        <ControlledDatePicker
          name="phase_end_date"
          disabled={props.isFormFieldsLocked}
          datePickerProps={{
            onDateChange: (event: any, defaultOnChange: any) => {
              const d = event ? event["$d"] : null;
              defaultOnChange(d);
              onEndDateChange(d);
            },
          }}
          datePickerSlotProps={{
            inputRef: endDateRef,
          }}
        />
      </Grid>
      <ExtensionSuspensionInput isFormFieldsLocked={props.isFormFieldsLocked} />
    </>
  );
};
export default ExtensionInput;
