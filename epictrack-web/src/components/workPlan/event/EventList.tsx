import {
  ChangeEvent,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MRT_RowSelectionState } from "material-react-table";
import { Box, Button, Divider, Grid, Tooltip, Typography } from "@mui/material";
import { SnackbarKey, closeSnackbar } from "notistack";
import Moment from "moment";
import { When } from "react-if";
import {
  EventPosition,
  EventsGridModel,
  EventTemplateVisibility,
  MilestoneEvent,
} from "models/event";
import { EVENT_STATUS, statusOptions, TaskEvent } from "models/taskEvent";
import {
  TemplateStatus,
  Work,
  WorkPhase,
  WorkPhaseAdditionalInfo,
} from "models/work";
import { ListType } from "models/code";
import { setLoadingState } from "services/loadingService";
import { eventService } from "services/eventService/eventService";
import { responsibilityService } from "services/responsibilityService/responsibilityService";
import { taskEventService } from "services/taskEventService/taskEventService";
import { workService } from "services/workService/workService";
import { OptionType } from "../../shared/filterSelect/type";
import { showNotification } from "../../shared/notificationProvider";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import TrackDialog from "../../shared/TrackDialog";
import WarningBox from "../../shared/warningBox";
import { IButton } from "components/shared";
import { Palette } from "styles/theme";
import { showConfetti } from "styles/uiStateSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { getErrorMessage } from "../../../utils/axiosUtils";
import { dateUtils, naturalSortCollator } from "../../../utils";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import TaskForm from "../task/TaskForm";
import ImportTaskEvent from "../task/ImportTaskEvent";
import { IconProps } from "../../icons/type";
import Icons from "../../icons";
import { WorkplanContext } from "../WorkPlanContext";
import { EventContext } from "./EventContext";
import EventListTable from "./EventListTable";
import EventForm from "./EventForm";
import { EVENT_TYPE } from "../phase/type";

const ImportFileIcon: FC<IconProps> = Icons["ImportFileIcon"];
const DeleteIcon: FC<IconProps> = Icons["DeleteIcon"];

const EventList = () => {
  const [events, setEvents] = useState<EventsGridModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [milestoneEvent, setMilestoneEvent] = useState<MilestoneEvent>();
  const [openExtensionWarningBox, setOpenExtensionWarningBox] = useState(true);
  const [responsibilities, setResponsibilities] = useState<OptionType[]>([]);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showDeleteMilestoneButton, setShowDeleteMilestoneButton] =
    useState<boolean>(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState<boolean>(false);
  const [showSuspendedWarningBox, setShowSuspendedWarningBox] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [showTemplateConfirmation, setShowTemplateConfirmation] =
    useState<boolean>(false);
  const [showTemplateForm, setShowTemplateForm] = useState<boolean>(false);
  const [staffSelectOptions, setStaffSelectOptions] = useState<OptionType[]>(
    []
  );
  const [taskEvent, setTaskEvent] = useState<TaskEvent>();
  const [templateAvailable, setTemplateAvailable] = useState<TemplateStatus>();
  const dispatch = useAppDispatch();

  const {
    selectedWorkPhase,
    setSelectedWorkPhase,
    setWork,
    setWorkPhases,
    team,
    work,
    workPhases,
  } = useContext(WorkplanContext);
  const { email } = useAppSelector((state) => state.user.userDetail);
  const userIsActiveTeamMember = useMemo(
    () =>
      team.some((member) => member.staff.email === email && member.is_active),
    [team, email]
  );
  const isConfettiShown = useAppSelector((state) => state.uiState.showConfetti);
  const { handleHighlightRows } = useContext(EventContext);

  const notificationId = useRef<SnackbarKey | null>(null);

  const showExtensionWarningBox = useMemo(
    () =>
      Number(selectedWorkPhase?.days_left) < 0 &&
      selectedWorkPhase?.work_phase.legislated &&
      openExtensionWarningBox,
    [selectedWorkPhase, openExtensionWarningBox]
  );

  const isEventFormFieldLocked = useMemo(() => {
    return !!milestoneEvent?.actual_date;
  }, [milestoneEvent]);

  useEffect(() => setEvents([]), [selectedWorkPhase?.work_phase.id]);

  useEffect(() => {
    setTimeout(() => {
      dispatch(showConfetti(false));
    }, 5000);
  }, [dispatch, isConfettiShown]);

  useEffect(() => {
    const options: OptionType[] = team
      .filter((staff) => staff.is_active)
      .map((staff) => {
        return {
          value: staff.staff_id.toString(),
          label: staff.staff.full_name,
        };
      })
      .filter(
        (ele, index, arr) =>
          arr.findIndex((t) => t.value === ele.value) === index
      );
    setStaffSelectOptions(options);
  }, [team]);

  const getTaskEvents = useCallback(
    async (phaseId: number): Promise<EventsGridModel[]> => {
      let result: EventsGridModel[] = [];
      try {
        const taskResult = await taskEventService.getAll(phaseId);

        if (taskResult.status === 200) {
          result = (taskResult.data as EventsGridModel[]).map((element) => {
            element.type = EVENT_TYPE.TASK;
            element.end_date = dateUtils
              .add(element.start_date, element.number_of_days, "days")
              .toISOString();
            return element;
          });
        }
      } catch (e) {
        setLoading(false);
      }
      return Promise.resolve(result);
    },
    []
  );

  const milestoneEvents = useMemo(
    () => events.filter((p) => p.type === EVENT_TYPE.MILESTONE),
    [events]
  );

  const getMilestoneEvents = useCallback(
    async (phaseId: number): Promise<EventsGridModel[]> => {
      let result: EventsGridModel[] = [];
      try {
        const milestoneResult = await eventService.getMilestoneEvents(phaseId);
        if (milestoneResult.status === 200) {
          result = (milestoneResult.data as any[]).map((element) => {
            element.type = EVENT_TYPE.MILESTONE;
            element.start_date =
              element.actual_date || element.anticipated_date;
            element.is_complete = !!element.actual_date;
            const actualToTodayDiff = Moment(element.start_date).diff(
              Moment(),
              "days"
            );
            element.status = element.is_complete
              ? EVENT_STATUS.COMPLETED
              : actualToTodayDiff <= 0
              ? EVENT_STATUS.INPROGRESS
              : EVENT_STATUS.NOT_STARTED;
            element.visibility = element.event_configuration.visibility;
            return element;
          });
        }
      } catch (e) {
        setLoading(false);
      }
      return Promise.resolve(result);
    },
    []
  );

  const getCombinedEvents = useCallback(() => {
    let result: EventsGridModel[] = [];
    const phaseId = selectedWorkPhase?.work_phase.id;

    if (work?.id && phaseId) {
      setLoading(true);
      Promise.all([getMilestoneEvents(phaseId), getTaskEvents(phaseId)]).then(
        (data: Array<EventsGridModel[]>) => {
          data.forEach((array: EventsGridModel[]) => {
            result = result.concat(array);
          });
          result = result.sort((eventX, eventY) => {
            // START milestone should be first, END milestone should be last
            if (
              eventX.event_configuration?.event_position ===
                EventPosition.START ||
              (eventY.event_configuration?.event_position ===
                EventPosition.END &&
                eventY.is_complete)
            ) {
              return -1;
            }
            if (
              eventY.event_configuration?.event_position ===
                EventPosition.START ||
              (eventX.event_configuration?.event_position ===
                EventPosition.END &&
                eventX.is_complete)
            ) {
              return 1;
            }
            // Next priorit is for dates, lower dates comes first
            const diff = Moment(eventX.start_date).diff(
              eventY.start_date,
              "days"
            );
            if (diff < 0) {
              return -1;
            }
            if (diff > 0) {
              return 1;
            }
            // Next if the dates are equal, then
            if (
              Moment(eventX.start_date).diff(eventY.start_date, "days") === 0
            ) {
              // If both events are MILESTONE, sort it based on the visibility
              if (
                eventX.type === EVENT_TYPE.MILESTONE &&
                eventY.type === EVENT_TYPE.MILESTONE
              ) {
                // If both events are either MANDATORY OR OPTIONAL, sort is based on its autogenerated datebase ids
                if (
                  (eventX.visibility === EventTemplateVisibility.MANDATORY &&
                    eventY.visibility === EventTemplateVisibility.MANDATORY) ||
                  (eventX.visibility === EventTemplateVisibility.OPTIONAL &&
                    eventY.visibility === EventTemplateVisibility.OPTIONAL)
                ) {
                  return eventX.id < eventY.id ? -1 : 1;
                }
                // MANDATORY should be shown first, then OPTIONAL
                if (
                  eventX.visibility === EventTemplateVisibility.MANDATORY ||
                  eventY.visibility === EventTemplateVisibility.OPTIONAL
                ) {
                  return -1;
                }
                if (
                  eventY.visibility === EventTemplateVisibility.MANDATORY ||
                  eventX.visibility === EventTemplateVisibility.OPTIONAL
                ) {
                  return 1;
                }
              }
              // If both events are either MILESTONE or TASK, sort is based on its autogenerated database ids
              if (
                (eventX.type === EVENT_TYPE.MILESTONE &&
                  eventY.type === EVENT_TYPE.MILESTONE) ||
                (eventX.type === EVENT_TYPE.TASK &&
                  eventY.type === EVENT_TYPE.TASK)
              ) {
                return naturalSortCollator.compare(eventX.name, eventY.name);
              }
              // MILESTONE should shows first, then TASK
              if (
                eventX.type === EVENT_TYPE.MILESTONE ||
                eventY.type === EVENT_TYPE.TASK
              ) {
                return -1;
              }
              if (
                eventY.type === EVENT_TYPE.MILESTONE ||
                eventX.type === EVENT_TYPE.TASK
              ) {
                return 1;
              }
            }
            return diff;
          });
          setEvents(result);
          setLoading(false);
        }
      );
    }
    setRowSelection({});
  }, [
    getMilestoneEvents,
    getTaskEvents,
    work?.id,
    selectedWorkPhase?.work_phase.id,
  ]);

  useEffect(() => {
    getCombinedEvents();
  }, [getCombinedEvents, work?.id, selectedWorkPhase?.work_phase.id]);

  const updateSelectedWorkPhaseState = useCallback(() => {
    if (work?.current_work_phase_id && workPhases.length > 0) {
      const selectedWp = workPhases.find(
        (p) => p.work_phase.id === work.current_work_phase_id
      );
      if (selectedWp) {
        setSelectedWorkPhase(selectedWp);
      }
    }
  }, [setSelectedWorkPhase, work?.current_work_phase_id, workPhases]);

  // update the selectedworkphase state in the context when the state of the work or workphases changes
  useEffect(() => {
    updateSelectedWorkPhaseState();
  }, [updateSelectedWorkPhaseState, workPhases, work?.current_work_phase_id]);

  const getWorkPhases = useCallback(async () => {
    if (work?.id) {
      setLoading(true);
      const workPhasesResult = await workService.getWorkPhases(
        String(work?.id)
      );
      const workPhases = workPhasesResult.data as WorkPhaseAdditionalInfo[];
      setWorkPhases(workPhases);
      setLoading(false);
    }
  }, [setWorkPhases, setLoading, work?.id]);

  const getWorkById = useCallback(async () => {
    if (work?.id) {
      const result = await workService.getById(String(work.id));
      const workResult = result.data as Work;
      setWork(workResult);
    }
  }, [setWork, work?.id]);

  const onSaveHandler = () => {
    setShowTaskForm(false);
    setShowTemplateForm(false);
    setShowMilestoneForm(false);
    getCombinedEvents();
    getWorkPhases().then(() => getWorkById());
    getTemplateUploadStatus();
    if (
      milestoneEvent?.event_configuration?.event_position === EventPosition.END
    ) {
      getWorkPhaseById();
    }
    setMilestoneEvent(undefined);
    setTaskEvent(undefined);
  };

  const onCancelHandler = () => {
    setShowTaskForm(false);
    setShowTemplateForm(false);
    setShowMilestoneForm(false);
    setMilestoneEvent(undefined);
    setTaskEvent(undefined);
  };

  const onTemplateFormSaveHandler = (templateId: number) => {
    setShowTemplateForm(false);
    setShowTemplateConfirmation(true);
    setSelectedTemplateId(templateId);
  };

  const onTemplateConfirmationSaveHandler = async () => {
    try {
      const result = await taskEventService.importTasksFromTemplate(
        {
          work_phase_id: selectedWorkPhase?.work_phase.id,
        },
        Number(selectedTemplateId)
      );
      if (result.status === 201) {
        showNotification("Task events uploaded", {
          type: "success",
        });
        setShowTemplateConfirmation(false);
        await getCombinedEvents();
        setSelectedTemplateId(undefined);
        getTemplateUploadStatus();
      }
    } catch (e) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
  };
  const handleExportToSheet = useCallback(async () => {
    try {
      const binaryReponse = await workService.downloadWorkplan(
        Number(selectedWorkPhase?.work_phase.id)
      );
      const url = window.URL.createObjectURL(
        new Blob([(binaryReponse as any).data])
      );
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${work?.project.name}_${work?.title}_${selectedWorkPhase?.work_phase.phase.name}`;
      link.setAttribute("download", `${fileName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      showNotification("File downloading completed", {
        type: "success",
      });
    } catch (error) {}
  }, [selectedWorkPhase, work?.project.name, work?.title]);

  const handleTaskFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedWorkPhase?.work_phase.id) {
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      await taskEventService.importTasks(selectedWorkPhase?.work_phase.id, {
        template_file: file,
      });
      showNotification("Tasks imported successfully", {
        type: "success",
      });
      getCombinedEvents();
    } catch (e) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
  };

  const onRowClick = async (event: any, row: EventsGridModel) => {
    event.preventDefault();
    dispatch(setLoadingState(true));
    if (row.type === EVENT_TYPE.MILESTONE) {
      await getMilestoneEvent(row.id);
      setShowMilestoneForm(row.type === EVENT_TYPE.MILESTONE);
    }
    if (row.type === EVENT_TYPE.TASK) {
      await getTaskEvent(row.id);
      setShowTaskForm(row.type === EVENT_TYPE.TASK);
    }
    dispatch(setLoadingState(false));
    setShowDeleteMilestoneButton(
      row.type === EVENT_TYPE.MILESTONE &&
        !(row.visibility === EventTemplateVisibility.MANDATORY)
    );
  };

  const onAddTask = () => {
    setShowTaskForm(true);
  };

  const onAddMilestone = () => {
    setShowMilestoneForm(true);
    setShowDeleteMilestoneButton(false);
  };

  const getMilestoneEvent = async (eventId: number) => {
    try {
      const result = await eventService.getById(eventId);
      if (result.status === 200) {
        const event = result.data as MilestoneEvent;
        setMilestoneEvent(event);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getTaskEvent = async (eventId: number) => {
    try {
      const result = await taskEventService.getById(Number(eventId));
      if (result.status === 200) {
        const assignee_ids: any[] = (result.data as any)["assignees"].map(
          (p: any) => p["assignee_id"]
        );
        const responsibility_ids: any[] = (result.data as any)[
          "responsibilities"
        ].map((p: any) => p["responsibility_id"]);
        const taskEvent = result.data as TaskEvent;
        taskEvent.assignee_ids = assignee_ids;
        taskEvent.responsibility_ids = responsibility_ids;
        setTaskEvent(taskEvent);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getTemplateUploadStatus = useCallback(async () => {
    if (work && selectedWorkPhase) {
      if (notificationId.current !== null) {
        closeSnackbar(notificationId.current);
        notificationId.current = null;
      }
      const response = await workService.checkTemplateUploadStatus(
        Number(selectedWorkPhase.work_phase.id)
      );
      const templateUploadStatus: TemplateStatus =
        response.data as TemplateStatus;
      setTemplateAvailable(templateUploadStatus);
      if (
        templateUploadStatus.template_available &&
        !templateUploadStatus.task_added
      ) {
        const notification = showNotification("Task Templates are available!", {
          type: "info",
          duration: null,
          message: (
            <Typography>
              Do you want to preview available Templates for{" "}
              <Typography style={{ fontWeight: "bold" }} component="span">
                {selectedWorkPhase.work_phase.phase.name}
              </Typography>{" "}
              with lists of tasks?
            </Typography>
          ),
          actions: [
            {
              label: "Preview Templates",
              color: "primary",
              callback: () => setShowTemplateForm(true),
            },
          ],
          key: `template-available-${selectedWorkPhase.work_phase.name}`,
        });
        notificationId.current = notification;
      }
    }
  }, [selectedWorkPhase, work]);

  const getWorkPhaseById = useCallback(async () => {
    const workPhaseId = selectedWorkPhase?.work_phase.id;
    const isCompleted = selectedWorkPhase?.work_phase.is_completed;
    if (workPhaseId) {
      try {
        const workPhase = (await workService.getWorkPhaseById(
          Number(workPhaseId)
        )) as WorkPhase;

        if (workPhase?.is_completed && !isCompleted) {
          dispatch(showConfetti(true));
        }
      } catch (error) {
        console.error(
          `Error fetching work phase with ID: ${workPhaseId}`,
          error
        );
      }
    }
  }, [dispatch, selectedWorkPhase]);

  useEffect(() => {
    getTemplateUploadStatus();
  }, [getTemplateUploadStatus, selectedWorkPhase]);

  const getResponsibilities = async (): Promise<ListType[]> => {
    const result: ListType[] = [];
    try {
      const responsibilities =
        await responsibilityService.getResponsibilities();
      if (responsibilities.status === 200) {
        const result = (responsibilities.data as ListType[]).map((element) => ({
          value: element.id.toString(),
          label: element.name,
        }));
        setResponsibilities(result);
      }
    } catch (e) {
      setLoading(false);
    }
    return Promise.resolve(result);
  };

  useEffect(() => {
    getResponsibilities();

    return () => {
      if (notificationId.current !== null) {
        closeSnackbar(notificationId.current);
        notificationId.current = null;
        setSelectedWorkPhase(undefined);
        setTemplateAvailable(undefined);
      }
    };
  }, [setSelectedWorkPhase]);

  const assignTasks = useCallback(
    async (assignee_ids: any) => {
      assignee_ids = assignee_ids.filter(
        (assignee_id: string) => assignee_id !== "<SELECT_ALL>"
      );
      const data = {
        task_ids: Object.keys(rowSelection),
        assignee_ids,
        work_id: work?.id,
      };
      const result = await taskEventService.patchTasks(data);
      try {
        if (result.status === 200) {
          showNotification("Tasks assigned", {
            type: "success",
          });
          getCombinedEvents();

          const highlightedRows = Object.keys(rowSelection).map((id) => ({
            type: EVENT_TYPE.TASK,
            id: Number(id),
          }));
          handleHighlightRows(highlightedRows);
        }
      } catch (e) {
        const message = getErrorMessage(e);
        showNotification(message, {
          type: "error",
        });
      }
    },
    [getCombinedEvents, handleHighlightRows, rowSelection, work?.id]
  );

  const assignResponsibility = useCallback(
    async (responsibility_ids: any) => {
      responsibility_ids = responsibility_ids.filter(
        (responsibility_id: string) => responsibility_id !== "<SELECT_ALL>"
      );
      const data = {
        task_ids: Object.keys(rowSelection),
        responsibility_ids,
        work_id: work?.id,
      };
      const result = await taskEventService.patchTasks(data);
      try {
        if (result.status === 200) {
          showNotification("Responsible entities updated", {
            type: "success",
          });
          getCombinedEvents();

          const highlightedRows = Object.keys(rowSelection).map((id) => ({
            type: EVENT_TYPE.TASK,
            id: Number(id),
          }));
          handleHighlightRows(highlightedRows);
        }
      } catch (e) {
        const message = getErrorMessage(e);
        showNotification(message, {
          type: "error",
        });
      }
    },
    [getCombinedEvents, handleHighlightRows, rowSelection, work?.id]
  );

  const assignProgress = useCallback(
    async (status: any) => {
      const data = {
        task_ids: Object.keys(rowSelection),
        status,
        work_id: work?.id,
      };
      const result = await taskEventService.patchTasks(data);
      try {
        if (result.status === 200) {
          showNotification("Progress updated", {
            type: "success",
          });
          getCombinedEvents();

          const highlightedRows = Object.keys(rowSelection).map((id) => ({
            type: EVENT_TYPE.TASK,
            id: Number(id),
          }));
          handleHighlightRows(highlightedRows);
        }
      } catch (e) {
        const message = getErrorMessage(e);
        showNotification(message, {
          type: "error",
        });
      }
    },
    [getCombinedEvents, handleHighlightRows, rowSelection, work?.id]
  );

  const deleteTasks = async () => {
    const data = {
      task_ids: Object.keys(rowSelection).join(","),
      work_id: work?.id,
    };
    const response = await taskEventService.deleteTasks(data);
    try {
      if (response.status === 200) {
        showNotification("Deleted successfully", {
          type: "success",
        });
        getCombinedEvents();
      }
    } catch (e) {}
  };

  const deleteMilestone = async () => {
    const response = await eventService.deleteMilestone(milestoneEvent?.id);
    try {
      if (response.status === 200) {
        showNotification("Deleted successfully", {
          type: "success",
        });
        setShowDeleteDialog(false);
        getCombinedEvents();
        onSaveHandler();
      }
    } catch (e) {}
  };

  const handleDelete = () => {
    if (milestoneEvent === undefined) {
      deleteTasks();
    } else {
      deleteMilestone();
    }
    setShowDeleteDialog(false);
  };
  const deleteAction = (
    <>
      {showDeleteMilestoneButton && (
        <Box
          sx={{
            display: "flex",
            minWidth: "327px",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            gap: "8px",
            flexGrow: 1,
          }}
        >
          <Button
            variant="text"
            startIcon={<DeleteIcon fill="currentcolor" />}
            sx={{
              border: `2px solid ${Palette.white}`,
            }}
            disabled={isEventFormFieldLocked}
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </Box>
      )}
    </>
  );

  return (
    <Grid container rowSpacing={1}>
      <Grid item xs={12}>
        <EventListTable
          loading={loading}
          events={events}
          onRowClick={onRowClick}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          templateAvailable={templateAvailable}
          userIsActiveTeamMember={userIsActiveTeamMember}
          handleExportToSheet={handleExportToSheet}
          onAddTask={onAddTask}
          onAddMilestone={onAddMilestone}
          handleTaskFileUpload={handleTaskFileUpload}
          setShowTemplateForm={setShowTemplateForm}
          setShowDeleteDialog={setShowDeleteDialog}
        />
      </Grid>
      <Grid container>
        <When
          condition={
            Number(selectedWorkPhase?.days_left) < 0 && showExtensionWarningBox
          }
        >
          <WarningBox
            onCloseHandler={() => setOpenExtensionWarningBox(false)}
            title="The time limit for this Phase has been exceeded"
            isTitleBold={true}
          />
        </When>
        <When
          condition={
            selectedWorkPhase?.work_phase.is_suspended &&
            showSuspendedWarningBox
          }
        >
          <WarningBox
            onCloseHandler={() => setShowSuspendedWarningBox(false)}
            title="The Work is suspended"
            isTitleBold={true}
            subTitle="You will need to add a Resumption Milestone to resume this Work"
          />
        </When>
      </Grid>
      <Grid container item columnSpacing={2}>
        <Grid
          item
          xs={8}
          sx={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
            fontSize: ".875rem",
          }}
        >
          {Object.keys(rowSelection).length > 0 && (
            <>
              <Typography color={Palette.primary.accent.main}>
                {Object.keys(rowSelection).length} selected
              </Typography>
              <Divider
                variant="middle"
                flexItem
                orientation="vertical"
                sx={{ borderColor: Palette.neutral[300] }}
              />
              <FilterSelect
                options={staffSelectOptions}
                isMulti
                variant="bar"
                placeholder="Assign To"
                filterAppliedCallback={assignTasks}
                name="assignTo"
                info={true}
              />
              <FilterSelect
                options={responsibilities}
                variant="bar"
                placeholder="Responsibility"
                filterAppliedCallback={assignResponsibility}
                name="responsibility"
                isMulti
                info={true}
              />
              <FilterSelect
                options={statusOptions}
                variant="bar"
                placeholder="Progress"
                filterAppliedCallback={assignProgress}
                name="progress"
                info={true}
              />
              <Button
                variant="text"
                startIcon={<DeleteIcon fill="currentcolor" />}
                sx={{
                  color: Palette.primary.accent.main,
                  border: "none",
                  "&:hover": {
                    backgroundColor: Palette.neutral.bg.main,
                  },
                }}
                onClick={() => setShowDeleteDialog(true)}
                color="primary"
              >
                Delete
              </Button>
            </>
          )}
        </Grid>
        <Grid
          item
          xs
          sx={{
            display: "flex",
            justifyContent: "right",
            gap: "0.5rem",
          }}
        >
          {templateAvailable?.template_available && (
            <Tooltip
              title={
                templateAvailable.task_added
                  ? "You've already used the template"
                  : "Import tasks from template"
              }
            >
              <IButton
                onClick={() => setShowTemplateForm(true)}
                disabled={templateAvailable?.task_added}
              >
                <ImportFileIcon className="icon" />
              </IButton>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      <TrackDialog
        open={showTaskForm}
        dialogTitle={taskEvent ? taskEvent?.name : "Add Task"}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
        okButtonText="Save"
        cancelButtonText="Cancel"
        isActionsRequired
        onCancel={() => onCancelHandler()}
        formId="task-form"
      >
        <TaskForm onSave={onSaveHandler} taskEvent={taskEvent} />
      </TrackDialog>
      <TrackDialog
        open={showMilestoneForm}
        dialogTitle={milestoneEvent ? milestoneEvent.name : "Add Milestone"}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
        okButtonText="Save"
        cancelButtonText="Cancel"
        isActionsRequired
        onCancel={() => onCancelHandler()}
        formId="event-form"
        additionalActions={deleteAction}
      >
        <EventForm
          onSave={onSaveHandler}
          event={milestoneEvent}
          milestoneEvents={milestoneEvents}
          isFormFieldsLocked={isEventFormFieldLocked}
        />
      </TrackDialog>
      <TrackDialog
        open={showTemplateForm}
        dialogTitle="Task Template"
        disableEscapeKeyDown
        fullWidth
        maxWidth="lg"
        okButtonText="Get Template"
        formId="import-tasks-form"
        isCancelRequired={false}
        onCancel={() => onCancelHandler()}
        isActionsRequired
      >
        <ImportTaskEvent onSave={onTemplateFormSaveHandler} />
      </TrackDialog>
      <TrackDialog
        open={showTemplateConfirmation}
        dialogTitle="Upload this Template?"
        dialogContentText="Once the selected template is uploaded, all other templates will be locked for this phase"
        disableEscapeKeyDown
        fullWidth
        okButtonText="Upload"
        onOk={onTemplateConfirmationSaveHandler}
        onCancel={() => {
          setShowTemplateForm(true);
          setShowTemplateConfirmation(false);
          setSelectedTemplateId(undefined);
        }}
        isActionsRequired
      />
      <TrackDialog
        open={showDeleteDialog}
        dialogTitle="Delete"
        dialogContentText="Are you sure you want to delete this?"
        okButtonText="Yes"
        cancelButtonText="No"
        isActionsRequired
        onCancel={() => setShowDeleteDialog(!showDeleteDialog)}
        onOk={() => handleDelete()}
      />
    </Grid>
  );
};

export default EventList;
