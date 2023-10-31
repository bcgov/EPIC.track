import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { Status } from "../../../models/status";

const schema = yup.object().shape({});

const IssuesForm = () => {
  const methods = useForm<Status>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const { handleSubmit } = methods;

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

export default IssuesForm;
