import React from "react";
import {
  TextField,
  Grid,
  Button,
  Divider,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TrackLabel } from "../shared/index";
import codeService, { Code } from "../../services/codeService";
import ProjectService from "../../services/projectService";
import { Project } from "../../models/project";
import { Proponent } from "../../models/proponent";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import TrackDialog from "../shared/TrackDialog";
import { Region } from "../../models/region";
import { Type } from "../../models/type";
import { SubType } from "../../models/subtype";
import subTypeService from "../../services/subTypeService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";

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
  const projectId = props.projectId;

  const schema = yup.object<Project>().shape({
    name: yup
      .string()
      .required("Project Name is required")
      .test(
        "validate-Project",
        "Project with the given name already exists",
        async (value) => {
          const validateProjectResult = await ProjectService.checkProjectExists(
            value,
            projectId
          );
          return !(validateProjectResult.data as any)["exists"] as boolean;
        }
      ),
    type_id: yup.string().required("Type is required"),
    proponent_id: yup.string().required("Proponent is required"),
    sub_type_id: yup.string().required("SubType is required"),
    description: yup.string().required("Project Description is required"),
    latitude: yup.string().required("Invalid latitude value"),
    longitude: yup.string().required("Invalid longitude value"),
    region_id_env: yup.string().required("ENV Region is required"),
    region_id_flnro: yup.string().required("NRS Region is required"),
  });
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: project,
  });
  console.log(project);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = methods;
  const formValues = useWatch({ control });

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
  const getProject = React.useCallback(
    async (id: number) => {
      const result = await ProjectService.getProject(id);
      if (result.status === 200) {
        const project = result.data as Project;
        setProject(project);
        reset(project);
      }
    },
    [project]
  );

  const getSubTypesByType = async () => {
    const subTypeResult = await subTypeService.getSubTypeByType(
      formValues.type_id
    );
    if (subTypeResult.status === 200) {
      setSubTypes(subTypeResult.data as SubType[]);
      // The subtype select box wasn't resetting when type changes
      if (formValues.sub_type_id !== project?.sub_type_id) {
        reset({
          ...formValues,
          sub_type_id: undefined,
        });
      }
    }
  };

  React.useEffect(() => {
    if (formValues.type_id) {
      getSubTypesByType();
    }
  }, [formValues.type_id]);

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
        props.onSubmitSuccess();
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
            <ControlledSelectV2
              key={`proponent_select_${formValues.proponent_id}`}
              helperText={errors?.proponent_id?.message?.toString()}
              defaultValue={project?.proponent_id}
              options={proponents || []}
              getOptionValue={(o: Proponent) => o?.id?.toString()}
              getOptionLabel={(o: Proponent) => o.name}
              {...register("proponent_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Type</TrackLabel>
            <ControlledSelectV2
              key={`type_select_${formValues.type_id}`}
              helperText={errors?.type_id?.message?.toString()}
              defaultValue={project?.type_id}
              options={types || []}
              getOptionValue={(o: Type) => o?.id?.toString()}
              getOptionLabel={(o: Type) => o.name}
              {...register("type_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>SubType</TrackLabel>
            <ControlledSelectV2
              key={`subtype_select_${formValues.sub_type_id}`}
              helperText={errors?.sub_type_id?.message?.toString()}
              defaultValue={project?.sub_type_id}
              options={subTypes || []}
              getOptionValue={(o: SubType) => o.id.toString()}
              getOptionLabel={(o: SubType) => o.name}
              {...register("sub_type_id")}
            ></ControlledSelectV2>
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
          <Grid item xs={12}>
            <TrackLabel>Location Description</TrackLabel>
            <TextField
              fullWidth
              multiline
              rows={3}
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
            <ControlledSelectV2
              key={`env_select_${formValues.region_id_env}`}
              helperText={errors?.region_id_env?.message?.toString()}
              defaultValue={project?.region_id_env}
              options={envRegions || []}
              getOptionValue={(o: Region) => o.id.toString()}
              getOptionLabel={(o: Region) => o.name}
              {...register("region_id_env")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>NRS Region</TrackLabel>
            <ControlledSelectV2
              key={`nrs_select_${formValues.region_id_flnro}`}
              helperText={errors?.region_id_flnro?.message?.toString()}
              defaultValue={project?.region_id_flnro}
              options={nrsRegions || []}
              getOptionValue={(o: Region) => o.id.toString()}
              getOptionLabel={(o: Region) => o.name}
              {...register("region_id_flnro")}
            ></ControlledSelectV2>
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
            <TrackLabel>Certificate Number</TrackLabel>
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
        isOkRequired
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
