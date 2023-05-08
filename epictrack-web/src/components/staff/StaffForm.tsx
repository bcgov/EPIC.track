import React from "react";
import {
  TextField,
  Grid,
  Button,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TrackLabel } from "../shared/index";
import codeService from "../../services/codeService";
import { Position, Staff } from "../../models/staff";
import StaffService from "../../services/staffService";
import ControlledSelect from "../shared/controlledInputComponents/ControlledSelect";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import TrackDialog from "../shared/TrackDialog";

const schema = yup.object().shape({
  email: yup.string().email().required("Email is required"),
  phone: yup
    .string()
    .matches(
      /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/,
      "Invalid phone number"
    )
    .required("Phone number is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  position_id: yup.string().required("Select position"),
});

export default function StaffForm({ ...props }) {
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [staff, setStaff] = React.useState<Staff>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const staffId = props.staff_id;
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: staff,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const getStaff = async (id: number) => {
    const result = await StaffService.getStaff(id);
    if (result.status === 200) {
      setStaff((result.data as never)["staff"]);
      reset((result.data as never)["staff"]);
    }
  };

  React.useEffect(() => {
    if (staffId) {
      getStaff(staffId);
    }
  }, [staffId]);

  const getPositions = async () => {
    const positionResult = await codeService.getCodes("positions");
    if (positionResult.status === 200) {
      setPositions((positionResult.data as never)["codes"]);
    }
  };
  React.useEffect(() => {
    getPositions();
  }, []);
  const onSubmitHandler = async (data: any) => {
    setLoading(true);
    if (staffId) {
      const result = await StaffService.updateStaff(data);
      if (result.status === 200) {
        setAlertContentText("Staff details updated");
        setOpenAlertDialog(true);
        props.onSubmitSucces();
        setLoading(false);
      }
    } else {
      const result = await StaffService.createStaff(data);
      if (result.status === 201) {
        setAlertContentText("Staff details inserted");
        setOpenAlertDialog(true);
        props.onSubmitSuccess();
        setLoading(false);
      }
    }
    reset();
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="staff-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={6}>
            <TrackLabel>First Name</TrackLabel>
            <TextField
              fullWidth
              error={!!errors?.first_name?.message}
              helperText={errors?.first_name?.message?.toString()}
              {...register("first_name")}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Last Name</TrackLabel>
            <TextField
              fullWidth
              {...register("last_name")}
              error={!!errors?.last_name?.message}
              helperText={errors?.last_name?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Email</TrackLabel>
            <TextField
              fullWidth
              {...register("email")}
              error={!!errors?.email?.message}
              helperText={errors?.email?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Phone</TrackLabel>
            <TextField
              fullWidth
              {...register("phone")}
              error={!!errors?.phone?.message}
              helperText={errors?.phone?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Position</TrackLabel>
            <ControlledSelect
              error={!!errors?.position_id?.message}
              helperText={errors?.position_id?.message?.toString()}
              defaultValue={staff?.position_id}
              fullWidth
              {...register("position_id")}
            >
              {positions.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={staff?.is_active}
              {...register("is_active")}
            />
            <TrackLabel id="active">Active</TrackLabel>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: "flex", gap: "0.5rem", justifyContent: "right" }}
          >
            <Button variant="outlined" type="reset" onClick={props.onCancel}>
              Cancel
            </Button>
            <Button variant="outlined" type="submit">
              Submit
            </Button>
          </Grid>
        </Grid>
      </FormProvider>
      <TrackDialog
        open={openAlertDialog}
        dialogTitle={"Success"}
        dialogContentText={alertContentText}
        isActionsRequired
        isCancelRequired={false}
        onOk={() => {
          setOpenAlertDialog(false);
          props.onCancel();
        }}
      />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
