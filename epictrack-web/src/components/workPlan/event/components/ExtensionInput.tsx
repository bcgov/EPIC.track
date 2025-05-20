import { useContext, useEffect, useRef } from "react";
import { Grid, TextField } from "@mui/material";
import Moment from "moment";
import { useFormContext } from "react-hook-form";
import { DATE_FORMAT } from "../../../../constants/application-constant";
import { WorkplanContext } from "../../WorkPlanContext";
import { dateUtils } from "../../../../utils";
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
    setValue,
  } = useFormContext();

  const ctx = useContext(WorkplanContext);

  const originalEndDate = ctx.selectedWorkPhase?.work_phase.end_date;

  const numberOfDaysRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const onDayChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = Number(e.target.value);
    if (!originalEndDate || isNaN(days)) return;

    const newDate = Moment(originalEndDate)
      .startOf("day")
      .add(days, "days")
      .format(DATE_FORMAT);

    setValue("phase_end_date", newDate, { shouldValidate: true });
    props.onChangeDay?.();
  };

  const onEndDateChange = (selectedDate: any) => {
    if (!originalEndDate || !selectedDate) return;

    const newDate = Moment(selectedDate).startOf("day");
    const original = Moment(originalEndDate).startOf("day");

    const days = newDate.diff(original, "days");

    setValue("number_of_days", days, { shouldValidate: true });
    props.onChangeDay?.();
  };

  useEffect(() => () => unregister("phase_end_date"), [unregister]);

  return (
    <>
      <Grid item xs={12}>
        <ETFormLabel required>Current Phase End Date</ETFormLabel>
        <TextField
          fullWidth
          disabled
          placeholder="MM-DD-YYYY"
          value={dateUtils.formatDate(String(originalEndDate))}
        />
      </Grid>
      <Grid item xs={6}>
        <ETFormLabel required>Number of Days</ETFormLabel>
        <TextField
          fullWidth
          disabled={props.isFormFieldsLocked}
          helperText={errors?.number_of_days?.message?.toString()}
          error={!!errors?.number_of_days?.message}
          type="number"
          inputRef={numberOfDaysRef}
          InputProps={{
            inputProps: { min: 0 },
          }}
          {...register("number_of_days")}
          onChange={onDayChange}
        />
      </Grid>
      <Grid item xs={6}>
        <ETFormLabel required>End Date</ETFormLabel>
        <ControlledDatePicker
          name="phase_end_date"
          disabled={props.isFormFieldsLocked}
          datePickerProps={{
            onDateChange: (event: any, defaultOnChange: any) => {
              const dateValue = event?.$d ?? event; // depends on date picker format
              defaultOnChange(dateValue); // sync with form
              onEndDateChange(dateValue);
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
