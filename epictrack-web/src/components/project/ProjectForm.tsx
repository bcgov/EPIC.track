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
import codeService, { Code } from "../../services/codeService";
import ProjectService from "../../services/projectService";
import { Project } from "../../models/project";
import { Proponent } from "../../models/proponent";
import ProponentService from "../../services/proponentService";
import ControlledSelect from "../shared/controlledInputComponents/ControlledSelect";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import TrackDialog from "../shared/TrackDialog";
import { Region } from "../../models/region";
import { Type } from "../../models/type";
import { SubType } from "../../models/subtype";
import subTypeService from "../../services/subTypeService";

const schema = yup.object<Project>().shape({
  name: yup.string().required("Project Name is required"),
  proponent: yup.string().required("Proponent is required"),
  type_id: yup.string().required("Type is required"),
  sub_type_id: yup.string().required("SubType is required"),
  description: yup.string().required("Project Description is required"),
  latitude: yup.string().required("Invalid latitude value"),
  longitude: yup.string().required("Invalid longitude value"),
  region_id_env: yup.number().required("ENV Region is required"),
  region_id_flnro: yup.number().required("NRS Region is required"),
});

export default function ProjectForm({ ...props }) {
  const [project, setProject] = React.useState<Project>();
  const [envRegions, setEnvRegions] = React.useState<Region[]>();
  const [nrsRegions, setNRSRegions] = React.useState<Region[]>();
  const [subTypes, setSubTypes] = React.useState<SubType[]>([]);
  const [types, setTypes] = React.useState<Type[]>([]);
  const [proponents, setProponents] = React.useState<Proponent[]>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedType, setSelectedType] = React.useState<number>(0);
  const projectId = props.projectId;
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

  const setRegions = (regions: Region[]) => {
    const envRegions = regions.filter((p) => p.entity === "ENV");
    const nrsRegions = regions.filter((p) => p.entity === "FLNR");
    setEnvRegions(envRegions);
    setNRSRegions(nrsRegions);
  };

  const codeTypes: { [x: string]: any } = {
    regions: setRegions,
    types: setTypes,
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
    if (result.status === 200) {
      const project = result.data as Project;
      project.type_id = project.sub_type.type.id;
      setProject(project);
      reset(project);
      setSelectedType(project.sub_type.type.id);
    }
  };

  const getSubTypesByType = async () => {
    const subTypeResult = await subTypeService.getSubTypeByType(selectedType);
    if (subTypeResult.status === 200) {
      setSubTypes(subTypeResult.data as SubType[]);
    }
  };

  React.useEffect(() => {
    getSubTypesByType();
  }, [selectedType]);

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
      const result = await ProjectService.updateProjects(projectId, data);
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
              defaultValue={project?.proponent_id}
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
              error={!!errors?.type_id?.message}
              helperText={errors?.type_id?.message?.toString()}
              defaultValue={project?.type_id}
              fullWidth
              {...register("type_id")}
              onChange={(e) => setSelectedType(parseInt(e.target.value))}
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
              defaultValue={project?.sub_type_id}
              fullWidth
              {...register("sub_type_id")}
            >
              {subTypes?.map((e, index) => (
                <MenuItem key={index + 1} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
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
          <Grid item xs={6}>
            <TrackLabel>ENV Region</TrackLabel>
            <ControlledSelect
              error={!!errors?.region_id_env?.message}
              helperText={errors?.region_id_env?.message?.toString()}
              defaultValue={project?.region_id_env}
              fullWidth
              {...register("region_id_env")}
            >
              {envRegions?.map((e, index) => (
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
              defaultValue={project?.region_id_flnro}
              fullWidth
              {...register("region_id_flnro")}
            >
              {nrsRegions?.map((e, index) => (
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
              defaultChecked={project?.is_project_closed}
              {...register("is_project_closed")}
            />
            <TrackLabel id="active">Is the Project Closed?</TrackLabel>
          </Grid>
          <Grid item xs={2} sx={{ paddingTop: "30px !important" }}>
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
