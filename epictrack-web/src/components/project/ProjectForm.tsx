import React from "react";
import {
  TextField,
  Grid,
  Button,
  MenuItem,
  Divider,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TrackLabel } from "../shared/index";
import codeService from "../../services/codeService";
import ProjectService from "../../services/projectService";
import { Project } from "../../models/project";
import { Code } from "../../../services/codeService";
import { Proponent } from "../../models/proponent";
import { subtype } from "../../models/subtype";
import ProponentService from "../../services/proponentService";
import ControlledSelect from "../shared/controlledInputComponents/ControlledSelect";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import TrackDialog from "../shared/TrackDialog";

const schema = yup.object<Project>().shape({
  name: yup.string().required("Project Name is required"),
  proponent: yup.string().required("Proponent is required"),
  type: yup.string().required("Type is required"),
  sub_type_id: yup.string().required("SubType is required"),
  description: yup.string().required("Project Description is required"),
  latitude: yup.string().required("Invalid latitude value"),
  longitude: yup.string().required("Invalid longitude value"),
  region_id_env: yup.number().required("ENV Region is required"),
  region_id_flnro: yup.number().required("NRS Region is required"),
});

export default function ProjectForm({ ...props }) {
  const [projects, setProjects] = React.useState<Project>();
  const [regions, setRegions] = React.useState<string[]>([]);
  const [subtypes, setsubTypes] = React.useState<string[]>([]);
  const [types, setTypes] = React.useState<string[]>([]);
  const [proponents, setProponents] = React.useState<Proponent>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const projectId = props.projectId;
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: projects,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  // const halflocation = Math.ceil(location.length / 2);
  // const latitude = location.slice(0, halflocation);
  // const Longitude = location.slice(halflocation);

  const codeTypes: { [x: string]: any } = {
    regions: setRegions,
    types: setTypes,
    subtypes: setsubTypes,
    proponents: setProponents,
  };

  const getCodes = async (code: Code) => {
    const codeResult = await codeService.getCodes(code);
    if (codeResult.status === 200) {
      codeTypes[code]((codeResult.data as never)["codes"]);
    }
  };
  const getProject = async (id: number) => {
    const result = await ProjectService.getProject(id);
    console.log(result);
    if (result.status === 200) {
      const project = result.data as any;
      setProjects(project);
      reset(project);
    }
  };
  React.useEffect(() => {
    if (projectId) {
      getProject(projectId);
    }
  }, [projectId]);

  React.useEffect(() => {
    const promises: any[] = [];
    Object.keys(codeTypes).forEach(async (key) => {
      promises.push(getCodes(key as Code));
    });
    Promise.all(promises);
  }, []);

  const onSubmitHandler = async (data: any) => {
    setLoading(true);
    if (projectId) {
      const result = await ProjectService.updateProjects(data);
      if (result.status === 200) {
        setAlertContentText("Project details updated");
        setOpenAlertDialog(true);
        props.onSubmitSucces();
        setLoading(false);
      }
    } else {
      const result = await ProjectService.createProjects(data);
      if (result.status === 201) {
        setAlertContentText("Project details inserted");
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
          id="project-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={6}>
            <TrackLabel>Project Name</TrackLabel>
            <TextField
              fullWidth
              error={!!errors?.name?.message}
              helperText={errors?.name?.message?.toString()}
              {...register("name")}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Proponent</TrackLabel>
            <ControlledSelect
              error={!!errors?.proponent_id?.message}
              helperText={errors?.proponent_id?.message?.toString()}
              defaultValue={projects?.proponent_id}
              fullWidth
              {...register("proponent_id")}
            >
              {proponents?.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Type</TrackLabel>
            <ControlledSelect
              error={!!errors?.type?.message}
              helperText={errors?.type?.message?.toString()}
              defaultValue={projects?.type}
              fullWidth
              {...register("sub_type.type.name")}
            >
              {types?.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>SubType</TrackLabel>
            <ControlledSelect
              error={!!errors?.sub_type_id?.message}
              helperText={errors?.sub_type_id?.message?.toString()}
              defaultValue={projects?.sub_type_id}
              fullWidth
              {...register("sub_type_id")}
            >
              {/* {subtypes?.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e}
                </MenuItem>
              ))} */}
            </ControlledSelect>
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>Project Description</TrackLabel>
            <TextField
              fullWidth
              multiline
              rows={4}
              {...register("description")}
              error={!!errors?.description?.message}
              helperText={errors?.description?.message?.toString()}
            />
          </Grid>
          <Divider style={{ width: "100%", marginTop: "10px" }} />
          <Grid item xs={6}>
            <TrackLabel>Location Description</TrackLabel>
            <TextField
              fullWidth
              {...register("address")}
              error={!!errors?.address?.message}
              helperText={errors?.address?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Latitude</TrackLabel>
            <TextField
              fullWidth
              {...register("location")}
              error={!!errors?.location?.message}
              helperText={errors?.location?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Longitude</TrackLabel>
            <TextField
              fullWidth
              {...register("location")}
              error={!!errors?.location?.message}
              helperText={errors?.location?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>ENV Region</TrackLabel>
            <ControlledSelect
              error={!!errors?.region_id_env?.message}
              helperText={errors?.region_id_env?.message?.toString()}
              defaultValue={projects?.region_id_env}
              fullWidth
              {...register("region_id_env")}
            >
              {regions?.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>NRS Region</TrackLabel>
            <ControlledSelect
              error={!!errors?.region_id_flnro?.message}
              helperText={errors?.region_id_flnro?.message?.toString()}
              defaultValue={projects?.region_id_flnro}
              fullWidth
              {...register("region_id_flnro")}
            >
              {regions?.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Capital Investment</TrackLabel>
            <TextField
              fullWidth
              {...register("capital_investment")}
              error={!!errors?.capital_investment?.message}
              helperText={errors?.capital_investment?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>EPIC GUID</TrackLabel>
            <TextField
              fullWidth
              {...register("epic_guid")}
              error={!!errors?.epic_guid?.message}
              helperText={errors?.epic_guid?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>
              Certificate Number
              {/* <IconWithTooltip /> */}
            </TrackLabel>
            <TextField helperText fullWidth {...register("ea_certificate")} />
            Provide the certificate number if available
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Abbreviation</TrackLabel>
            <TextField helperText fullWidth {...register("abbreviation")} />
            Abbreviation of the project name to be displayed in reports and
            graphs
          </Grid>
          <Grid item xs={4} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={projects?.is_project_closed}
              {...register("is_project_closed")}
            />
            <TrackLabel id="active">Is the Project Closed?</TrackLabel>
          </Grid>
          <Grid item xs={2} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={projects?.is_active}
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
