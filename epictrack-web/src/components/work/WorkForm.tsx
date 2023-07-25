import React from "react";
import { TextField, Grid, Divider } from "@mui/material";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import codeService from "../../services/codeService";
import { Work } from "../../models/work";
import { ListType } from "../../models/code";
import { Ministry } from "../../models/ministry";
import { Code } from "../../services/codeService";
import { TrackLabel } from "../shared";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DATE_FORMAT } from "../../constants/application-constant";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import { Staff } from "../../models/staff";
import staffService from "../../services/staffService/staffService";
import dayjs from "dayjs";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import workService from "../../services/workService/workService";
import { MasterContext } from "../shared/MasterContext";

const schema = yup.object<Work>().shape({
  ea_act_id: yup.number().required("EA Act is required"),
  work_type_id: yup.number().required("Work type is required"),
  start_date: yup.date().required("Start date is required"),
  project_id: yup.number().required("Project is required"),
  ministry_id: yup.number().required("Responsible ministry is required"),
  federal_involvement_id: yup
    .number()
    .required("Federal Involvement is required"),
  title: yup
    .string()
    .required("Title is required")
    .test({
      name: "checkDuplicateWork",
      exclusive: true,
      message: "Work with the given title already exists",
      test: async (value, { parent }) => {
        if (value) {
          const validateWorkResult = await workService.checkWorkExists(
            value,
            parent["id"]
          );
          return !(validateWorkResult.data as any)["exists"] as boolean;
        }
        return true;
      },
    }),
  substitution_act_id: yup.number(),
});

export default function WorkForm({ ...props }) {
  const [eaActs, setEAActs] = React.useState<ListType[]>([]);
  const [workTypes, setWorkTypes] = React.useState<ListType[]>([]);
  const [projects, setProjects] = React.useState<ListType[]>([]);
  const [ministries, setMinistries] = React.useState<Ministry[]>([]);
  const [federalInvolvements, setFederalInvolvements] = React.useState<
    ListType[]
  >([]);
  const [substitutionActs, setSubtitutionActs] = React.useState<ListType[]>([]);
  const [teams, setTeams] = React.useState<ListType[]>([]);
  const [epds, setEPDs] = React.useState<Staff[]>([]);
  const [leads, setLeads] = React.useState<Staff[]>([]);
  const [decisionMakers, setDecisionMakers] = React.useState<Staff[]>([]);
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setFormId("work-form");
  }, []);

  React.useEffect(() => {
    ctx.setId(props.workId);
  }, [ctx.id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: ctx.item as Work,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;

  React.useEffect(() => {
    reset(ctx.item);
  }, [ctx.item]);

  const codeTypes: { [x: string]: any } = {
    ea_acts: setEAActs,
    work_types: setWorkTypes,
    projects: setProjects,
    ministries: setMinistries,
    federal_involvements: setFederalInvolvements,
    substitution_acts: setSubtitutionActs,
    eao_teams: setTeams,
  };

  const staffByRoles: { [x: string]: any } = {
    "4": setLeads,
    "3": setEPDs,
    "1,2,8": setDecisionMakers,
  };
  const getCodes = async (code: Code) => {
    const codeResult = await codeService.getCodes(code);
    if (codeResult.status === 200) {
      codeTypes[code]((codeResult.data as never)["codes"]);
    }
  };

  const getStaffByPosition = async (position: string) => {
    const staffResult = await staffService.getStaffByPosition(position);
    if (staffResult.status === 200) {
      staffByRoles[position](staffResult.data as never);
    }
  };

  React.useEffect(() => {
    const promises: any[] = [];
    Object.keys(codeTypes).forEach(async (key) => {
      promises.push(getCodes(key as Code));
    });
    Object.keys(staffByRoles).forEach(async (key) => {
      promises.push(getStaffByPosition(key));
    });
    Promise.all(promises);
  }, []);

  const onSubmitHandler = async (data: any) => {
    ctx.onSave(data, () => {
      reset();
    });
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="work-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={4}>
            <TrackLabel>EA Act</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.ea_act_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.ea_act_id}
              options={eaActs || []}
              getOptionValue={(o: ListType) => o?.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("ea_act_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={4}>
            <TrackLabel>Worktype</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.ea_act_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.ea_act_id}
              options={workTypes || []}
              getOptionValue={(o: ListType) => o?.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("work_type_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={4}>
            <TrackLabel className="start-date-label">Start date</TrackLabel>
            <Controller
              name="start_date"
              control={control}
              defaultValue={(ctx.item as Work)?.start_date}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format={DATE_FORMAT}
                    slotProps={{
                      textField: {
                        id: "start_date",
                        fullWidth: true,
                        error: error ? true : false,
                        helperText: error?.message,
                      },
                      ...register("start_date"),
                    }}
                    value={dayjs(value)}
                    onChange={(event) => {
                      onChange(event);
                    }}
                    defaultValue={dayjs(
                      (ctx.item as Work)?.start_date
                        ? (ctx.item as Work).start_date
                        : ""
                    )}
                    sx={{ display: "block" }}
                  />
                </LocalizationProvider>
              )}
            />
          </Grid>
          <Divider style={{ width: "100%", marginTop: "10px" }} />
          <Grid item xs={6}>
            <TrackLabel>Project</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.project_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.project_id}
              options={projects || []}
              getOptionValue={(o: ListType) => o?.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("project_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Responsible Ministry</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.ministry_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.ministry_id}
              options={ministries || []}
              getOptionValue={(o: Ministry) => o?.id.toString()}
              getOptionLabel={(o: Ministry) => o.name}
              {...register("ministry_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Federal Involvement</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.federal_involvement_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.federal_involvement_id}
              options={federalInvolvements || []}
              getOptionValue={(o: ListType) => o?.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("federal_involvement_id")}
            ></ControlledSelectV2>
          </Grid>

          <Grid item xs={6}>
            <TrackLabel>Federal Act</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.substitution_act_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.substitution_act_id}
              options={substitutionActs || []}
              getOptionValue={(o: ListType) => o?.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("substitution_act_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>Title</TrackLabel>
            <TextField
              fullWidth
              error={!!errors?.title?.message}
              helperText={errors?.title?.message?.toString()}
              {...register("title")}
            />
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>Short Description</TrackLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
              error={!!errors?.short_description?.message}
              helperText={errors?.short_description?.message?.toString()}
              {...register("short_description")}
            />
          </Grid>
          <Grid item xs={12}>
            <TrackLabel>Long Description</TrackLabel>
            <TextField
              fullWidth
              multiline
              rows={4}
              error={!!errors?.long_description?.message}
              helperText={errors?.long_description?.message?.toString()}
              {...register("long_description")}
            />
          </Grid>
          <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={(ctx.item as Work)?.is_pecp_required}
              {...register("is_pecp_required")}
            />
            <TrackLabel id="is_pcp_required">PCP Required</TrackLabel>
          </Grid>
          <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={(ctx.item as Work)?.is_cac_recommended}
              {...register("is_cac_recommended")}
            />
            <TrackLabel id="is_cac_recommended">CAC Required</TrackLabel>
          </Grid>
          <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={(ctx.item as Work)?.is_watched}
              {...register("is_watched")}
            />
            <TrackLabel id="is_watched">Watched</TrackLabel>
          </Grid>
          <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={(ctx.item as Work)?.is_active}
              {...register("is_active")}
            />
            <TrackLabel id="is_active">Active</TrackLabel>
          </Grid>

          <Divider style={{ width: "100%", marginTop: "10px" }} />

          <Grid item xs={6}>
            <TrackLabel>EAO Team</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.eao_team_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.eao_team_id}
              options={teams || []}
              getOptionValue={(o: ListType) => o?.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              {...register("eao_team_id")}
            ></ControlledSelectV2>
          </Grid>

          <Grid item xs={6}>
            <TrackLabel>Responsible EPD</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.responsible_epd_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.responsible_epd_id}
              options={epds || []}
              getOptionValue={(o: Staff) => o?.id.toString()}
              getOptionLabel={(o: Staff) => o.full_name}
              {...register("responsible_epd_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Work Lead</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.work_lead_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.work_lead_id}
              options={leads || []}
              getOptionValue={(o: Staff) => o?.id.toString()}
              getOptionLabel={(o: Staff) => o.full_name}
              {...register("work_lead_id")}
            ></ControlledSelectV2>
          </Grid>
          <Grid item xs={6}>
            {/* TODO: Make the label dynamic */}
            <TrackLabel>Decision Maker</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.decision_by_id?.message?.toString()}
              defaultValue={(ctx.item as Work)?.decision_by_id}
              options={decisionMakers || []}
              getOptionValue={(o: Staff) => o?.id.toString()}
              getOptionLabel={(o: Staff) => o.full_name}
              {...register("decision_by_id")}
            ></ControlledSelectV2>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
