import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { RadioOptions } from "../../../../models/type";
import { Grid } from "@mui/material";
import { ETSubhead } from "../../../shared";
import ControlledRadioGroup from "../../../shared/controlledInputComponents/ControlledRadioGroup";
import { yupResolver } from "@hookform/resolvers/yup";
const schema = yup.object().shape({
  option: yup
    .number()
    .typeError("Please choose one option")
    .required("Please choose one option"),
});
interface EventDatePushConfirmationProps {
  onSave: (option: number) => void;
}
const EventDatePushConfirmForm = ({
  onSave,
}: EventDatePushConfirmationProps) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      option: "",
    },
    mode: "onBlur",
  });
  const {
    handleSubmit,
    formState: { errors },
  } = methods;
  const onSubmitHandler = (submittedData: any) => {
    onSave(submittedData.option);
  };
  const options = useMemo<RadioOptions[]>(
    () => [
      {
        label: "Update this Milestone only",
        value: 2,
      },
      {
        label: "Update all subsequent  Milestones",
        value: 1,
      },
    ],
    []
  );
  return (
    <FormProvider {...methods}>
      <Grid
        container
        component={"form"}
        id="confirm-form"
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid
          item
          xs={12}
          sx={{
            mb: "1rem",
          }}
        >
          <ETSubhead>
            You have changed the date of this Milestone. Do you want to update
            this Milestone only, or do you want all subsequent Milestones to be
            updated to reflect this change as well?
          </ETSubhead>
        </Grid>
        <Grid item xs={12}>
          <ControlledRadioGroup name="option" options={options} />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default EventDatePushConfirmForm;
