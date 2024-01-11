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

const StatusForm = () => {
  const [description, setDescription] = React.useState<string>("");
  const startDateRef = useRef();
  const { status, onSave, isCloning } = useContext(StatusContext);
  const { getWorkStatuses, statuses } = useContext(WorkplanContext);

  const getPostedDateMin = () => {
    if (isCloning) {
      return dayjs(statuses[0].posted_date);
    }
    if (statuses.length === 1 && statuses[0]?.is_approved) {
      return dayjs(EARLIEST_WORK_DATE);
    }

    return dayjs(statuses[1]?.posted_date || EARLIEST_WORK_DATE);
  };

  const postedDateMin = getPostedDateMin();
  const postedDateMax = dayjs(new Date()).add(7, "day");

  React.useEffect(() => {
    if (status) {
      setDescription(status?.description);
      if (isCloning) {
        reset({ posted_date: Moment().format() });
      }
    }
  }, []);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: status ?? {},
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
            defaultValue={dayjs(status?.posted_date ? status?.posted_date : "")}
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
          <ETFormLabel>Description</ETFormLabel>
          <ControlledTextField
            name="description"
            multiline
            rows={4}
            onChange={handleDescriptionChange}
            fullWidth
          />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default StatusForm;
