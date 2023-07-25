import React from "react";
import { TextField, Grid } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TrackLabel } from "../shared/index";
import { Staff } from "../../models/staff";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import { Proponent } from "../../models/proponent";
import staffService from "../../services/staffService/staffService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import { MasterContext } from "../shared/MasterContext";
import proponentService from "../../services/proponentService/proponentService";

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .test({
      name: "checkDuplicateProponent",
      exclusive: true,
      message:
        "Proponent/Certificate holder with the given name already exists",
      test: async (value, { parent }) => {
        if (value) {
          const validateProponentResult =
            await proponentService.checkProponentExists(value, parent["id"]);
          return !(validateProponentResult.data as any)["exists"] as boolean;
        }
        return true;
      },
    }),
});

export default function StaffForm({ ...props }) {
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setFormId("proponent-form");
  }, []);
  React.useEffect(() => {
    ctx.setTitle("Proponent/Certificate Holder");
  }, [ctx.title]);

  React.useEffect(() => {
    ctx.setId(props.proponentId);
  }, [ctx.id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: ctx.item as Proponent,
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
  const onSubmitHandler = async (data: any) => {
    ctx.onSave(data, () => {
      reset();
    });
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="proponent-form"
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
              defaultValue={(ctx.item as Proponent)?.relationship_holder_id}
              options={staffs || []}
              getOptionValue={(o: Staff) => o.id.toString()}
              getOptionLabel={(o: Staff) => o.full_name}
              {...register("relationship_holder_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={(ctx.item as Proponent)?.is_active}
              {...register("is_active")}
            />
            <TrackLabel id="active">Active</TrackLabel>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
