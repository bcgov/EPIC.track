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
import { Staff } from "../../models/staff";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import TrackDialog from "../shared/TrackDialog";
import IndigenousNationService from "../../services/indigenousNationService";
import { IndigenousNation } from "../../models/indigenousNation";
import StaffService from "../../services/staffService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";

export default function IndigenousNationForm({ ...props }) {
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const [indigenousNation, setIndigenousNation] =
    React.useState<IndigenousNation>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const indigenousNationID = props.indigenousNationID;

  const schema = yup.object().shape({
    name: yup
      .string()
      .required("Name is required")
      .test(
        "validate-IndigenousNations",
        "Indigenous Nation with the given name already exists",
        async (value) => {
          const validateINationsResult =
            await IndigenousNationService.checkIndigenousNationExists(
              value,
              indigenousNationID
            );
          return !(validateINationsResult.data as any)["exists"] as boolean;
        }
      ),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: indigenousNation,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const getIndigenousNation = async (id: number) => {
    const result = await IndigenousNationService.getIndigenousNation(id);
    if (result.status === 200) {
      setIndigenousNation(result.data as IndigenousNation);
      reset(result.data as IndigenousNation);
    }
  };

  React.useEffect(() => {
    if (indigenousNationID) {
      getIndigenousNation(indigenousNationID);
    }
  }, [indigenousNationID]);

  const getStaffs = async () => {
    const staffsResult = await StaffService.getStaffs();
    if (staffsResult.status === 200) {
      setStaffs(staffsResult.data as never);
    }
  };
  React.useEffect(() => {
    getStaffs();
  }, []);
  const onSubmitHandler = async (data: IndigenousNation) => {
    setLoading(true);
    if (indigenousNationID) {
      const result = await IndigenousNationService.updateIndigenousNation(data);
      if (result.status === 200) {
        setAlertContentText("Indigenous nation details updated");
        setOpenAlertDialog(true);
        props.onSubmitSuccess();
        setLoading(false);
      }
    } else {
      const result = await IndigenousNationService.createIndigenousNation(data);
      if (result.status === 201) {
        setAlertContentText("Indigenous nation details inserted");
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
              defaultValue={indigenousNation?.relationship_holder_id || ""}
              getOptionLabel={(o: Staff) => (o ? o.full_name : "")}
              getOptionValue={(o: Staff) => (o ? o.id.toString() : "")}
              options={staffs}
              {...register("relationship_holder_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={indigenousNation?.is_active}
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
