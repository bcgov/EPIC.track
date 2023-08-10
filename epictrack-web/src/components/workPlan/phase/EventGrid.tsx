import React, { useContext } from "react";
import { PhaseContainerProps } from "./type";
import MasterTrackTable from "../../shared/MasterTrackTable";
import eventService from "../../../services/eventService/eventService";
import Icons from "../../icons";
import { EventsGridModel } from "../../../models/events";
import { WorkplanContext } from "../WorkPlanContext";
import { MRT_ColumnDef, MRT_RowSelectionState } from "material-react-table";
import { ETGridTitle, ETParagraph } from "../../shared";
import { dateUtils } from "../../../utils";
import { Button, Grid, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import { Palette } from "../../../styles/theme";
import { IconProps } from "../../icons/type";
import workService from "../../../services/workService/workService";
import { makeStyles } from "@mui/styles";

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

const EventGrid = ({ workId }: PhaseContainerProps) => {
  const [events, setEvents] = React.useState<EventsGridModel[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const ctx = useContext(WorkplanContext);
  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );
  const classes = useStyle();
  React.useEffect(() => {
    getMilestoneEvents(workId, Number(ctx.selectedPhaseId));
  }, [workId, ctx.selectedPhaseId]);
  const getMilestoneEvents = async (workId: number, currentPhase: number) => {
    try {
      const result = await eventService.GetMilestoneEvents(
        Number(workId),
        Number(currentPhase)
      );
      if (result.status === 200) {
        const data: EventsGridModel[] = (result.data as EventsGridModel[]).map(
          (element) => {
            element.type = "Milestone";
            element.progress = "Not Started";
            return element;
          }
        );
        setEvents(data);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  };

  const downloadPDFReport = React.useCallback(async () => {
    try {
      const binaryReponse = await workService.downloadWorkplan(
        workId,
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
  }, [workId, ctx.selectedPhaseId]);

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
            bold
            className={classes.textEllipsis}
            title={cell.getValue<string>()}
          >
            {cell.getValue<string>()}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
      },
      {
        accessorKey: "type",
        header: "Type",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        Cell: ({ cell, row }) => (
          <ETParagraph title={cell.getValue<string>()} bold>
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "anticipated_date",
        header: "Start Date",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        size: 140,
        Cell: ({ cell, row }) => (
          <ETParagraph bold className={classes.textEllipsis}>
            {dateUtils.formatDate(cell.getValue<string>(), "MMM.DD YYYY")}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "end_date",
        size: 140,
        header: "End Date",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
      },
      {
        accessorKey: "number_of_days",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        size: 60,
        header: "Days",
      },
      {
        accessorKey: "assigned",
        header: "Assigned",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        size: 140,
      },
      {
        accessorKey: "responsibility",
        header: "Responsibility",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        size: 140,
      },
      {
        accessorKey: "notes",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        header: "Notes",
        size: 250,
      },
      {
        accessorKey: "progress",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        header: "Progress",
        size: 130,
        Cell: ({ cell, row }) => (
          <ETParagraph bold>{cell.getValue<string>()}</ETParagraph>
        ),
      },
    ],
    [events]
  );

  return (
    <Grid container rowSpacing={1}>
      <Grid container item columnSpacing={2}>
        <Grid item xs="auto">
          <Button variant="contained">Add Task</Button>
        </Grid>
        <Grid item xs="auto">
          <Button variant="contained">Add Milestone</Button>
        </Grid>
        <Grid item xs={8}></Grid>
        <Grid
          item
          xs
          sx={{
            display: "flex",
            justifyContent: "right",
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
    </Grid>
  );
};

export default EventGrid;
