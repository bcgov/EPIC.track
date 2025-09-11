import { useContext, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { AboutContext } from "../AboutContext";
import { ETFormLabel } from "components/shared";
import ControlledTextField from "components/shared/controlledInputComponents/ControlledTextField";
import { hasPermission } from "components/shared/restricted";
import { useAppSelector } from "hooks";
import { ROLES } from "constants/application-constant";

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  link: yup.string().required("Link is required"),
});

const WorkResourceForm = () => {
  const { selectedWorkResource, onSave, getWorkResources } =
    useContext(AboutContext);

  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: selectedWorkResource?.title ?? "",
      link: selectedWorkResource?.link ?? "",
    },
    mode: "onBlur",
  });

  const { handleSubmit, reset } = methods;

  const onSubmitHandler = async (data: any) => {
    onSave(data, () => {
      reset();
      getWorkResources();
    });
  };

  useEffect(() => {
    if (selectedWorkResource) {
      const values = {
        title: selectedWorkResource.title,
        link: selectedWorkResource.link,
      };
      reset(values);
    }
  }, [reset, selectedWorkResource]);

  return (
    <FormProvider {...methods}>
      <Grid
        component="form"
        id="work-resource-form"
        spacing={2}
        container
        sx={{ width: "100%" }}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={6}>
          <ETFormLabel required>Title</ETFormLabel>
          <ControlledTextField
            name="title"
            fullWidth
            rows={1}
            disabled={!canEdit}
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabel required>Link</ETFormLabel>
          <ControlledTextField
            name="link"
            fullWidth
            rows={1}
            disabled={!canEdit}
          />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default WorkResourceForm;
