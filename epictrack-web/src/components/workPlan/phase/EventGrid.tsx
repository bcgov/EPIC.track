import React, { useContext } from "react";
import { EVENT_TYPE } from "./type";
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
import { Button, Grid, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import { Palette } from "../../../styles/theme";
import { IconProps } from "../../icons/type";
import workService from "../../../services/workService/workService";
import { makeStyles } from "@mui/styles";
import TrackDialog from "../../shared/TrackDialog";
import TaskForm from "../task/TaskForm";
import { EVENT_STATUS, statusOptions } from "../../../models/task_event";
import taskEventService from "../../../services/taskEventService/taskEventService";

const ImportFileIcon: React.FC<IconProps> = Icons["ImportFileIcon"];
const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const useStyle = makeStyles({
  textEllipsis: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
});
const IButton = styled(IconButton)({
  "& .icon": {
    fill: Palette.primary.main,
  },
  "&:hover": {
    backgroundColor: Palette.neutral.bg.main,
    borderRadius: "4px",
  },
});

const EventGrid = () => {
  const [events, setEvents] = React.useState<EventsGridModel[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showTaskForm, setShowTaskForm] = React.useState<boolean>(false);
  const [eventId, setEventId] = React.useState<number | undefined>();
  const [showMilestoneForm, setShowMilestoneForm] =
    React.useState<boolean>(false);
  const ctx = useContext(WorkplanContext);
  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );
  const classes = useStyle();
  React.useEffect(() => setEvents([]), [ctx.selectedPhaseId]);
  React.useEffect(() => {
    getCombinedEvents();
  }, [ctx.work?.id, ctx.selectedPhaseId]);

  const getCombinedEvents = () => {
    let result: EventsGridModel[] = [];
    setLoading(true);
    Promise.all([
      getMilestoneEvents(Number(ctx.work?.id), Number(ctx.selectedPhaseId)),
      getTaskEvents(Number(ctx.work?.id), Number(ctx.selectedPhaseId)),
    ]).then((data: Array<EventsGridModel[]>) => {
      setLoading(false);
      data.forEach((array: EventsGridModel[]) => {
        console.log(array);
        result = result.concat(array);
      });
      result = result.sort((a, b) =>
        Moment(a.start_date).diff(b.start_date, "seconds")
      );
      setEvents(result);
    });
  };
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
          element.end_date = dateUtils.formatDate(
            dateUtils
              .add(element.start_date, element.number_of_days, "days")
              .toISOString()
          );
          return element;
        });
      }
    } catch (e) {
      setLoading(false);
    }
    return Promise.resolve(result);
  };
  const getMilestoneEvents = async (
    workId: number,
    currentPhase: number
  ): Promise<EventsGridModel[]> => {
    let result: EventsGridModel[] = [];
    try {
      const milestoneResult = await eventService.GetMilestoneEvents(
        Number(workId),
        Number(currentPhase)
      );
      if (milestoneResult.status === 200) {
        result = (milestoneResult.data as any[]).map((element) => {
          element.type = EVENT_TYPE.MILESTONE;
          element.status = EVENT_STATUS.NOT_STARTED;
          if (element.actual_date) {
            element.end_date = dateUtils.formatDate(
              dateUtils
                .add(element.actual_date, element.number_of_days, "days")
                .toISOString()
            );
          }
          element.start_date = element.actual_date
            ? element.actual_date
            : element.anticipated_date;
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
    getCombinedEvents();
  }, []);
  const downloadPDFReport = React.useCallback(async () => {
    try {
      const binaryReponse = await workService.downloadWorkplan(
        Number(ctx.work?.id),
        Number(ctx.selectedPhaseId)
      );
      const url = window.URL.createObjectURL(
        new Blob([(binaryReponse as any).data])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `file.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {}
  }, [ctx.work?.id, ctx.selectedPhaseId]);

  const columns = React.useMemo<MRT_ColumnDef<EventsGridModel>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Task / Milestone",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        size: 300,
        Cell: ({ cell, row }) => (
          <ETGridTitle
            to={"#"}
            bold={row.original.type === EVENT_TYPE.MILESTONE}
            className={classes.textEllipsis}
            onClick={() => onRowClick(row.original)}
            titleText={cell.getValue<string>()}
          >
            {cell.getValue<string>()}
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
          <ETParagraph
            title={cell.getValue<string>()}
            bold={row.original.type === EVENT_TYPE.MILESTONE}
          >
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
          <ETParagraph
            title={cell.getValue<string>()}
            bold={row.original.type === EVENT_TYPE.MILESTONE}
          >
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "assigned",
        header: "Assigned",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        size: 140,
        Cell: ({ cell, row }) => (
          <ETParagraph
            title={cell.getValue<string>()}
            bold={row.original.type === EVENT_TYPE.MILESTONE}
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
          <ETParagraph
            title={cell.getValue<string>()}
            bold={row.original.type === EVENT_TYPE.MILESTONE}
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
        Cell: ({ cell, row }) => (
          <ETParagraph
            title={cell.getValue<string>()}
            bold={row.original.type === EVENT_TYPE.MILESTONE}
          >
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "status",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        header: "Progress",
        size: 130,
        Cell: ({ cell, row }) => (
          <ETParagraph bold={row.original.type === EVENT_TYPE.MILESTONE}>
            {
              statusOptions.filter(
                (p) => p.value == cell.getValue<EVENT_STATUS>()
              )[0]?.label
            }
          </ETParagraph>
        ),
      },
    ],
    [events]
  );
  const onRowClick = (row: EventsGridModel) => {
    setEventId(row.id);
    setShowTaskForm(row.type === EVENT_TYPE.TASK);
  };
  return (
    <Grid container rowSpacing={1}>
      <Grid container item columnSpacing={2}>
        <Grid item xs="auto">
          <Button variant="contained" onClick={() => setShowTaskForm(true)}>
            Add Task
          </Button>
        </Grid>
        <Grid item xs="auto">
          <Button variant="outlined">Add Milestone</Button>
        </Grid>
        <Grid item xs={8}></Grid>
        <Grid
          item
          xs
          sx={{
            display: "flex",
            justifyContent: "right",
            gap: "0.5rem",
          }}
        >
          <Tooltip title="Import tasks from template">
            <IButton>
              <ImportFileIcon className="icon" />
            </IButton>
          </Tooltip>
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
          // onRowSelectionChange={setRowSelection}
          columns={columns}
          data={events}
          enableTopToolbar={false}
          initialState={{
            sorting: [
              {
                id: "full_name",
                desc: false,
              },
            ],
          }}
          state={{
            // rowSelection,
            isLoading: loading,
            showGlobalFilter: true,
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
        onCancel={() => setShowTaskForm(false)}
        formId="task-form"
        sx={{
          "& .MuiDialogContent-root": {
            padding: 0,
          },
        }}
      >
        <TaskForm onSave={onDialogClose} eventId={eventId} />
      </TrackDialog>
    </Grid>
  );
};

export default EventGrid;
