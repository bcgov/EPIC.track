import React, { useContext } from "react";
import { EVENT_TYPE } from "../phase/type";
import MasterTrackTable from "../../shared/MasterTrackTable";
import eventService from "../../../services/eventService/eventService";
import Icons from "../../icons";
import { EventsGridModel, MilestoneEvent } from "../../../models/event";
import Moment from "moment";
import { WorkplanContext } from "../WorkPlanContext";
import {
  MRT_ColumnDef,
  MRT_Row,
  MRT_RowSelectionState,
} from "material-react-table";
import { ETGridTitle, ETParagraph } from "../../shared";
import { dateUtils } from "../../../utils";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { Palette } from "../../../styles/theme";
import { IconProps } from "../../icons/type";
import workService from "../../../services/workService/workService";
import { makeStyles } from "@mui/styles";
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
import { getAxiosError } from "../../../utils/axiosUtils";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import {
  CompletedIcon,
  InProgressIcon,
  NotStartedIcon,
} from "../../icons/status";
import EventForm from "./EventForm";
import { getTextFromDraftJsContentState } from "../../shared/richTextEditor/utils";
import { TemplateStatus, WorkPhase } from "../../../models/work";
import { SnackbarKey, closeSnackbar } from "notistack";
import { OptionType } from "../../shared/filterSelect/type";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { ListType } from "../../../models/code";
import responsibilityService from "../../../services/responsibilityService/responsibilityService";

const ImportFileIcon: React.FC<IconProps> = Icons["ImportFileIcon"];
const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];
const LockIcon: React.FC<IconProps> = Icons["LockIcon"];
const DeleteIcon: React.FC<IconProps> = Icons["DeleteIcon"];

const useStyle = makeStyles({
  textEllipsis: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  deleteIcon: {
    fill: "currentcolor",
  },
});
const IButton = styled(IconButton)({
  "& .icon": {
    fill: Palette.primary.accent.main,
  },
  "&:hover": {
    backgroundColor: Palette.neutral.bg.main,
    borderRadius: "4px",
  },
  "&.Mui-disabled": {
    pointerEvents: "auto",
    "& .icon": {
      fill: Palette.neutral.light,
    },
  },
});

const EventList = () => {
  const [events, setEvents] = React.useState<EventsGridModel[]>([]);
  const [milestoneEvent, setMilestoneEvent] = React.useState<MilestoneEvent>();
  const [taskEvent, setTaskEvent] = React.useState<TaskEvent>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showTaskForm, setShowTaskForm] = React.useState<boolean>(false);
  const [showMilestoneForm, setShowMilestoneForm] =
    React.useState<boolean>(false);
  // const [eventId, setEventId] = React.useState<number | undefined>();
  const [showTemplateConfirmation, setShowTemplateConfirmation] =
    React.useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<number>();
  const [showTemplateForm, setShowTemplateForm] =
    React.useState<boolean>(false);
  const ctx = useContext(WorkplanContext);
  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );
  const classes = useStyle();
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

  React.useEffect(() => setEvents([]), [ctx.selectedWorkPhase?.phase.id]);
  React.useEffect(() => {
    getCombinedEvents();
  }, [ctx.work?.id, ctx.selectedWorkPhase?.phase.id]);

  React.useEffect(() => {
    const options: OptionType[] = ctx.team
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
  }, [ctx.team]);

  const getCombinedEvents = React.useCallback(() => {
    let result: EventsGridModel[] = [];
    if (ctx.work?.id && ctx.selectedWorkPhase?.phase.id) {
      setLoading(true);
      Promise.all([getMilestoneEvents(), getTaskEvents()]).then(
        (data: Array<EventsGridModel[]>) => {
          setLoading(false);
          data.forEach((array: EventsGridModel[]) => {
            result = result.concat(array);
          });
          result = result.sort((a, b) =>
            Moment(a.start_date).diff(b.start_date, "seconds")
          );
          setEvents(result);
        }
      );
    }
    setRowSelection({});
  }, [ctx.work, ctx.selectedWorkPhase?.id]);
  const getTaskEvents = async (): Promise<EventsGridModel[]> => {
    let result: EventsGridModel[] = [];
    try {
      const taskResult = await taskEventService.getAll(
        Number(ctx.selectedWorkPhase?.id)
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
  const getMilestoneEvents = async (): Promise<EventsGridModel[]> => {
    let result: EventsGridModel[] = [];
    try {
      const milestoneResult = await eventService.GetMilestoneEvents(
        Number(ctx.selectedWorkPhase?.id)
      );
      if (milestoneResult.status === 200) {
        result = (milestoneResult.data as any[]).map((element) => {
          element.type = EVENT_TYPE.MILESTONE;
          element.status = element.is_complete
            ? EVENT_STATUS.COMPLETED
            : EVENT_STATUS.NOT_STARTED;
          element.start_date = element.actual_date || element.anticipated_date;
          element.is_complete = !!element.actual_date;
          element.mandatory = element.event_configuration.mandatory;
          return element;
        });
      }
    } catch (e) {
      setLoading(false);
    }
    return Promise.resolve(result);
  };

  const getWorkPhases = React.useCallback(async () => {
    if (ctx.work?.id) {
      setLoading(true);
      const workPhasesResult = await workService.getWorkPhases(
        String(ctx.work?.id)
      );
      ctx.setWorkPhases(workPhasesResult.data as WorkPhase[]);
      setLoading(false);
    }
  }, []);

  const onDialogClose = React.useCallback(() => {
    setShowTaskForm(false);
    setShowTemplateForm(false);
    setShowMilestoneForm(false);
    getCombinedEvents();
    getTemplateUploadStatus();
    getWorkPhases();
    setTaskEvent(undefined);
    setMilestoneEvent(undefined);
  }, [ctx.work, ctx.selectedWorkPhase]);

  const onTemplateFormSaveHandler = (templateId: number) => {
    setShowTemplateForm(false);
    setShowTemplateConfirmation(true);
    setSelectedTemplateId(templateId);
  };

  const onTemplateConfirmationSaveHandler = async () => {
    try {
      const result = await taskEventService.importTasksFromTemplate(
        {
          work_phase_id: ctx.selectedWorkPhase?.id,
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
      const error = getAxiosError(e);
      const message =
        error?.response?.status === 422
          ? error.response.data?.toString()
          : COMMON_ERROR_MESSAGE;
      showNotification(message, {
        type: "error",
      });
    }
  };
  const downloadPDFReport = React.useCallback(async () => {
    try {
      const binaryReponse = await workService.downloadWorkplan(
        Number(ctx.selectedWorkPhase?.id)
      );
      const url = window.URL.createObjectURL(
        new Blob([(binaryReponse as any).data])
      );
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${ctx.work?.project.name}_${ctx.work?.title}_${ctx.selectedWorkPhase?.phase.name}`;
      link.setAttribute("download", `${fileName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      showNotification("File downloading completed", {
        type: "success",
      });
    } catch (error) {}
  }, [ctx.work?.id, ctx.selectedWorkPhase?.phase.id]);

  const columns = React.useMemo<MRT_ColumnDef<EventsGridModel>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Task / Milestone",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        size: 300,
        enableSorting: false,
        Cell: ({ cell, row, renderedCellValue }) => (
          <ETGridTitle
            to="#"
            bold={row.original.type === EVENT_TYPE.MILESTONE}
            enableEllipsis
            onClick={(event: any) => onRowClick(event, row.original)}
            enableTooltip={true}
            tooltip={cell.getValue<string>()}
          >
            {renderedCellValue}
          </ETGridTitle>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 100,
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <ETParagraph bold={row.original.type === EVENT_TYPE.MILESTONE}>
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        size: 140,
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <ETParagraph
            bold={row.original.type === EVENT_TYPE.MILESTONE}
            className={classes.textEllipsis}
          >
            {dateUtils.formatDate(cell.getValue<string>(), "MMM.DD YYYY")}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "end_date",
        accessorFn: (row: EventsGridModel) => {
          if (row.end_date) {
            return dateUtils.formatDate(row.end_date, "MMM.DD YYYY");
          }
          return "";
        },
        size: 140,
        header: "End Date",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <ETParagraph
            bold={row.original.type === EVENT_TYPE.MILESTONE}
            className={classes.textEllipsis}
          >
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "number_of_days",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        size: 100,
        header: "Days",
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <ETParagraph bold={row.original.type === EVENT_TYPE.MILESTONE}>
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorFn: (row: EventsGridModel) =>
          row.assignees
            ?.map((p) => `${p.assignee.first_name} ${p.assignee.last_name}`)
            .join(", "),
        header: "Assigned",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        size: 140,
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <ETParagraph
            bold={row.original.type === EVENT_TYPE.MILESTONE}
            enableEllipsis
            enableTooltip
            tooltip={cell.getValue<string>()}
          >
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "responsibility",
        header: "Responsibility",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        size: 140,
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <ETParagraph
            bold={row.original.type === EVENT_TYPE.MILESTONE}
            enableEllipsis
            enableTooltip
            tooltip={cell.getValue<string>()}
          >
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "notes",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        header: "Notes",
        size: 250,
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <ETParagraph bold={row.original.type === EVENT_TYPE.MILESTONE}>
            {getTextFromDraftJsContentState(cell.getValue<string>())}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "status",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        header: "Progress",
        size: 150,
        enableSorting: false,
        Cell: ({ cell, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {cell.getValue<EVENT_STATUS>() === EVENT_STATUS.NOT_STARTED && (
              <NotStartedIcon fill={Palette.neutral.light} />
            )}
            {cell.getValue<EVENT_STATUS>() === EVENT_STATUS.INPROGRESS && (
              <InProgressIcon fill={Palette.success.light} />
            )}
            {cell.getValue<EVENT_STATUS>() === EVENT_STATUS.COMPLETED && (
              <CompletedIcon fill={Palette.neutral.accent.light} />
            )}
            <ETParagraph bold={row.original.type === EVENT_TYPE.MILESTONE}>
              {
                statusOptions.filter(
                  (p) => p.value == cell.getValue<EVENT_STATUS>()
                )[0]?.label
              }
            </ETParagraph>
          </Box>
        ),
      },
    ],
    [events]
  );
  const onRowClick = (event: any, row: EventsGridModel) => {
    event.preventDefault();
    // setEventId(row.id);
    if (row.type === EVENT_TYPE.MILESTONE) {
      getMilestoneEvent(row.id);
      setShowMilestoneForm(row.type === EVENT_TYPE.MILESTONE);
    }
    if (row.type === EVENT_TYPE.TASK) {
      getTaskEvent(row.id);
      setShowTaskForm(row.type === EVENT_TYPE.TASK);
    }
    setShowDeleteMilestoneButton(
      row.type === EVENT_TYPE.MILESTONE && !row.mandatory
    );
  };
  const onCancelHandler = () => {
    setShowTaskForm(false);
    setShowTemplateForm(false);
    setShowMilestoneForm(false);
    // setEventId(undefined);
    setMilestoneEvent(undefined);
    setTaskEvent(undefined);
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
    if (ctx.work && ctx.selectedWorkPhase) {
      if (notificationId.current !== null) {
        closeSnackbar(notificationId.current);
        notificationId.current = null;
      }
      const response = await workService.checkTemplateUploadStatus(
        Number(ctx.selectedWorkPhase.id)
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
                {ctx.selectedWorkPhase.phase.name}
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
          key: `template-available-${ctx.selectedWorkPhase.phase.name}`,
        });
        notificationId.current = notification;
      }
    }
  }, [ctx.selectedWorkPhase?.phase.id]);

  React.useEffect(() => {
    getTemplateUploadStatus();
  }, [ctx.selectedWorkPhase]);

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
        ctx.setSelectedWorkPhase(undefined);
        setTemplateAvailable(undefined);
      }
    };
  }, []);

  const assignTasks = React.useCallback(
    async (assignee_ids: any) => {
      assignee_ids = assignee_ids.filter(
        (assignee_id: string) => assignee_id !== "<SELECT_ALL>"
      );
      const data = { task_ids: Object.keys(rowSelection), assignee_ids };
      const result = await taskEventService.patchTasks(data);
      try {
        if (result.status === 200) {
          showNotification("Tasks assigned", {
            type: "success",
          });
          getCombinedEvents();
        }
      } catch (e) {
        const error = getAxiosError(e);
        const message =
          error?.response?.status === 422
            ? error.response.data?.toString()
            : COMMON_ERROR_MESSAGE;
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
      };
      const result = await taskEventService.patchTasks(data);
      try {
        if (result.status === 200) {
          showNotification("Responsible entities updated", {
            type: "success",
          });
          getCombinedEvents();
        }
      } catch (e) {
        const error = getAxiosError(e);
        const message =
          error?.response?.status === 422
            ? error.response.data?.toString()
            : COMMON_ERROR_MESSAGE;
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
      };
      console.log(`Update progress to ${JSON.stringify(data)}`);
      const result = await taskEventService.patchTasks(data);
      try {
        if (result.status === 200) {
          showNotification("Progress updated", {
            type: "success",
          });
          getCombinedEvents();
        }
      } catch (e) {
        const error = getAxiosError(e);
        const message =
          error?.response?.status === 422
            ? error.response.data?.toString()
            : COMMON_ERROR_MESSAGE;
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
        onDialogClose();
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
  console.log("EVENTS", events);
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
            startIcon={<DeleteIcon className={classes.deleteIcon} />}
            sx={{
              border: `2px solid ${Palette.white}`,
            }}
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
      <Grid container item columnSpacing={2}>
        <Grid item xs="auto">
          <Button variant="contained" onClick={() => setShowTaskForm(true)}>
            Add Task
          </Button>
        </Grid>
        <Grid item xs="auto">
          <Button variant="outlined" onClick={() => setShowMilestoneForm(true)}>
            Add Milestone
          </Button>
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
                startIcon={<DeleteIcon className={classes.deleteIcon} />}
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
            <IButton onClick={downloadPDFReport}>
              <DownloadIcon className="icon" />
            </IButton>
          </Tooltip>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <MasterTrackTable
          enableRowSelection={(row) => row.original.type !== "Milestone"}
          enableSelectAll
          enablePagination
          muiSelectCheckboxProps={({ row, table }) => ({
            indeterminateIcon: <LockIcon />,
            disabled:
              !row.original.is_complete &&
              row.original.type === EVENT_TYPE.MILESTONE,
            indeterminate:
              row.original.is_complete &&
              row.original.type === EVENT_TYPE.MILESTONE,
          })}
          columns={columns}
          data={events}
          enableTopToolbar={false}
          state={{
            isLoading: loading,
            showGlobalFilter: true,
            rowSelection,
          }}
          onRowSelectionChange={setRowSelection}
          getRowId={(
            originalRow: EventsGridModel,
            index: number,
            parent?: MRT_Row<EventsGridModel>
          ) => {
            return originalRow.type === EVENT_TYPE.MILESTONE
              ? `milestone_${originalRow.id}`
              : originalRow.id?.toString();
          }}
        />
      </Grid>
      <TrackDialog
        open={showTaskForm}
        dialogTitle="Add Task"
        //onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
        okButtonText="Save"
        cancelButtonText="Cancel"
        isActionsRequired
        onCancel={() => onCancelHandler()}
        formId="task-form"
        sx={{
          "& .MuiDialogContent-root": {
            padding: 0,
          },
        }}
      >
        <TaskForm onSave={onDialogClose} taskEvent={taskEvent} />
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
        sx={{
          "& .MuiDialogContent-root": {
            padding: 0,
          },
        }}
        additionalActions={deleteAction}
      >
        <EventForm onSave={onDialogClose} event={milestoneEvent} />
      </TrackDialog>
      <TrackDialog
        open={showTemplateForm}
        dialogTitle="Task Template"
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
        okButtonText="Get Template"
        formId="import-tasks-form"
        isCancelRequired={false}
        onCancel={() => onCancelHandler()}
        isActionsRequired
        sx={{
          "& .MuiDialogContent-root": {
            padding: 0,
          },
        }}
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
