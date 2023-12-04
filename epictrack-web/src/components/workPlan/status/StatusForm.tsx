import React, { useContext, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid, TextField } from "@mui/material";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../shared";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { DATE_FORMAT } from "../../../constants/application-constant";
import Moment from "moment";
import { StatusContext } from "./StatusContext";
import { WorkplanContext } from "../WorkPlanContext";

const schema = yup.object().shape({});
const CHARACTER_LIMIT = 500;

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
      return dayjs("1900-01-01");
    }

    return dayjs(statuses[1]?.posted_date || "1900-01-01");
  };

  const postedDateMin = getPostedDateMin();
  const postedDateMax = dayjs(new Date()).add(7, "day");

  console.log(postedDateMin);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;

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
        <Grid item xs={4}>
          <ETFormLabel required>Date</ETFormLabel>
          <Controller
            name="posted_date"
            control={control}
            defaultValue={Moment(status?.posted_date).format()}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  minDate={postedDateMin}
                  maxDate={postedDateMax}
                  format={DATE_FORMAT}
                  slotProps={{
                    textField: {
                      id: "start_date",
                      fullWidth: true,
                      inputRef: startDateRef,
                      error: error ? true : false,
                      helperText: error?.message,
                      placeholder: "MM-DD-YYYY",
                    },
                    ...register("posted_date"),
                  }}
                  value={dayjs(value)}
                  onChange={(event) => {
                    onChange(event);
                  }}
                  defaultValue={dayjs(
                    status?.posted_date ? status?.posted_date : ""
                  )}
                  sx={{ display: "block" }}
                />
              </LocalizationProvider>
            )}
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
          <TextField
            fullWidth
            multiline
            rows={4}
            {...register("description")}
            error={!!errors?.description?.message}
            helperText={errors?.description?.message?.toString()}
            onChange={handleDescriptionChange}
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
