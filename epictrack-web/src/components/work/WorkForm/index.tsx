import React from "react";
import { Grid, Divider, Tooltip, Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import Moment from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import codeService, { Code } from "../../../services/codeService";
import { Work, defaultWork } from "../../../models/work";
import { ListType } from "../../../models/code";
import { Ministry } from "../../../models/ministry";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../shared";
import { Staff } from "../../../models/staff";
import staffService from "../../../services/staffService/staffService";
import dayjs from "dayjs";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import workService from "../../../services/workService/workService";
import { MasterContext } from "../../shared/MasterContext";
import ControlledSwitch from "../../shared/controlledInputComponents/ControlledSwitch";
import { IconProps } from "../../icons/type";
import projectService from "../../../services/projectService/projectService";
import ControlledDatePicker from "../../shared/controlledInputComponents/ControlledDatePicker";
import { sort } from "../../../utils";
import ControlledTextField from "../../shared/controlledInputComponents/ControlledTextField";
import { EPDSpecialField } from "./EPDSpecialField";
import icons from "../../icons";
import { WorkLeadSpecialField } from "./WorkLeadSpecialField";
import { MIN_WORK_START_DATE } from "../../../constants/application-constant";
import { Project } from "../../../models/project";

const schema = yup.object<Work>().shape({
  ea_act_id: yup.number().required("EA Act is required"),
  work_type_id: yup.number().required("Work type is required"),
  start_date: yup.date().required("Start date is required"),
  project_id: yup.number().required("Project is required"),
  ministry_id: yup.number().required("Responsible Ministry is required"),
  federal_involvement_id: yup
    .number()
    .required("Federal Involvement is required"),
  report_description: yup.string().required("Work description is required"),
  title: yup
    .string()
    .required("Title is required")
    .max(150, "Title should not exceed 150 characters")
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
          return validateWorkResult.data
            ? (!(validateWorkResult.data as any)["exists"] as boolean)
            : true;
        }
        return true;
      },
    }),
  substitution_act_id: yup.number(),
  eao_team_id: yup.number().required("EAO team is required"),
  responsible_epd_id: yup.number().required("Responsible EPD is required"),
  work_lead_id: yup.number().required("Work Lead is required."),
  decision_by_id: yup.number().required("Decision Maker is required"),
});

const InfoIcon: React.FC<IconProps> = icons["InfoIcon"];

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
  const [selectedWorktype, setSelectedWorkType] = React.useState<any>();
  const [selectedProject, setSelectedProject] = React.useState<any>();
  const maxTitleLength = 150;
  const work = ctx?.item as Work;

  const [isEpdFieldLocked, setIsEpdFieldLocked] =
    React.useState<boolean>(false);

  const [isWorkLeadFieldLocked, setIsWorkLeadFieldLocked] =
    React.useState<boolean>(false);

  const isSpecialFieldLocked = isEpdFieldLocked || isWorkLeadFieldLocked;

  React.useEffect(() => {
    ctx.setDialogProps({
      saveButtonProps: {
        disabled: isSpecialFieldLocked,
      },
    });
  }, [isSpecialFieldLocked]);

  React.useEffect(() => {
    ctx.setFormId("work-form");
  }, []);

  React.useEffect(() => {
    ctx.setId(props.workId);
  }, [ctx.id]);

  React.useEffect(() => {
    ctx.setTitle(ctx.item ? work?.title : "Create Work");
  }, [ctx.title, ctx.item]);

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
    setValue,
    watch,
  } = methods;

  const title = watch("title");

  React.useEffect(() => {
    reset(ctx.item ?? defaultWork);
  }, [ctx.item]);

  const codeTypes: { [x: string]: any } = {
    ea_acts: setEAActs,
    work_types: setWorkTypes,
    ministries: setMinistries,
    federal_involvements: setFederalInvolvements,
    substitution_acts: setSubtitutionActs,
    eao_teams: setTeams,
  };

  const staffByRoles: { [x: string]: any } = {
    "4,3": setLeads,
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

  const getProjects = async () => {
    const projectResult = await projectService.getAll("list_type");
    if (projectResult.status === 200) {
      let projects = projectResult.data as ListType[];
      projects = sort(projects, "name");
      setProjects(projects);
    }
  };

  const getProject = async (id: string) => {
    const projectResult = await projectService.getById(id);
    if (projectResult.status === 200) {
      return projectResult.data as Project;
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
    getProjects();
  }, []);

  const onSubmitHandler = async (data: any) => {
    data.start_date = Moment(data.start_date).format();
    ctx.onSave(data, () => {
      reset();
    });
  };

  React.useEffect(() => {
    if (selectedProject && selectedWorktype) {
      setValue("title", `${selectedProject?.name} - ${selectedWorktype?.name}`);
    }
  }, [selectedProject, selectedWorktype]);

  const handleProjectChange = async (id: string) => {
    const selectedProject: any = projects.filter((project) => {
      return project.id.toString() === id;
    });
    const project = await getProject(selectedProject[0].id);
    setSelectedProject(project);
    setValue("epic_description", String(project?.description));
  };

  const handleWorktypeChange = async (id: string) => {
    const selectedWorktype: any = workTypes.filter((worktype) => {
      return worktype.id.toString() === id;
    });
    setSelectedWorkType(selectedWorktype[0]);
  };

  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="work-form"
        container
        spacing={2}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={4}>
          <ETFormLabel required>EA Act</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select EA Act"
            helperText={errors?.ea_act_id?.message?.toString()}
            defaultValue={work?.ea_act_id}
            options={eaActs || []}
            getOptionValue={(o: ListType) => o?.id.toString()}
            getOptionLabel={(o: ListType) => o.name}
            {...register("ea_act_id")}
            disabled={isSpecialFieldLocked}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={4}>
          <ETFormLabel required>Worktype</ETFormLabel>
          <ControlledSelectV2
            onHandleChange={handleWorktypeChange}
            placeholder="Select Worktype"
            helperText={errors?.ea_act_id?.message?.toString()}
            defaultValue={work?.ea_act_id}
            options={workTypes || []}
            getOptionValue={(o: ListType) => o?.id.toString()}
            getOptionLabel={(o: ListType) => o.name}
            {...register("work_type_id")}
            disabled={isSpecialFieldLocked}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={4}>
          <ETFormLabel className="start-date-label" required>
            Start date
          </ETFormLabel>
          <ControlledDatePicker
            name="start_date"
            datePickerProps={{
              minDate: dayjs(MIN_WORK_START_DATE),
              disabled: isSpecialFieldLocked,
            }}
          />
        </Grid>
        <Divider style={{ width: "100%", marginTop: "10px" }} />
        <Grid item xs={6}>
          <ETFormLabel required>Project</ETFormLabel>
          <ControlledSelectV2
            onHandleChange={handleProjectChange}
            placeholder="Select"
            helperText={errors?.project_id?.message?.toString()}
            defaultValue={work?.project_id}
            options={projects || []}
            getOptionValue={(o: ListType) => o?.id.toString()}
            getOptionLabel={(o: ListType) => o.name}
            {...register("project_id")}
            disabled={isSpecialFieldLocked}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel required>Responsible Ministry</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select"
            helperText={errors?.ministry_id?.message?.toString()}
            defaultValue={work?.ministry_id}
            options={ministries || []}
            getOptionValue={(o: Ministry) => o?.id.toString()}
            getOptionLabel={(o: Ministry) => o.name}
            {...register("ministry_id")}
            disabled={isSpecialFieldLocked}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel required>Federal Involvement</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select"
            helperText={errors?.federal_involvement_id?.message?.toString()}
            defaultValue={work?.federal_involvement_id}
            options={federalInvolvements || []}
            getOptionValue={(o: ListType) => o?.id.toString()}
            getOptionLabel={(o: ListType) => o.name}
            {...register("federal_involvement_id")}
            disabled={isSpecialFieldLocked}
          ></ControlledSelectV2>
        </Grid>

        <Grid item xs={6}>
          <ETFormLabel required>Federal Act</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select"
            helperText={errors?.substitution_act_id?.message?.toString()}
            defaultValue={work?.substitution_act_id}
            options={substitutionActs || []}
            getOptionValue={(o: ListType) => o?.id.toString()}
            getOptionLabel={(o: ListType) => o.name}
            {...register("substitution_act_id")}
            disabled={isSpecialFieldLocked}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={12}>
          <ETFormLabelWithCharacterLimit
            characterCount={title?.length || 0}
            maxCharacterLength={maxTitleLength}
          >
            Title
          </ETFormLabelWithCharacterLimit>
          <ControlledTextField
            name="title"
            fullWidth
            maxLength={maxTitleLength}
            disabled={isSpecialFieldLocked}
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabel required>Work Description</ETFormLabel>
          <ControlledTextField
            name="report_description"
            placeholder="Description will be shown on all reports"
            multiline
            fullWidth
            rows={2}
            disabled={isSpecialFieldLocked}
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabel>Project Description</ETFormLabel>
          <ControlledTextField
            name="epic_description"
            placeholder="Provide the description if differs from the report"
            fullWidth
            multiline
            rows={4}
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <ControlledSwitch
            sx={{ paddingLeft: "0px", marginRight: "10px" }}
            defaultChecked={work?.is_cac_recommended}
            name="is_cac_recommended"
            disabled={isSpecialFieldLocked}
          />
          <ETFormLabel id="is_cac_recommended">CAC Required</ETFormLabel>
          <Tooltip
            sx={{ paddingLeft: "2px" }}
            title="Select if there is a sufficient community interest in this Work to establish a Community Advisory Commitee (CAC)"
          >
            <Box component={"span"}>
              <InfoIcon />
            </Box>
          </Tooltip>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel required>EAO Team</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select"
            helperText={errors?.eao_team_id?.message?.toString()}
            defaultValue={work?.eao_team_id}
            options={teams || []}
            getOptionValue={(o: ListType) => o?.id.toString()}
            getOptionLabel={(o: ListType) => o.name}
            {...register("eao_team_id")}
            disabled={isSpecialFieldLocked}
          ></ControlledSelectV2>
        </Grid>

        <EPDSpecialField
          id={work?.id}
          onLockClick={() => setIsEpdFieldLocked((prev) => !prev)}
          open={isEpdFieldLocked}
          onSave={() => {
            ctx.getById(props.workId);
          }}
          options={epds || []}
        >
          <ControlledSelectV2
            disabled={work?.responsible_epd_id != undefined}
            placeholder="Select"
            helperText={errors?.responsible_epd_id?.message?.toString()}
            defaultValue={work?.responsible_epd_id}
            options={epds || []}
            getOptionValue={(o: Staff) => o?.id.toString()}
            getOptionLabel={(o: Staff) => o.full_name}
            {...register("responsible_epd_id")}
          />
        </EPDSpecialField>

        <WorkLeadSpecialField
          id={work?.id}
          onLockClick={() => setIsWorkLeadFieldLocked((prev) => !prev)}
          open={isWorkLeadFieldLocked}
          onSave={() => {
            ctx.getById(props.workId);
          }}
          options={leads || []}
        >
          <ControlledSelectV2
            disabled={work?.work_lead_id != undefined}
            placeholder="Select"
            helperText={errors?.work_lead_id?.message?.toString()}
            defaultValue={work?.work_lead_id}
            options={leads || []}
            getOptionValue={(o: Staff) => o?.id.toString()}
            getOptionLabel={(o: Staff) => o.full_name}
            {...register("work_lead_id")}
          />
        </WorkLeadSpecialField>

        <Grid item xs={6}>
          {/* TODO: Make the label dynamic */}
          <ETFormLabel required>Decision Maker</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select"
            helperText={errors?.decision_by_id?.message?.toString()}
            defaultValue={work?.decision_by_id}
            options={decisionMakers || []}
            getOptionValue={(o: Staff) => o?.id.toString()}
            getOptionLabel={(o: Staff) => o.full_name}
            {...register("decision_by_id")}
            disabled={isSpecialFieldLocked}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
          <ControlledSwitch
            sx={{ paddingLeft: "0px", marginRight: "10px" }}
            name="is_active"
            disabled={isSpecialFieldLocked}
          />
          <ETFormLabel id="is_active">Active</ETFormLabel>
        </Grid>
        <Grid item xs={4} sx={{ paddingTop: "30px !important" }}>
          <ControlledSwitch
            sx={{ paddingLeft: "0px", marginRight: "10px" }}
            defaultChecked={work?.is_high_priority}
            name="is_high_priority"
            disabled={isSpecialFieldLocked}
          />
          <ETFormLabel id="is_watched">High Priority</ETFormLabel>
          <Tooltip
            sx={{ paddingLeft: "2px" }}
            title="Work marked High Priority will have extra milestones appear on Reports"
          >
            <Box component={"span"}>
              <InfoIcon />
            </Box>
          </Tooltip>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
