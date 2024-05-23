import React, { useContext, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid, TextField } from "@mui/material";
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
  const [description, setDescription] = React.useState<string>("");
  const startDateRef = useRef();
  const { status: statusToEdit, onSave, isCloning } = useContext(StatusContext);
  const { getWorkStatuses, statuses } = useContext(WorkplanContext);

  const getPostedDateMin = () => {
    const sortedStatuses = [...statuses]
      .filter((status) => statusToEdit?.id !== status.id)
      .sort((statusA, statusB) =>
        dayjs(statusB.posted_date).diff(dayjs(statusA.posted_date))
      );

    if (isCloning) {
      return dayjs(sortedStatuses[0].posted_date);
    }
    if (sortedStatuses.length === 1 && sortedStatuses[0]?.is_approved) {
      return dayjs(EARLIEST_WORK_DATE);
    }

    return dayjs(sortedStatuses[1]?.posted_date || EARLIEST_WORK_DATE);
  };

  const postedDateMin = getPostedDateMin();
  const postedDateMax = dayjs(new Date()).add(7, "day");

  React.useEffect(() => {
    if (statusToEdit) {
      setDescription(statusToEdit?.description);
      if (isCloning) {
        reset({ posted_date: Moment().format() });
      }
    }
  }, []);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: statusToEdit ?? {},
    mode: "onBlur",
  });

  const { handleSubmit, reset } = methods;

  const handleDescriptionChange = (event: any) => {
    setDescription(event.target.value);
  };

  const onSubmitHandler = async (data: any) => {
    onSave(data, () => {
      reset();
      getWorkStatuses();
    });
  };

  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="status-form"
        spacing={2}
        container
        sx={{
          width: "100%",
        }}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={5}>
          <ETFormLabel required>Date</ETFormLabel>
          <ControlledDatePicker
            name="posted_date"
            defaultValue={dayjs(
              statusToEdit?.posted_date ? statusToEdit?.posted_date : ""
            )}
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
            characterCount={description.length}
            maxCharacterLength={CHARACTER_LIMIT}
            required
          >
            Description
          </ETFormLabelWithCharacterLimit>
          <ControlledTextField
            name="description"
            multiline
            rows={4}
            onChange={handleDescriptionChange}
            fullWidth
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
