import React, { useEffect } from "react";
import { Grid, Divider, Tooltip, Box, InputAdornment } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import Moment from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import { Work, defaultWork } from "../../../models/work";
import { ListType } from "../../../models/code";
import { Ministry } from "../../../models/ministry";
import { ETFormLabel, ETFormLabelWithCharacterLimit } from "../../shared";
import { Staff } from "../../../models/staff";
import staffService from "../../../services/staffService/staffService";
import dayjs from "dayjs";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import workService from "../../../services/workService/workService";
import ControlledSwitch from "../../shared/controlledInputComponents/ControlledSwitch";
import { IconProps } from "../../icons/type";
import projectService from "../../../services/projectService/projectService";
import ControlledDatePicker from "../../shared/controlledInputComponents/ControlledDatePicker";
import { sort } from "../../../utils";
import ControlledTextField from "../../shared/controlledInputComponents/ControlledTextField";
import { EPDSpecialField } from "./EPDSpecialField";
import icons from "../../icons";
import { WorkLeadSpecialField } from "./WorkLeadSpecialField";
import {
  MIN_WORK_START_DATE,
  ROLES,
} from "../../../constants/application-constant";
import { Project } from "../../../models/project";
import ministryService from "services/ministryService";
import eaActService from "services/eaActService";
import EAOTeamService from "services/eao_team";
import federalInvolvementService from "services/federalInvolvementService";
import substitutionActService from "services/substitutionActService";
import { useAppSelector } from "hooks";
import { hasPermission } from "components/shared/restricted";

const maxTitleLength = 150;
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
    .max(maxTitleLength, "Title should not exceed 150 characters")
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
  simple_title: yup.string(),
  substitution_act_id: yup.number().required("Federal Act is required"),
  eao_team_id: yup.number().required("EAO team is required"),
  responsible_epd_id: yup.number().required("Responsible EPD is required"),
  work_lead_id: yup.number().required("Work Lead is required."),
  decision_by_id: yup.number().required("Decision Maker is required"),
});

const InfoIcon: React.FC<IconProps> = icons["InfoIcon"];

type WorkFormProps = {
  work: Work | null;
  fetchWork: () => void;
  saveWork: (data: any) => void;
  setDisableDialogSave?: (disable: boolean) => void;
};

export default function WorkForm({
  work,
  fetchWork,
  saveWork,
  setDisableDialogSave,
}: WorkFormProps) {
  const [eaActs, setEAActs] = React.useState<ListType[]>([]);
  const [workTypes, setWorkTypes] = React.useState<ListType[]>([]);
  const [projects, setProjects] = React.useState<ListType[]>([]);
  const [ministries, setMinistries] = React.useState<ListType[]>([]);
  const [federalInvolvements, setFederalInvolvements] = React.useState<
    ListType[]
  >([]);
  const [substitutionActs, setSubstitutionActs] = React.useState<ListType[]>(
    []
  );
  const [teams, setTeams] = React.useState<ListType[]>([]);
  const [epds, setEPDs] = React.useState<Staff[]>([]);
  const [leads, setLeads] = React.useState<Staff[]>([]);
  const [decisionMakers, setDecisionMakers] = React.useState<Staff[]>([]);
  const [titlePrefix, setTitlePrefix] = React.useState<string>("");

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: work ?? undefined,
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

  const workTypeId = watch("work_type_id");
  const projectId = watch("project_id");

  const federalInvolvementId = watch("federal_involvement_id");
  const title = watch("title");

  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });

  const [isEpdFieldUnlocked, setIsEpdFieldUnlocked] =
    React.useState<boolean>(false);

  const [isWorkLeadFieldUnlocked, setIsWorkLeadFieldUnlocked] =
    React.useState<boolean>(false);

  const isSpecialFieldUnlocked = isEpdFieldUnlocked || isWorkLeadFieldUnlocked;
  const workHasBeenCreated = work?.id ? true : false;

  useEffect(() => {
    reset(work ?? defaultWork);
  }, [work]);

  React.useEffect(() => {
    if (setDisableDialogSave) {
      setDisableDialogSave(isSpecialFieldUnlocked);
    }
  }, [isSpecialFieldUnlocked, setDisableDialogSave]);

  React.useEffect(() => {
    const noneFederalInvolvement = federalInvolvements.find(
      ({ name }) => name === "None"
    );
    const noneSubstitutionAct = substitutionActs.find(
      ({ name }) => name === "None"
    );

    if (
      noneSubstitutionAct &&
      Number(federalInvolvementId) === noneFederalInvolvement?.id
    ) {
      setValue("substitution_act_id", noneSubstitutionAct?.id);
    }
  }, [federalInvolvementId, substitutionActs, federalInvolvements]);

  const staffByRoles: { [x: string]: any } = {
    "4,3": setLeads,
    "3": setEPDs,
    "1,2,8": setDecisionMakers,
  };

  const getStaffByPosition = async (position: string) => {
    const staffResult = await staffService.getStaffByPosition(position);
    if (staffResult.status === 200) {
      const data = sort(staffResult.data as never[], "full_name");
      staffByRoles[position](data);
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

  const getMinistries = async () => {
    const ministryResult = await ministryService.getAll();
    if (ministryResult.status === 200) {
      setMinistries(ministryResult.data as ListType[]);
    }
  };

  const getEAActs = async () => {
    const eaActResult = await eaActService.getAll();
    if (eaActResult.status === 200) {
      const eaActs = eaActResult.data as ListType[];
      setEAActs(eaActs);
    }
  };

  const getWorkTypes = async () => {
    const workTypeResult = await workService.getWorkTypes();
    if (workTypeResult.status === 200) {
      const workType = workTypeResult.data as ListType[];
      setWorkTypes(workType);
    }
  };

  const getEAOTeams = async () => {
    const eaoTeamsResult = await EAOTeamService.getEaoTeams();
    if (eaoTeamsResult.status === 200) {
      const eaoTeams = eaoTeamsResult.data as ListType[];
      setTeams(eaoTeams);
    }
  };

  const getFederalInvolvements = async () => {
    const federalInvolvementResult = await federalInvolvementService.getAll();
    if (federalInvolvementResult.status === 200) {
      const federalInvolvements = federalInvolvementResult.data as ListType[];
      setFederalInvolvements(federalInvolvements);
    }
  };

  const getSubstitutionActs = async () => {
    const substitutionActResult = await substitutionActService.getAll();
    if (substitutionActResult.status === 200) {
      const substitutionActs = substitutionActResult.data as ListType[];
      setSubstitutionActs(substitutionActs);
    }
  };

  React.useEffect(() => {
    const promises: any[] = [];
    Object.keys(staffByRoles).forEach(async (key) => {
      promises.push(getStaffByPosition(key));
    });
    Promise.all(promises);
    getProjects();
    getMinistries();
    getEAActs();
    getWorkTypes();
    getEAOTeams();
    getFederalInvolvements();
    getSubstitutionActs();
  }, []);

  const onSubmitHandler = async (data: any) => {
    data.start_date = Moment(data.start_date).format();
    saveWork(data);
  };

  const simple_title = watch("simple_title");
  const titleSeparator = " - ";
  const getTitlePrefix = () => {
    let prefix = "";
    if (projectId) {
      const project = projects.find(
        (project) => project.id === Number(projectId)
      );
      prefix += `${project?.name}${titleSeparator}`;
    }
    if (workTypeId) {
      const workType = workTypes.find((type) => type.id === Number(workTypeId));
      prefix += `${workType?.name}${titleSeparator}`;
    }
    return prefix;
  };

  useEffect(() => {
    if (projects.length > 0 && workTypes.length > 0) {
      const prefix = getTitlePrefix();
      setTitlePrefix(prefix);
    }
  }, [workTypeId, projectId, projects, workTypes]);

  React.useEffect(() => {
    setValue("title", `${titlePrefix}${simple_title}`);
  }, [titlePrefix, simple_title]);

  const handleProjectChange = async (id: string) => {
    if (id) {
      const selectedProject: any = projects.filter((project) => {
        return project.id.toString() === id;
      });
      const project = await getProject(selectedProject[0].id);
      setValue("epic_description", String(project?.description));
    }
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
            disabled={!canEdit || isSpecialFieldUnlocked}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={4}>
          <ETFormLabel required>Worktype</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select Worktype"
            helperText={errors?.ea_act_id?.message?.toString()}
            defaultValue={work?.ea_act_id}
            options={workTypes || []}
            getOptionValue={(o: ListType) => o?.id.toString()}
            getOptionLabel={(o: ListType) => o.name}
            {...register("work_type_id")}
            disabled={!canEdit || workHasBeenCreated}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={4}>
          <ETFormLabel className="start-date-label" required>
            Start date
          </ETFormLabel>
          <ControlledDatePicker
            name="start_date"
            disabled={!canEdit || isSpecialFieldUnlocked}
            datePickerProps={{
              minDate: dayjs(MIN_WORK_START_DATE),
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
            getOptionValue={(o: ListType) => o?.id?.toString()}
            getOptionLabel={(o: ListType) => o?.name}
            {...register("project_id")}
            disabled={!canEdit || workHasBeenCreated}
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
            disabled={!canEdit || isSpecialFieldUnlocked}
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
            disabled={!canEdit || isSpecialFieldUnlocked}
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
            disabled={!canEdit || isSpecialFieldUnlocked}
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
            name="simple_title"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {titlePrefix ? `${titlePrefix}` : ""}
                </InputAdornment>
              ),
            }}
            maxLength={maxTitleLength - titlePrefix.length}
            disabled={!canEdit || isSpecialFieldUnlocked}
            error={Boolean(errors.title)}
            helperText={errors?.title?.message?.toString()}
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
            disabled={!canEdit || isSpecialFieldUnlocked}
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabel>Project Description</ETFormLabel>
          <ControlledTextField
            name="epic_description"
            placeholder=""
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
            disabled={!canEdit || isSpecialFieldUnlocked}
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
            disabled={!canEdit || isSpecialFieldUnlocked}
          ></ControlledSelectV2>
        </Grid>

        <EPDSpecialField
          id={work?.id}
          onLockClick={() => setIsEpdFieldUnlocked((prev) => !prev)}
          open={isEpdFieldUnlocked}
          onSave={() => {
            fetchWork();
          }}
          options={epds || []}
          disabled={!canEdit || isWorkLeadFieldUnlocked}
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
          onLockClick={() => setIsWorkLeadFieldUnlocked((prev) => !prev)}
          open={isWorkLeadFieldUnlocked}
          onSave={() => {
            fetchWork();
          }}
          options={leads || []}
          disabled={!canEdit || isEpdFieldUnlocked}
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
            disabled={!canEdit || isSpecialFieldUnlocked}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={3} sx={{ paddingTop: "30px !important" }}>
          <ControlledSwitch
            sx={{ paddingLeft: "0px", marginRight: "10px" }}
            name="is_active"
            disabled={!canEdit || isSpecialFieldUnlocked}
          />
          <ETFormLabel id="is_active">Active</ETFormLabel>
        </Grid>
        <Grid item xs={4} sx={{ paddingTop: "30px !important" }}>
          <ControlledSwitch
            sx={{ paddingLeft: "0px", marginRight: "10px" }}
            name="is_high_priority"
            disabled={!canEdit || isSpecialFieldUnlocked}
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
