import React, { useContext } from "react";
import { EVENT_TYPE } from "../phase/type";
import MasterTrackTable from "../../shared/MasterTrackTable";
import eventService from "../../../services/eventService/eventService";
import Icons from "../../icons";
import { EventsGridModel } from "../../../models/events";
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
import { EVENT_STATUS, statusOptions } from "../../../models/task_event";
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
import { TemplateStatus } from "../../../models/work";
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
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showTaskForm, setShowTaskForm] = React.useState<boolean>(false);
  const [showMilestoneForm, setShowMilestoneForm] =
    React.useState<boolean>(false);
  const [eventId, setEventId] = React.useState<number | undefined>();
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

  const [tasksSelected, setTasksSelected] = React.useState<string[]>([]);
  const [milestonesSelected, setMilestonesSelected] = React.useState<string[]>(
    []
  );
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);

  React.useEffect(() => setEvents([]), [ctx.selectedWorkPhase?.phase.id]);
  React.useEffect(() => {
    getCombinedEvents();
  }, [ctx.work?.id, ctx.selectedWorkPhase?.phase.id]);

  React.useEffect(() => {
    const options: OptionType[] = ctx.team.map((staff) => {
      return {
        value: staff.staff_id.toString(),
        label: staff.staff.full_name,
      };
    });
    setStaffSelectOptions(options);
  }, [ctx.team]);

  const getCombinedEvents = React.useCallback(() => {
    let result: EventsGridModel[] = [];
    if (ctx.work?.id && ctx.selectedWorkPhase?.phase.id) {
      setLoading(true);
      Promise.all([
        getMilestoneEvents(Number(ctx.selectedWorkPhase.id)),
        getTaskEvents(
          Number(ctx.work?.id),
          Number(ctx.selectedWorkPhase.phase.id)
        ),
      ]).then((data: Array<EventsGridModel[]>) => {
        setLoading(false);
        data.forEach((array: EventsGridModel[]) => {
          result = result.concat(array);
        });
        result = result.sort((a, b) =>
          Moment(a.start_date).diff(b.start_date, "seconds")
        );
        setEvents(result);
      });
    }
    setRowSelection({});
  }, [ctx.work, ctx.selectedWorkPhase?.phase.id]);
  const getTaskEvents = async (
    workId: number,
    currentPhase: number
  ): Promise<EventsGridModel[]> => {
    let result: EventsGridModel[] = [];
    try {
      const taskResult = await taskEventService.getAllByWorkNdPhase(
        Number(workId),
        Number(currentPhase)
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
  const getMilestoneEvents = async (
    workPhaseId: number
  ): Promise<EventsGridModel[]> => {
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
          if (element.actual_date) {
            element.end_date = dateUtils
              .add(element.actual_date, element.number_of_days, "days")
              .toISOString();
          }
          element.start_date = element.anticipated_date;
          element.mandatory = element.event_configuration.mandatory;
          return element;
        });
      }
    } catch (e) {
      setLoading(false);
    }
    return Promise.resolve(result);
  };

  const onDialogClose = React.useCallback(() => {
    setShowTaskForm(false);
    setShowTemplateForm(false);
    setShowMilestoneForm(false);
    getCombinedEvents();
    getTemplateUploadStatus();
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
          work_id: ctx.work?.id,
          phase_id: ctx.selectedWorkPhase?.phase.id,
        },
        Number(selectedTemplateId)
      );
      if (result.status === 201) {
        showNotification("Task events uploaded", {
          type: "success",
        });
        setShowTemplateConfirmation(false);
        getCombinedEvents();
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
        sortingFn: "sortFn",
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 100,
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
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
        Cell: ({ cell, row }) => (
          <ETParagraph bold={row.original.type === EVENT_TYPE.MILESTONE}>
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "notes",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        header: "Notes",
        size: 250,
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
    setEventId(row.id);
    setShowTaskForm(row.type === EVENT_TYPE.TASK);
    setShowMilestoneForm(row.type === EVENT_TYPE.MILESTONE);
  };
  const onCancelHandler = () => {
    setShowTaskForm(false);
    setShowTemplateForm(false);
    setShowMilestoneForm(false);
    setEventId(undefined);
  };

  const getTemplateUploadStatus = React.useCallback(async () => {
    if (ctx.work && ctx.selectedWorkPhase) {
      if (notificationId.current !== null) {
        closeSnackbar(notificationId.current);
        notificationId.current = null;
      }
      const response = await workService.checkTemplateUploadStatus(
        ctx.work?.id.toString(),
        ctx.selectedWorkPhase?.phase.id.toString()
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

  React.useEffect(() => {
    const ids = Object.keys(rowSelection);
    const taskIds = ids.filter((id: any) => Number(id) == id);
    const milestoneIds = ids.filter((id: any) => Number(id) != id);
    setTasksSelected(taskIds);
    setMilestonesSelected(milestoneIds);
  }, [rowSelection]);

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
      const data = { task_ids: tasksSelected, assignee_ids };
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
    [tasksSelected]
  );

  const assignResponsibility = React.useCallback(
    async (responsibility_id: any) => {
      const data = {
        task_ids: tasksSelected,
        responsibility_id: responsibility_id,
      };
      const result = await taskEventService.patchTasks(data);
      try {
        if (result.status === 200) {
          showNotification("Responsibility updated", {
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
    [tasksSelected]
  );

  const assignProgress = React.useCallback(
    async (status: any) => {
      const data = {
        task_ids: tasksSelected,
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
    [tasksSelected]
  );

  const deleteTasks = async (): Promise<string> => {
    let result = "";
    if (tasksSelected.length === 0) return Promise.resolve(result);
    const data = {
      task_ids: tasksSelected.join(","),
    };
    const response = await taskEventService.deleteTasks(data);
    try {
      if (response.status === 200) {
        result = response.data as string;
      }
    } catch (e) {}
    return Promise.resolve(result);
  };

  const deleteMilestones = async (): Promise<string> => {
    let result = "";
    if (milestonesSelected.length === 0) return Promise.resolve(result);
    const data = {
      milestone_ids: milestonesSelected
        .map((milestone_id: string) => milestone_id.split("_")[1])
        .join(","),
    };
    const response = await eventService.deleteMilestones(data);
    try {
      if (response.status === 200) {
        result = response.data as string;
      }
    } catch (e) {}
    return Promise.resolve(result);
  };

  const handleDelete = React.useCallback(async () => {
    Promise.all([deleteTasks(), deleteMilestones()]).then(
      (data: Array<string>) => {
        showNotification("Deleted successfully", {
          type: "success",
        });
        setShowDeleteDialog(false);
        getCombinedEvents();
      }
    );
  }, [tasksSelected, milestonesSelected]);

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
              {tasksSelected.length > 0 && milestonesSelected.length === 0 && (
                <>
                  <FilterSelect
                    options={staffSelectOptions}
                    isMulti
                    variant="bar"
                    placeholder="Assign To"
                    filterAppliedCallback={assignTasks}
                    name="assignTo"
                  />
                  <FilterSelect
                    options={responsibilities}
                    variant="bar"
                    placeholder="Responsibility"
                    filterAppliedCallback={assignResponsibility}
                    name="responsibility"
                  />
                  <FilterSelect
                    options={statusOptions}
                    variant="bar"
                    placeholder="Progress"
                    filterAppliedCallback={assignProgress}
                    name="progress"
                  />
                </>
              )}
              <Button
                variant="outlined"
                startIcon={<DeleteIcon className={classes.deleteIcon} />}
                sx={{
                  color: Palette.primary.accent.main,
                  border: "none",
                }}
                onClick={() => setShowDeleteDialog(true)}
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
          enableRowSelection={(row) =>
            row.original.type === EVENT_TYPE.TASK ||
            (!row.original.mandatory && row.original.end_date === undefined)
          }
          enableSelectAll
          enablePagination
          muiSelectCheckboxProps={({ row, table }) => ({
            indeterminateIcon: <LockIcon />,
            disabled:
              row.original.mandatory &&
              row.original.type === EVENT_TYPE.MILESTONE,
            indeterminate:
              row.original.end_date !== undefined &&
              row.original.type === EVENT_TYPE.MILESTONE,
          })}
          columns={columns}
          data={events}
          enableTopToolbar={false}
          state={{
            isLoading: loading,
            showGlobalFilter: true,
            rowSelection,
            // columnVisibility: { id: false },
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
        <TaskForm onSave={onDialogClose} eventId={eventId} />
      </TrackDialog>
      <TrackDialog
        open={showMilestoneForm}
        dialogTitle="Add Milestone"
        //onClose={(event, reason) => onDialogClose(event, reason)}
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
      >
        <EventForm onSave={onDialogClose} eventId={eventId} />
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
