import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { Grid } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import { Staff, defaultStaff } from "models/staff";
import { ListType } from "models/code";
import { ControlledMaskTextField } from "../shared/maskTextField";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import ControlledSwitch from "../shared/controlledInputComponents/ControlledSwitch";
import ControlledTextField from "../shared/controlledInputComponents/ControlledTextField";
import positionService from "services/positionService";
import staffService from "services/staffService/staffService";
import { ROLES } from "constants/application-constant";
import { StaffPositionSpecialField } from "./StaffPositionSpecialField";
import { useAppSelector } from "hooks";

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
  fetchStaff: () => void;
  saveStaff: (data: any) => void;
  setDisableDialogSave?: (value: boolean) => void;
  staff: Staff | null;
};

export default function StaffForm({
  fetchStaff,
  saveStaff,
  setDisableDialogSave,
  staff,
}: StaffFormProps) {
  const [positions, setPositions] = useState<ListType[]>([]);
  const [isPositionFieldLocked, setIsPositionFieldLocked] = useState(true);

  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = roles.includes(ROLES.EDIT);
  const shouldDisableSpecialField = Boolean(staff?.id);
  const shouldDisableFormField =
    (!canEdit && Boolean(staff?.id)) || !isPositionFieldLocked;

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

  useEffect(() => {
    if (setDisableDialogSave) {
      setDisableDialogSave(!isPositionFieldLocked);
    }
  }, [setDisableDialogSave, isPositionFieldLocked]);

  const getPositions = async () => {
    const positionResult = await positionService.getAll();
    if (positionResult.status === 200) {
      setPositions(positionResult.data as ListType[]);
    }
  };

  useEffect(() => {
    getPositions();
  }, []);

  const { ref, ...restRegister } = register("position_id");

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
          <ControlledTextField
            disabled={shouldDisableFormField}
            fullWidth
            name="first_name"
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Last Name</ETFormLabel>
          <ControlledTextField
            disabled={shouldDisableFormField}
            fullWidth
            name="last_name"
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Email</ETFormLabel>
          <ControlledTextField
            disabled={shouldDisableFormField}
            name="email"
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Phone</ETFormLabel>
          <ControlledMaskTextField
            disabled={shouldDisableFormField}
            fullWidth
            mask="(#00) 000-0000"
            name="phone"
            placeholder="(xxx) xxx-xxxx"
          />
        </Grid>
        <Grid item xs={12}>
          <StaffPositionSpecialField
            disabled={!canEdit}
            id={staff?.id}
            onLockClick={() => setIsPositionFieldLocked((prev) => !prev)}
            onSave={fetchStaff}
            open={!isPositionFieldLocked}
            options={positions}
          >
            <ControlledSelectV2
              defaultValue={staff?.position_id}
              disabled={shouldDisableSpecialField}
              fullWidth
              getOptionLabel={(o: ListType) => o.name}
              getOptionValue={(o: ListType) => o?.id?.toString()}
              helperText={errors?.position_id?.message?.toString()}
              options={positions || []}
              placeholder="Select"
              name="position_id"
            />
          </StaffPositionSpecialField>
        </Grid>
        <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
          <ControlledSwitch
            disabled={shouldDisableFormField}
            name="is_active"
          />
          <ETFormLabel id="active">Active</ETFormLabel>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
