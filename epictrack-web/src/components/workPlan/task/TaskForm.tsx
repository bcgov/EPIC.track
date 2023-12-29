import React, { useState, useContext, useRef, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Moment from "moment";
import { Grid } from "@mui/material";
import { ETFormLabel } from "../../shared";
import { TaskEvent, statusOptions } from "../../../models/taskEvent";
import dayjs from "dayjs";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import { Palette } from "../../../styles/theme";
import { Staff } from "../../../models/staff";
import { WorkplanContext } from "../WorkPlanContext";
import workService from "../../../services/workService/workService";
import taskEventService from "../../../services/taskEventService/taskEventService";
import { showNotification } from "../../shared/notificationProvider";
import { ListType } from "../../../models/code";
import codeService from "../../../services/codeService";
import RichTextEditor from "../../shared/richTextEditor";
import { dateUtils } from "../../../utils";
import { EVENT_TYPE } from "../phase/type";
import { EventContext } from "../event/EventContext";
import ControlledMultiSelect from "../../shared/controlledInputComponents/ControlledMultiSelect";
import { getErrorMessage } from "../../../utils/axiosUtils";
import ControlledDatePicker from "../../shared/controlledInputComponents/ControlledDatePicker";
import TrackDatePicker from "../../shared/DatePicker";
import ControlledTextField from "../../shared/controlledInputComponents/ControlledTextField";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  start_date: yup.string().required("Please select start date"),
  status: yup.string().required("Please select status"),
});
interface NumberOfDaysChangeProps {
  numberOfDays?: number | undefined;
  startDate?: string | undefined;
}
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
  const [notes, setNotes] = useState("");
  const endDateRef = useRef();
  const startDateRef = useRef();
  const numberOfDaysRef = useRef();
  const ctx = useContext(WorkplanContext);
  const { handleHighlightRows } = useContext(EventContext);
  const initialNotes = useMemo(() => taskEvent?.notes, [taskEvent?.id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: taskEvent,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = methods;

  useEffect(() => {
    getResponsibilites();
  }, []);

  useEffect(() => {
    getWorkTeamMembers();
  }, [ctx.work?.id]);

  useEffect(() => {
    reset(taskEvent);
    daysOnChangeHandler({
      numberOfDays: taskEvent?.number_of_days,
      startDate: taskEvent?.start_date,
    });
    if (taskEvent) {
      setNotes(taskEvent?.notes);
    }
  }, [taskEvent]);

  const getResponsibilites = async () => {
    const result = await codeService.getCodes("responsibilities");
    if (result.status === 200) {
      setResponsibilities((result.data as any)["codes"] as ListType[]);
    }
  };
  const getWorkTeamMembers = async () => {
    const assigneeResult = await workService.getWorkTeamMembers(
      Number(ctx.work?.id),
      true
    );
    if (assigneeResult.status === 200) {
      const staff = (assigneeResult.data as any[]).map((p) => p.staff);
      setAssignees(staff);
    }
  };
  const statuses = useMemo(() => statusOptions, []);

  const createTask = async (data: TaskEvent) => {
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

  const updateTask = async (data: TaskEvent) => {
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

  const saveTask = async (data: TaskEvent) => {
    if (taskEvent) {
      return updateTask(data);
    }
    return createTask(data);
  };

  const onSubmitHandler = async (data: TaskEvent) => {
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

  const daysOnChangeHandler = (params: NumberOfDaysChangeProps | any = {}) => {
    let number_of_days = 0;
    if (numberOfDaysRef?.current as any) {
      number_of_days =
        params.numberOfDays ||
        Number((numberOfDaysRef?.current as any)["value"]);
    }
    if (endDateRef?.current as any) {
      (endDateRef?.current as any)["value"] = dateUtils.formatDate(
        dateUtils
          .add(
            params.startDate || String((startDateRef?.current as any)["value"]),
            number_of_days,
            "days"
          )
          .toISOString()
      );
    }
  };

  const endDateChangeHandler = (endDate: any) => {
    if (startDateRef?.current as any) {
      const startDate = (startDateRef?.current as any)["value"];
      const dateDiff = dateUtils.diff(endDate, startDate, "days");
      (numberOfDaysRef.current as any)["value"] = dateDiff;
      setValue("number_of_days", dateDiff);
    }
  };

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
              padding: "24px 40px",
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
                datePickerProps={{
                  onDateChange: (event: any, defaultOnChange: any) => {
                    defaultOnChange(event);
                  },
                }}
                datePickerSlotProps={{
                  inputRef: startDateRef,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <ETFormLabel>Number of Days</ETFormLabel>
              <ControlledTextField
                name="number_of_days"
                defaultValue={taskEvent?.number_of_days}
                fullWidth
                InputProps={{
                  inputProps: {
                    min: 0,
                  },
                }}
                inputRef={numberOfDaysRef}
                type="number"
                onChange={daysOnChangeHandler}
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
                value={dayjs(
                  dateUtils
                    .add(
                      taskEvent?.start_date || "",
                      taskEvent?.number_of_days || 0,
                      "days"
                    )
                    .toString()
                )}
                onChange={(event: any) => {
                  const d = event ? event["$d"] : null;
                  endDateChangeHandler(d);
                }}
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
              padding: "0px 40px 16px 40px",
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
