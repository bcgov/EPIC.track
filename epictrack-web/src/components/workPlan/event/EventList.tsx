import React, { useContext, useEffect, useMemo, useCallback } from "react";
import { EVENT_TYPE } from "../phase/type";
import eventService from "../../../services/eventService/eventService";
import Icons from "../../icons";
import {
  EventPosition,
  EventTemplateVisibility,
  EventsGridModel,
  MilestoneEvent,
} from "../../../models/event";
import Moment from "moment";
import { WorkplanContext } from "../WorkPlanContext";
import { MRT_RowSelectionState } from "material-react-table";
import { dateUtils, naturalSortCollator } from "../../../utils";
import { Box, Button, Divider, Grid, Tooltip, Typography } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { IconProps } from "../../icons/type";
import workService from "../../../services/workService/workService";
import TrackDialog from "../../shared/TrackDialog";
import TaskForm from "../task/TaskForm";
import {
  EVENT_STATUS,
  TaskEvent,
  statusOptions,
} from "../../../models/taskEvent";
import taskEventService from "../../../services/taskEventService/taskEventService";
import { showNotification } from "../../shared/notificationProvider";
import ImportTaskEvent from "../task/ImportTaskEvent";
import {
  TemplateStatus,
  Work,
  WorkPhase,
  WorkPhaseAdditionalInfo,
} from "../../../models/work";
import { SnackbarKey, closeSnackbar } from "notistack";
import { OptionType } from "../../shared/filterSelect/type";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { ListType } from "../../../models/code";
import responsibilityService from "../../../services/responsibilityService/responsibilityService";
import EventListTable from "./EventListTable";
import EventForm from "./EventForm";
import { EventContext } from "./EventContext";
import { When } from "react-if";
import WarningBox from "../../shared/warningBox";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { setLoadingState } from "../../../services/loadingService";
import { getErrorMessage } from "../../../utils/axiosUtils";
import {
  COMMON_ERROR_MESSAGE,
  ROLES,
} from "../../../constants/application-constant";
import { Restricted } from "components/shared/restricted";
import { IButton } from "components/shared";
import { showConfetti } from "styles/uiStateSlice";

const ImportFileIcon: React.FC<IconProps> = Icons["ImportFileIcon"];
const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];
const DeleteIcon: React.FC<IconProps> = Icons["DeleteIcon"];

const EventList = () => {
  const dispatch = useAppDispatch();
  const [events, setEvents] = React.useState<EventsGridModel[]>([]);
  const [milestoneEvent, setMilestoneEvent] = React.useState<MilestoneEvent>();
  const [taskEvent, setTaskEvent] = React.useState<TaskEvent>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showTaskForm, setShowTaskForm] = React.useState<boolean>(false);
  const [showMilestoneForm, setShowMilestoneForm] =
    React.useState<boolean>(false);
  const [showTemplateConfirmation, setShowTemplateConfirmation] =
    React.useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<number>();
  const [showTemplateForm, setShowTemplateForm] =
    React.useState<boolean>(false);

  const {
    selectedWorkPhase,
    setSelectedWorkPhase,
    setWorkPhases,
    workPhases,
    team,
    work,
    setWork,
  } = useContext(WorkplanContext);
  const { email } = useAppSelector((state) => state.user.userDetail);
  const userIsActiveTeamMember = useMemo(
    () =>
      team.some((member) => member.staff.email === email && member.is_active),
    [team, email]
  );
  const isConfettiShown = useAppSelector((state) => state.uiState.showConfetti);
  const { handleHighlightRows } = useContext(EventContext);
  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );
  const notificationId = React.useRef<SnackbarKey | null>(null);
  const [templateAvailable, setTemplateAvailable] =
    React.useState<TemplateStatus>();

  const [staffSelectOptions, setStaffSelectOptions] = React.useState<
    OptionType[]
  >([]);

  const [responsibilities, setResponsibilities] = React.useState<OptionType[]>(
    []
  );

  const [showDeleteMilestoneButton, setShowDeleteMilestoneButton] =
    React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const [openExtensionWarningBox, setOpenExtensionWarningBox] =
    React.useState(true);
  const [showSuspendedWarningBox, setShowSuspendedWarningBox] =
    React.useState(true);

  const showExtensionWarningBox = useMemo(
    () =>
      Number(selectedWorkPhase?.days_left) < 0 &&
      selectedWorkPhase?.work_phase.legislated &&
      openExtensionWarningBox,
    [selectedWorkPhase, openExtensionWarningBox]
  );

  const isEventFormFieldLocked = React.useMemo(() => {
    return !!milestoneEvent?.actual_date;
  }, [milestoneEvent]);

  React.useEffect(() => setEvents([]), [selectedWorkPhase?.work_phase.id]);
  React.useEffect(() => {
    setTimeout(() => {
      dispatch(showConfetti(false));
    }, 5000);
  }, [isConfettiShown]);

  React.useEffect(() => {
    getCombinedEvents();
  }, [work?.id, selectedWorkPhase?.work_phase.id]);

  React.useEffect(() => {
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

  const getCombinedEvents = React.useCallback(() => {
    let result: EventsGridModel[] = [];
    if (work?.id && selectedWorkPhase?.work_phase.id) {
      setLoading(true);
      Promise.all([getMilestoneEvents(), getTaskEvents()]).then(
        (data: Array<EventsGridModel[]>) => {
          setLoading(false);
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
              Moment(eventX.start_date).diff(eventY.start_date, "days") == 0
            ) {
              // If both events are MILESTONE, sort it based on the visibility
              if (
                eventX.type === EVENT_TYPE.MILESTONE &&
                eventY.type === EVENT_TYPE.MILESTONE
              ) {
                // If both events are either MANDATORY OR OPTIONAL, sort is based on its autogenerated datebase ids
                if (
                  (eventX.visibility == EventTemplateVisibility.MANDATORY &&
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
        }
      );
    }
    setRowSelection({});
  }, [work, selectedWorkPhase?.work_phase.id]);

  const getTaskEvents = async (): Promise<EventsGridModel[]> => {
    let result: EventsGridModel[] = [];
    try {
      const taskResult = await taskEventService.getAll(
        Number(selectedWorkPhase?.work_phase.id)
      );

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
  };
  const milestoneEvents = useMemo(
    () => events.filter((p) => p.type === EVENT_TYPE.MILESTONE),
    [events]
  );
  const getMilestoneEvents = async (): Promise<EventsGridModel[]> => {
    let result: EventsGridModel[] = [];
    try {
      const milestoneResult = await eventService.getMilestoneEvents(
        Number(selectedWorkPhase?.work_phase.id)
      );
      if (milestoneResult.status === 200) {
        result = (milestoneResult.data as any[]).map((element) => {
          element.type = EVENT_TYPE.MILESTONE;
          element.start_date = element.actual_date || element.anticipated_date;
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
  };

  // update the selectedworkphase state in the context when the state of the work or workphases changes
  useEffect(() => {
    updateSelectedWorkPhaseState();
  }, [workPhases, work]);

  const updateSelectedWorkPhaseState = useCallback(() => {
    if (selectedWorkPhase) {
      const selectedWp = workPhases.filter(
        (p) => p.work_phase.id === work?.current_work_phase_id
      )[0];
      setSelectedWorkPhase(selectedWp);
    }
  }, [work, workPhases]);
  const getWorkPhases = React.useCallback(async () => {
    if (work?.id) {
      setLoading(true);
      const workPhasesResult = await workService.getWorkPhases(
        String(work?.id)
      );
      const workPhases = workPhasesResult.data as WorkPhaseAdditionalInfo[];
      setWorkPhases(workPhases);
      setLoading(false);
    }
  }, []);

  const getWorkById = React.useCallback(async () => {
    if (work?.id) {
      const result = await workService.getById(String(work.id));
      const workResult = result.data as Work;
      setWork(workResult);
    }
  }, [workPhases]);

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
  const handleExportToSheet = React.useCallback(async () => {
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
  }, [work?.id, selectedWorkPhase?.work_phase.phase.id]);

  const handleTaskFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const getTemplateUploadStatus = React.useCallback(async () => {
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
  }, [selectedWorkPhase?.work_phase.phase.id]);

  const getWorkPhaseById = React.useCallback(async () => {
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
  }, [selectedWorkPhase?.work_phase.id]);

  React.useEffect(() => {
    getTemplateUploadStatus();
  }, [selectedWorkPhase]);

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

  React.useEffect(() => {
    getResponsibilities();

    return () => {
      if (notificationId.current !== null) {
        closeSnackbar(notificationId.current);
        notificationId.current = null;
        setSelectedWorkPhase(undefined);
        setTemplateAvailable(undefined);
      }
    };
  }, []);

  const assignTasks = React.useCallback(
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
    [rowSelection]
  );

  const assignResponsibility = React.useCallback(
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
    [rowSelection]
  );

  const assignProgress = React.useCallback(
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
    [rowSelection]
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
        <Grid item xs="auto">
          <Restricted
            allowed={[ROLES.CREATE]}
            errorProps={{ disabled: true }}
            exception={userIsActiveTeamMember}
          >
            <Button variant="contained" onClick={() => setShowTaskForm(true)}>
              Add Task
            </Button>
          </Restricted>
        </Grid>
        <Grid item xs="auto">
          <Restricted
            allowed={[ROLES.CREATE]}
            errorProps={{ disabled: true }}
            exception={userIsActiveTeamMember}
          >
            <Button variant="outlined" onClick={onAddMilestone}>
              Add Milestone
            </Button>
          </Restricted>
        </Grid>
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
          <Tooltip title="Export workplan to excel">
            <Restricted
              allowed={[ROLES.EDIT]}
              errorProps={{ disabled: true }}
              exception={userIsActiveTeamMember}
            >
              <IButton onClick={handleExportToSheet}>
                <DownloadIcon className="icon" />
              </IButton>
            </Restricted>
          </Tooltip>
          <Restricted
            allowed={[ROLES.EXTENDED_EDIT]}
            exception={userIsActiveTeamMember}
          >
            <Tooltip title="Import tasks from an excel sheet">
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImportFileIcon />}
              >
                Import from excel
                <input
                  type="file"
                  hidden
                  accept=".xls, .xlsx"
                  onChange={handleTaskFileUpload}
                />
              </Button>
            </Tooltip>
          </Restricted>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <EventListTable
          loading={loading}
          events={events}
          onRowClick={onRowClick}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
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
