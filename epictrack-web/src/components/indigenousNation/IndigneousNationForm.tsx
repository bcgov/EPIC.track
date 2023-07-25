import React from "react";
import { TextField, Grid, Button } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TrackLabel } from "../shared/index";
import { Staff } from "../../models/staff";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import indigenousNationService from "../../services/indigenousNationService/indigenousNationService";
import { IndigenousNation } from "../../models/indigenousNation";
import staffService from "../../services/staffService/staffService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import { MasterContext } from "../shared/MasterContext";

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .test(
      "validate-IndigenousNations",
      "Indigenous Nation with the given name already exists",
      async (value, { parent }) => {
        if (value) {
          const validateINationsResult =
            await indigenousNationService.checkIndigenousNationExists(
              value,
              parent["id"]
            );
          return !(validateINationsResult.data as any)["exists"] as boolean;
        }
        return true;
      }
    ),
});

export default function IndigenousNationForm({ ...props }) {
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setFormId("indigenous-nation-form");
  }, []);

  React.useEffect(() => {
    ctx.setId(props.indigenousNationID);
  }, [ctx.id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: ctx.item as IndigenousNation,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  React.useEffect(() => {
    reset(ctx.item);
  }, [ctx.item]);

  const getStaffs = async () => {
    const staffsResult = await staffService.getAll();
    if (staffsResult.status === 200) {
      setStaffs(staffsResult.data as never);
    }
  };
  React.useEffect(() => {
    getStaffs();
  }, []);
  const onSubmitHandler = async (data: IndigenousNation) => {
    ctx.onSave(data, () => {
      reset();
    });
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="indigenous-nation-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={6}>
            <TrackLabel>Name</TrackLabel>
            <TextField
              fullWidth
              error={!!errors?.name?.message}
              helperText={errors?.name?.message?.toString()}
              {...register("name")}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Relationship Holder</TrackLabel>
            <ControlledSelectV2
              defaultValue={
                (ctx.item as IndigenousNation)?.relationship_holder_id || ""
              }
              getOptionLabel={(o: Staff) => (o ? o.full_name : "")}
              getOptionValue={(o: Staff) => (o ? o.id.toString() : "")}
              options={staffs}
              {...register("relationship_holder_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={(ctx.item as IndigenousNation)?.is_active}
              {...register("is_active")}
            />
            <TrackLabel id="active">Active</TrackLabel>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
