import React, { useContext } from "react";
import { PhaseContainerProps } from "./type";
import MasterTrackTable from "../../shared/MasterTrackTable";
import eventService from "../../../services/eventService/eventService";
import { EventsGridModel } from "../../../models/events";
import { WorkplanContext } from "../WorkPlanContext";
import { MRT_ColumnDef } from "material-react-table";
import { ETGridTitle, ETParagraph } from "../../shared";
import { dateUtils } from "../../../utils";

const EventGrid = ({ workId }: PhaseContainerProps) => {
  const [events, setEvents] = React.useState<EventsGridModel[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const ctx = useContext(WorkplanContext);
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
  console.log("Events ", events);

  const columns = React.useMemo<MRT_ColumnDef<EventsGridModel>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Task / Milestone",
        Cell: ({ cell, row }) => (
          <ETGridTitle to={"#"} bold>
            {cell.getValue<string>()}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
      },
      {
        accessorKey: "type",
        header: "Type",
        Cell: ({ cell, row }) => (
          <ETParagraph bold>{cell.getValue<string>()}</ETParagraph>
        ),
      },
      {
        accessorKey: "anticipated_date",
        header: "Start Date",
        Cell: ({ cell, row }) => (
          <ETParagraph bold>
            {dateUtils.formatDate(cell.getValue<string>(), "MMM.DD YYYY")}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "end_date",
        header: "End Date",
      },
      {
        accessorKey: "number_of_days",
        header: "Days",
      },
      {
        accessorKey: "assigned",
        header: "Assigned",
      },
      {
        accessorKey: "responsibility",
        header: "Responsibility",
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
      {
        accessorKey: "progress",
        header: "Progress",
        Cell: ({ cell, row }) => (
          <ETParagraph bold>{cell.getValue<string>()}</ETParagraph>
        ),
      },
    ],
    [events]
  );

  return (
    <MasterTrackTable
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
        isLoading: loading,
        showGlobalFilter: true,
      }}
    />
  );
};

export default EventGrid;
