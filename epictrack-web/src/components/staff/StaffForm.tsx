import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import { Staff, defaultStaff } from "../../models/staff";
import { ListType } from "../../models/code";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
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

type StaffFormProps = {
  staff: Staff | null;
  saveStaff: (data: any) => void;
};

export default function StaffForm({ staff, saveStaff }: StaffFormProps) {
  const [positions, setPositions] = useState<ListType[]>([]);

  const methods = useForm<Staff>({
    resolver: yupResolver(schema),
    defaultValues: staff || defaultStaff,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset(staff ?? defaultStaff);
  }, [reset, staff]);

  const getPositions = async () => {
    const positionResult = await positionService.getAll();
    if (positionResult.status === 200) {
      setPositions(positionResult.data as ListType[]);
    }
  };

  useEffect(() => {
    getPositions();
  }, []);

  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="staff-form"
        container
        spacing={2}
        onSubmit={handleSubmit(saveStaff)}
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
            defaultValue={staff?.position_id}
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
