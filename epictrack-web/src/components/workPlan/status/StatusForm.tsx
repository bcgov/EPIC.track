import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";
import { Status } from "../../../models/status";

const schema = yup.object().shape({});

const StatusForm = () => {
  const [status, setStatus] = React.useState<Status>();
  const ctx = React.useContext(WorkplanContext);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: status,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;

  const onSubmitHandler = async (data: Status) => {
    return null;
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
      ></Grid>
    </FormProvider>
  );
};

export default StatusForm;
