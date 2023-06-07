import React from "react";
import {
  TextField,
  Grid,
  Button,
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
import ProponentService from "../../services/proponentService";
import { Proponent } from "../../models/proponent";
import StaffService from "../../services/staffService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";

export default function StaffForm({ ...props }) {
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const [proponent, setProponent] = React.useState<Proponent>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const proponentID = props.proponentID;
  const schema = yup.object().shape({
    name: yup
      .string()
      .required("Name is required")
      .test(
        "validate-proponent",
        "Proponent/Certificate Holder with the given name already exists",
        async (value) => {
          const validateProponentResult =
            await ProponentService.checkProponentExists(value, proponentID);
          return !(validateProponentResult.data as any)["exists"] as boolean;
        }
      ),
    //   responsible_epd_id: yup.string().required('Select position')
  });
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: proponent,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const getProponent = async (id: number) => {
    const result = await ProponentService.getProponent(id);
    if (result.status === 200) {
      setProponent((result.data as never)["proponent"]);
      reset((result.data as never)["proponent"]);
    }
  };

  React.useEffect(() => {
    if (proponentID) {
      getProponent(proponentID);
    }
  }, [proponentID]);

  const getStaffs = async () => {
    const staffsResult = await StaffService.getStaffs();
    if (staffsResult.status === 200) {
      setStaffs((staffsResult.data as never)["staffs"]);
    }
  };
  React.useEffect(() => {
    getStaffs();
  }, []);
  const onSubmitHandler = async (data: any) => {
    setLoading(true);
    if (proponentID) {
      const result = await ProponentService.updateProponent(data);
      if (result.status === 200) {
        setAlertContentText("Staff details updated");
        setOpenAlertDialog(true);
        props.onSubmitSuccess();
        setLoading(false);
      }
    } else {
      const result = await ProponentService.createProponent(data);
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
              defaultValue={proponent?.relationship_holder_id}
              options={staffs || []}
              getOptionValue={(o: Staff) => o.id.toString()}
              getOptionLabel={(o: Staff) => o.full_name}
              {...register("relationship_holder_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={proponent?.is_active}
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
