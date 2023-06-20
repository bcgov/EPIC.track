import React from "react";
import {
  TextField,
  Grid,
  Button,
  Backdrop,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import codeService from "../../../services/codeService";
import phaseService from "../../../services/phaseService";
import { Code } from "../../../services/codeService";
import { Template } from "../../../models/template";
import ControlledCheckbox from "../../shared/controlledInputComponents/ControlledCheckbox";
import TrackDialog from "../../shared/TrackDialog";
import { EpicTrackPageGridContainer } from "../../shared";
import { TrackLabel } from "../../shared";
import { ListType } from "../../../models/code";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
export default function CreateTemplateForm({ ...props }) {
  const [template, setTemplate] = React.useState<Template>();
  const [eaActs, setEAActs] = React.useState<ListType[]>([]);
  const [workTypes, setWorkTypes] = React.useState<ListType[]>([]);
  const [phases, setPhases] = React.useState<ListType[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const templateId = props.templateId;
  const schema = yup.object<Template>().shape({
    ea_act_id: yup.number().required("EA Act is required"),
    work_type_id: yup.number().required("Work type is required"),
    phase_id: yup.number().required("Phase is required"),
    // template_name: yup.string().required("Name is required"),
  });
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: template,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;
  const formValues = useWatch({ control });
  const codeTypes: { [x: string]: any } = {
    ea_acts: setEAActs,
    work_types: setWorkTypes,
    phases: setPhases,
  };
  const getCodes = async (code: Code) => {
    const codeResult = await codeService.getCodes(code);
    if (codeResult.status === 200) {
      codeTypes[code]((codeResult.data as never)["codes"]);
    }
  };
  const getTemplates = async (id: number) => {
    // const result = await TemplateService.getTemplates(id);
    // if (result.status === 200) {
    //   const template = (result.data as any)["template"];
    //   setTemplate(template);
    //   reset(template);
    // }
  };
  const getPhaseByWorkTypeEAact = async () => {
    const phaseResult = await phaseService.getPhaseByWorkTypeEAact(
      formValues.ea_act_id,
      formValues.work_type_id
    );
    if (phaseResult.status === 200) {
      console.log(phaseResult);
      setPhases(phaseResult.data as ListType[]);
      if (
        formValues.work_type_id !== template?.work_type_id ||
        formValues.ea_act_id !== template?.ea_act_id
      ) {
        reset({
          ...formValues,
          phase_id: undefined,
        });
      }
    }
  };

  React.useEffect(() => {
    if (formValues.ea_act_id && formValues.work_type_id) {
      getPhaseByWorkTypeEAact();
    }
  }, [formValues.ea_act_id, formValues.work_type_id]);

  React.useEffect(() => {
    if (templateId) {
      getTemplates(templateId);
    }
  }, [templateId]);

  React.useEffect(() => {
    const promises: any[] = [];
    Object.keys(codeTypes).forEach(async (key) => {
      promises.push(getCodes(key as Code));
    });
    Promise.all(promises);
  }, []);

  const onSubmitHandler = async (data: any) => {
    console.log(data);
    setLoading(true);
    // if (templateId) {
    // props.onSubmitSuccess();
    // }
    reset();
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="template-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={12}>
            <TrackLabel>Template Name</TrackLabel>
            <TextField
              inputProps={{ maxLength: 150 }}
              fullWidth
              error={!!errors?.template_name?.message}
              helperText={errors?.template_name?.message?.toString()}
              {...register("template_name")}
            />
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>EA Act</TrackLabel>
            <ControlledSelectV2
              key={`eaact_select_${formValues.ea_act_id}`}
              helperText={errors?.ea_act_id?.message?.toString()}
              defaultValue={template?.ea_act_id}
              options={eaActs || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("ea_act_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>Worktype</TrackLabel>
            <ControlledSelectV2
              key={`worktype_select_${formValues.work_type_id}`}
              helperText={errors?.work_type_id?.message?.toString()}
              defaultValue={template?.work_type_id}
              options={workTypes || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("work_type_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>Phase</TrackLabel>
            <ControlledSelectV2
              key={`phase_select_${formValues.phase_id}`}
              helperText={errors?.phase_id?.message?.toString()}
              defaultValue={template?.phase_id}
              options={phases || []}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("phase_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: "flex", gap: "0.5rem", justifyContent: "left" }}
          >
            <input
              type="file"
              id="file-upload"
              {...register("template_file")}
            />
            {/* Attach Template */}
            {/* </Button> */}
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
    </>
  );
}
