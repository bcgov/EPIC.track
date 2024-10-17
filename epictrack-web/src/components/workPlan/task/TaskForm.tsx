import React, { useState, useContext, useRef, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Moment from "moment";
import { Grid } from "@mui/material";
import { ETFormLabel } from "../../shared";
import { TaskEvent, statusOptions } from "../../../models/taskEvent";
import dayjs, { Dayjs } from "dayjs";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import { Palette } from "../../../styles/theme";
import { Staff } from "../../../models/staff";
import { WorkplanContext } from "../WorkPlanContext";
import workService from "../../../services/workService/workService";
import taskEventService, {
  TaskEventMutationRequest,
} from "../../../services/taskEventService/taskEventService";
import { showNotification } from "../../shared/notificationProvider";
import { ListType } from "../../../models/code";
import RichTextEditor from "../../shared/richTextEditor";
import { dateUtils } from "../../../utils";
import { EVENT_TYPE } from "../phase/type";
import { EventContext } from "../event/EventContext";
import ControlledMultiSelect from "../../shared/controlledInputComponents/ControlledMultiSelect";
import { getErrorMessage } from "../../../utils/axiosUtils";
import ControlledDatePicker from "../../shared/controlledInputComponents/ControlledDatePicker";
import TrackDatePicker from "../../shared/DatePicker";
import ControlledTextField from "../../shared/controlledInputComponents/ControlledTextField";
import responsibilityService from "services/responsibilityService/responsibilityService";

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .max(80, "Maximum characters allowed to task title is 80"),
  start_date: yup.string().required("Please select start date"),
  status: yup.string().required("Please select status"),
  number_of_days: yup.number().required("Please enter number of days"),
  responsibility_ids: yup.array().required("Please select responsibility"),
  assignee_ids: yup.array().required("Please select assignee"),
});

type TaskEventForm = {
  name: string;
  start_date: string;
  number_of_days: number;
  assignee_ids: string[];
  responsibility_ids: string[];
  status: string;
};

interface TaskFormProps {
  onSave: () => void;
  taskEvent?: TaskEvent;
}
const TaskForm = ({
  onSave = () => {
    return;
  },
  taskEvent,
}: TaskFormProps) => {
  const [assignees, setAssignees] = useState<Staff[]>([]);
  const [responsibilities, setResponsibilities] = useState<ListType[]>([]);
  const [notes, setNotes] = useState(taskEvent?.notes || "");
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const endDateRef = useRef();
  const ctx = useContext(WorkplanContext);
  const { handleHighlightRows } = useContext(EventContext);
  const initialNotes = useMemo(() => taskEvent?.notes, [taskEvent?.id]);

  const defaultValues: TaskEventForm = {
    name: taskEvent?.name || "",
    start_date: taskEvent?.start_date || dayjs().format(),
    status: taskEvent?.status || "",
    number_of_days: taskEvent?.number_of_days || 0,
    responsibility_ids: taskEvent?.responsibility_ids || [],
    assignee_ids: taskEvent?.assignee_ids || [],
  };

  const methods = useForm<TaskEventForm>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  useEffect(() => {
    getResponsibilites();
  }, []);

  useEffect(() => {
    getWorkTeamMembers();
  }, [ctx.work?.id]);

  const getResponsibilites = async () => {
    const responsibilities = await responsibilityService.getResponsibilities();
    if (responsibilities.status === 200) {
      const result = responsibilities.data as ListType[];
      setResponsibilities(result);
    }
  };
  const getWorkTeamMembers = async () => {
    const assigneeResult = await workService.getWorkTeamMembers(
      Number(ctx.work?.id),
      true
    );
    if (assigneeResult.status === 200) {
      const staff: any = (assigneeResult.data as any[]).map((p) => p.staff);
      setAssignees(staff);
    }
  };
  const statuses = useMemo(() => statusOptions, []);

  const createTask = async (data: TaskEventMutationRequest) => {
    const createResult = await taskEventService.create(data);
    showNotification("Task details inserted", {
      type: "success",
    });
    handleHighlightRows([
      {
        type: EVENT_TYPE.TASK,
        id: createResult.data.id,
      },
    ]);
    return createResult;
  };

  const updateTask = async (data: TaskEventMutationRequest) => {
    if (!taskEvent?.id) return;

    const updateResult = await taskEventService.update(
      data,
      Number(taskEvent?.id)
    );
    showNotification("Task details updated", {
      type: "success",
    });
    handleHighlightRows([
      {
        type: EVENT_TYPE.TASK,
        id: Number(taskEvent?.id),
      },
    ]);
    return updateResult;
  };

  const saveTask = async (data: TaskEventMutationRequest) => {
    if (taskEvent) {
      return updateTask(data);
    }
    return createTask(data);
  };

  const onSubmitHandler = async (data: TaskEventForm) => {
    try {
      const dataToSave = {
        ...data,
        work_phase_id: Number(ctx.selectedWorkPhase?.work_phase.id),
        start_date: Moment(data.start_date).format(),
        number_of_days:
          data.number_of_days.toString() === "" ? 0 : data.number_of_days,
        notes: notes ?? "",
      };

      await saveTask(dataToSave);
      onSave();
    } catch (e: any) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
  };

  const number_of_days = watch("number_of_days");
  const startDate = watch("start_date");

  const handleNDaysChange = (days: number) => {
    const endDate = dayjs(dateUtils.add(startDate, days, "days").toString());
    setEndDate(endDate);
  };

  const handleEndDateChange = (newEndDate: Dayjs | null) => {
    if (!newEndDate) {
      return;
    }
    const startDateDayjs = dayjs(startDate);
    const numberOfDays = newEndDate.diff(startDateDayjs, "day");

    setValue("number_of_days", numberOfDays);
  };

  useEffect(() => {
    handleNDaysChange(Number(number_of_days));
  }, [startDate]);

  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="task-form"
          container
          sx={{
            margin: 0,
            width: "100%",
          }}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid
            container
            columnSpacing={2}
            rowSpacing={2}
            sx={{
              backgroundColor: Palette.neutral.bg.light,
              px: 1,
              pt: 1,
              pb: 3,
            }}
          >
            <Grid item xs={12}>
              <ETFormLabel required>Title</ETFormLabel>
              <ControlledTextField
                name="name"
                placeholder="Title"
                defaultValue={taskEvent?.name}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <ETFormLabel>Start Date</ETFormLabel>
              <ControlledDatePicker
                name="start_date"
                defaultValue={Moment(taskEvent?.start_date).format()}
              />
            </Grid>
            <Grid item xs={4}>
              <ETFormLabel>Number of Days</ETFormLabel>
              <ControlledTextField
                name="number_of_days"
                fullWidth
                InputProps={{
                  inputProps: {
                    min: 0,
                  },
                }}
                type="number"
                onChange={(e) => {
                  const newNumberOfDays = Number(e.target.value);
                  handleNDaysChange(newNumberOfDays);
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <ETFormLabel>End Date</ETFormLabel>
              <TrackDatePicker
                slotProps={{
                  textField: {
                    id: "end_date",
                    fullWidth: true,
                    inputRef: endDateRef,
                    placeholder: "MM-DD-YYYY",
                    error: !!errors["start_date"],
                    helperText: errors["start_date"]?.message,
                  },
                }}
                value={endDate}
                onChange={(value: any) => {
                  const newValue = dayjs(value["$d"]);
                  setEndDate(newValue);
                  handleEndDateChange(newValue);
                }}
                minDate={dayjs(startDate)}
              />
            </Grid>
            <Grid item xs={5}>
              <ETFormLabel required>Progress</ETFormLabel>
              <ControlledSelectV2
                placeholder="Select your progress"
                helperText={errors?.status?.message?.toString()}
                defaultValue={taskEvent?.status}
                options={statuses || []}
                getOptionValue={(o: any) => o?.value.toString()}
                getOptionLabel={(o: any) => o.label}
                {...register("status")}
              ></ControlledSelectV2>
            </Grid>
          </Grid>
          <Grid
            container
            columnSpacing={2}
            rowSpacing={2}
            sx={{
              px: 1,
              py: 0,
              mt: 0,
              borderTop: `1px solid ${Palette.neutral.bg.dark}`,
            }}
          >
            <Grid item xs={6}>
              <ETFormLabel>Assigned</ETFormLabel>
              <ControlledMultiSelect
                isMulti={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                defaultValue={taskEvent?.assignee_ids?.map((p) => p.toString())}
                options={assignees || []}
                getOptionValue={(o: Staff) => o?.id.toString()}
                getOptionLabel={(o: Staff) => o.full_name}
                {...register("assignee_ids")}
              ></ControlledMultiSelect>
            </Grid>
            <Grid item xs={6}>
              <ETFormLabel>Responsibility</ETFormLabel>
              <ControlledMultiSelect
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                defaultValue={taskEvent?.responsibility_ids?.map((p) =>
                  p.toString()
                )}
                options={responsibilities || []}
                getOptionValue={(o: ListType) => o?.id.toString()}
                getOptionLabel={(o: ListType) => o.name}
                {...register("responsibility_ids")}
              ></ControlledMultiSelect>
            </Grid>
            <Grid item xs={12}>
              <ETFormLabel>Notes</ETFormLabel>
              <RichTextEditor
                handleEditorStateChange={setNotes}
                initialRawEditorState={initialNotes}
              />
            </Grid>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default TaskForm;
