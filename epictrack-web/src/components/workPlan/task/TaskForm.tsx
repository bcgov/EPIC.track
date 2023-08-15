import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DATE_FORMAT } from "../../../constants/application-constant";
import { Grid, TextField } from "@mui/material";
import { ETFormLabel } from "../../shared";
import { EVENT_STATUS, TaskEvent } from "../../../models/task_event";
import dayjs from "dayjs";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
});

const TaskForm = () => {
  const [taskEvent, setTaskEvent] = React.useState<TaskEvent>();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: taskEvent,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;
  const statuses = React.useMemo(() => {
    return [
      {
        label: "Not Started",
        value: EVENT_STATUS.NOT_STARTED,
      },
      {
        label: "In Progress",
        value: EVENT_STATUS.INPROGRESS,
      },
      {
        label: "Complete",
        value: EVENT_STATUS.COMPLETED,
      },
    ];
  }, []);
  const onSubmitHandler = () => {
    console.log("");
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="task-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={12}>
            <ETFormLabel required>Task Title</ETFormLabel>
            <TextField
              fullWidth
              placeholder="Title"
              error={!!errors?.name?.message}
              helperText={errors?.name?.message?.toString()}
              {...register("name")}
            />
          </Grid>
          <Grid item xs={4}>
            <ETFormLabel>Start Date</ETFormLabel>
            <Controller
              name="actual_date"
              control={control}
              defaultValue={taskEvent?.anticipated_date}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format={DATE_FORMAT}
                    slotProps={{
                      textField: {
                        id: "start_date",
                        fullWidth: true,
                        error: error ? true : false,
                        helperText: error?.message,
                        placeholder: "MM-DD-YYYY",
                      },
                      ...register("actual_date"),
                    }}
                    value={dayjs(value)}
                    onChange={(event) => {
                      onChange(event);
                    }}
                    defaultValue={dayjs(
                      taskEvent?.actual_date ? taskEvent?.actual_date : ""
                    )}
                    sx={{ display: "block" }}
                  />
                </LocalizationProvider>
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <ETFormLabel>Days</ETFormLabel>
            <TextField
              fullWidth
              type="number"
              {...register("number_of_days")}
            />
          </Grid>
          <Grid item xs={4}>
            <ETFormLabel required>End Date</ETFormLabel>
            <TextField fullWidth disabled placeholder="MM-DD-YYYY" />
          </Grid>
          <Grid item xs={4}>
            <ETFormLabel required>Status</ETFormLabel>
            <ControlledSelectV2
              helperText={errors?.status?.message?.toString()}
              defaultValue={taskEvent?.status}
              options={statuses || []}
              getOptionValue={(o: any) => o?.value.toString()}
              getOptionLabel={(o: any) => o.label}
              {...register("status")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={4}>
            <ETFormLabel required>Assigned</ETFormLabel>
            <TextField fullWidth {...register("assignee_ids")} />
          </Grid>
          <Grid item xs={4}>
            <ETFormLabel required>Responsibility</ETFormLabel>
            <TextField fullWidth {...register("responsibility_id")} />
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default TaskForm;
