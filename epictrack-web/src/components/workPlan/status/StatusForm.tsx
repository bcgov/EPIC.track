import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../shared";
import dayjs from "dayjs";
import { EARLIEST_WORK_DATE } from "../../../constants/application-constant";
import Moment from "moment";
import { StatusContext } from "./StatusContext";
import { WorkplanContext } from "../WorkPlanContext";
import ControlledDatePicker from "../../shared/controlledInputComponents/ControlledDatePicker";
import ControlledTextField from "../../shared/controlledInputComponents/ControlledTextField";

const schema = yup.object().shape({
  posted_date: yup.string().required("Date is required"),
  description: yup.string().required("Description is required"),
});

const CHARACTER_LIMIT = 1000;

const StatusForm = () => {
  const startDateRef = useRef();
  const { status: statusToEdit, onSave, isCloning } = useContext(StatusContext);
  const { getWorkStatuses, statuses } = useContext(WorkplanContext);

  const getPostedDateMin = useCallback(() => {
    if (statuses.length === 0) return dayjs(EARLIEST_WORK_DATE);

    const sortedStatuses = [...statuses].sort((a, b) =>
      dayjs(b.posted_date).diff(dayjs(a.posted_date)),
    );

    if (isCloning || !statusToEdit) return dayjs(sortedStatuses[0].posted_date);

    const previousStatus = sortedStatuses.find(
      (s) =>
        s.id !== statusToEdit.id &&
        dayjs(s.posted_date) < dayjs(statusToEdit.posted_date),
    );

    return dayjs(previousStatus?.posted_date || EARLIEST_WORK_DATE);
  }, [isCloning, statusToEdit, statuses]);

  const postedDateMin = useMemo(() => getPostedDateMin(), [getPostedDateMin]);
  const postedDateMax = dayjs(new Date()).add(7, "day");

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      posted_date: statusToEdit?.posted_date ?? "",
      description: statusToEdit?.description ?? "",
    },
    mode: "onBlur",
  });

  const { handleSubmit, reset, control } = methods;

  const description = useWatch({ control, name: "description" });

  useEffect(() => {
    if (statusToEdit) {
      const values = {
        posted_date: isCloning ? Moment().format() : statusToEdit.posted_date,
        description: statusToEdit.description,
      };
      reset(values);
    }
  }, [isCloning, reset, statusToEdit]);

  const onSubmitHandler = async (data: any) => {
    onSave(data, () => {
      reset();
      getWorkStatuses();
    });
  };

  return (
    <FormProvider {...methods}>
      <Grid
        component="form"
        id="status-form"
        spacing={2}
        container
        sx={{ width: "100%" }}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={5}>
          <ETFormLabel required>Date</ETFormLabel>
          <ControlledDatePicker
            name="posted_date"
            datePickerProps={{
              minDate: postedDateMin,
              maxDate: postedDateMax,
            }}
            datePickerSlotProps={{
              inputRef: startDateRef,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabelWithCharacterLimit
            characterCount={description?.length ?? 0}
            maxCharacterLength={CHARACTER_LIMIT}
            required
          >
            Description
          </ETFormLabelWithCharacterLimit>
          <ControlledTextField
            name="description"
            multiline
            fullWidth
            minRows={4}
            inputProps={{
              maxLength: CHARACTER_LIMIT,
            }}
          />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default StatusForm;
