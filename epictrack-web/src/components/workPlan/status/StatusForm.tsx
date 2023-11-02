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

const schema = yup.object().shape({});
const CHARACTER_LIMIT = 500;

const StatusForm = () => {
  const [notes, setNotes] = React.useState<string>("");
  const startDateRef = useRef();
  const { status, onSave } = useContext(StatusContext);

  React.useEffect(() => {
    if (status) {
      setNotes(status?.description);
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
    setNotes(event.target.value);
  };

  const onSubmitHandler = async (data: any) => {
    onSave(data, () => {
      reset();
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
            name="start_date"
            control={control}
            defaultValue={Moment(status?.start_date).format()}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
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
                    ...register("start_date"),
                  }}
                  value={dayjs(value)}
                  onChange={(event) => {
                    onChange(event);
                  }}
                  defaultValue={dayjs(
                    status?.start_date ? status?.start_date : ""
                  )}
                  sx={{ display: "block" }}
                />
              </LocalizationProvider>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabelWithCharacterLimit
            characterCount={notes.length}
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
