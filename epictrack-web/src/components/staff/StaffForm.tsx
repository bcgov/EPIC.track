import React from "react";
import { Grid } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import { Staff, defaultStaff } from "../../models/staff";
import { ListType } from "../../models/code";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import { MasterContext } from "../shared/MasterContext";
import staffService from "../../services/staffService/staffService";
import ControlledTextField from "../shared/controlledInputComponents/ControlledTextField";
import ControlledSwitch from "../shared/controlledInputComponents/ControlledSwitch";
import { ControlledMaskTextField } from "../shared/maskTextField";
import positionService from "../../services/positionService";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required")
    .test({
      name: "checkDuplicateEmail",
      exclusive: true,
      message: "Staff with same email already exists",
      test: async (value, { parent }) => {
        try {
          if (value) {
            const result = await staffService.validateEmail(
              value,
              parent["id"]
            );
            if (result.status === 200) {
              return !(result.data as never)["exists"];
            }
          }
          return true;
        } catch (e) {
          return false;
        }
      },
    }),
  phone: yup.string().required("Phone number is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  position_id: yup.string().required("Select position"),
  is_active: yup.boolean(),
});

export default function StaffForm({ ...props }) {
  const [positions, setPositions] = React.useState<ListType[]>([]);
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setFormId("staff-form");
  }, []);

  React.useEffect(() => {
    const staff = ctx?.item as Staff;
    ctx.setTitle(
      staff?.full_name ? staff?.full_name || "Edit Staff" : "Create Staff"
    );
  }, [ctx.item]);

  React.useEffect(() => {
    ctx.setId(props.staffId);
  }, [ctx.id]);

  const methods = useForm<Staff>({
    resolver: yupResolver(schema),
    defaultValues: ctx.item as Staff,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;

  React.useEffect(() => {
    reset(ctx.item ?? defaultStaff);
  }, [ctx.item]);

  const getPositions = async () => {
    const positionResult = await positionService.getAll();
    if (positionResult.status === 200) {
      setPositions(positionResult.data as ListType[]);
    }
  };
  React.useEffect(() => {
    getPositions();
  }, []);
  const onSubmitHandler = async (data: any) => {
    ctx.onSave(data, () => {
      reset();
    });
  };
  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="staff-form"
        container
        spacing={2}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={6}>
          <ETFormLabel>First Name</ETFormLabel>
          <ControlledTextField name="first_name" fullWidth />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Last Name</ETFormLabel>
          <ControlledTextField name="last_name" fullWidth />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Email</ETFormLabel>
          <ControlledTextField name="email" fullWidth />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Phone</ETFormLabel>
          <ControlledMaskTextField
            name="phone"
            fullWidth
            placeholder="(xxx) xxx-xxxx"
            mask="(#00) 000-0000"
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabel>Position</ETFormLabel>
          <ControlledSelectV2
            helperText={errors?.position_id?.message?.toString()}
            getOptionValue={(o: ListType) => o?.id?.toString()}
            getOptionLabel={(o: ListType) => o?.name}
            defaultValue={(ctx.item as Staff)?.position_id}
            options={positions}
            {...register("position_id")}
          />
        </Grid>
        <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
          <ControlledSwitch name="is_active" />
          <ETFormLabel id="active">Active</ETFormLabel>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
