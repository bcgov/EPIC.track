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
import ProjectService from "../../services/projectService";
import { Project } from "../../models/project";
import { Proponent } from "../../models/proponent";
import ControlledSelect from "../shared/controlledInputComponents/ControlledSelect";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import TrackDialog from "../shared/TrackDialog";

const schema = yup.object().shape({
  project_name: yup.string().required("Project Name is required"),
  proponent: yup.string().required("Proponent is required"),
  type: yup.string().required("Type is required"),
  subtype: yup.string().required("SubType is required"),
  project_description: yup.string().required("Project Description is required"),
  latitude: yup.string().required("Invalid latitude value"),
  longitude: yup.string().required("Invalid longitude value"),
  env_region: yup.string().required("ENV Region is required"),
  nrs_region: yup.string().required("NRS Region is required"),
});

export default function ProjectForm({ ...props }) {
  const [project, setProject] = React.useState<Project>();
  const [proponent, setProponent] = React.useState<Proponent>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const projectId = props.project_id;
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: project,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const getProjects = async (id: number) => {
    const result = await ProjectService.getProjects(id);
    if (result.status === 200) {
      setProject((result.data as never)["project"]);
      reset((result.data as never)["project"]);
    }
  };

  React.useEffect(() => {
    if (projectId) {
      getProjects(projectId);
    }
  }, [projectId]);

  React.useEffect(() => {
    getProjects();
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
              error={!!errors?.project_name?.message}
              helperText={errors?.project_name?.message?.toString()}
              {...register("project_name")}
            />
          </Grid>
          {/* <Grid item xs={6}>
            <TrackLabel>Proponent</TrackLabel>
            <ControlledSelect
              error={!!errors?.proponent?.message}
              helperText={errors?.proponent?.message?.toString()}
              defaultValue={project?.proponent}
              fullWidth
              {...register("proponent")}
            >
              {proponent.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </ControlledSelect> 
          </Grid>  */}
          {/* <Grid item xs={6}>
            <TrackLabel>Type</TrackLabel>
            <ControlledSelect
              error={!!errors?.type?.message}
              helperText={errors?.type?.message?.toString()}
              defaultValue={project?.type}
              fullWidth
              {...register("type")}
            >
              {project.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.type}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid> */}
          {/* <Grid item xs={6}>
            <TrackLabel>SubType</TrackLabel>
            <ControlledSelect
              error={!!errors?.subtype?.message}
              helperText={errors?.subtype?.message?.toString()}
              defaultValue={project?.proponent}
              fullWidth
              {...register("subtype")}
            >
              {project.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.subtype}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid> */}
          <Grid item xs={6}>
            <TrackLabel>Project Description</TrackLabel>
            <TextField
              fullWidth
              multiline
              {...register("project_description")}
              error={!!errors?.project_description?.message}
              helperText={errors?.project_description?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Location Description</TrackLabel>
            <TextField
              fullWidth
              {...register("location_description")}
              error={!!errors?.location_description?.message}
              helperText={errors?.location_description?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Latitude</TrackLabel>
            <TextField
              fullWidth
              {...register("latitude")}
              error={!!errors?.latitude?.message}
              helperText={errors?.latitude?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Longitude</TrackLabel>
            <TextField
              fullWidth
              {...register("longitude")}
              error={!!errors?.longitude?.message}
              helperText={errors?.longitude?.message?.toString()}
            />
          </Grid>
          {/* <Grid item xs={6}>
            <TrackLabel>ENV Region</TrackLabel>
            <ControlledSelect
              error={!!errors?.env_region?.message}
              helperText={errors?.env_region?.message?.toString()}
              defaultValue={project?.env_region}
              fullWidth
              {...register("env_region")}
            >
              {project.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.region_env}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid> */}
          {/* <Grid item xs={6}>
            <TrackLabel>NRS Region</TrackLabel>
            <ControlledSelect
              error={!!errors?.nrs_region?.message}
              helperText={errors?.nrs_region?.message?.toString()}
              defaultValue={project?.env_region}
              fullWidth
              {...register("nrs_region")}
            >
              {project.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.region_flnro}
                </MenuItem>
              ))}
            </ControlledSelect>
          </Grid> */}
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
            <TextField helperText fullWidth />
            Provide the certificate number if available
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Abbreviation</TrackLabel>
            <TextField helperText fullWidth />
            Abbreviation of the project name to be displayed in reports and
            graphs
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={project?.is_active}
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
