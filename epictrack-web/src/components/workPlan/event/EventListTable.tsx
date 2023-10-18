import React from "react";
import { EVENT_TYPE } from "../phase/type";
import MasterTrackTable from "../../shared/MasterTrackTable";
import Icons from "../../icons";
import { EventsGridModel } from "../../../models/event";
import { MRT_ColumnDef, MRT_RowSelectionState } from "material-react-table";
import { ETGridTitle, ETParagraph } from "../../shared";
import { dateUtils } from "../../../utils";
import { Box } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { IconProps } from "../../icons/type";
import { makeStyles } from "@mui/styles";
import { EVENT_STATUS, statusOptions } from "../../../models/taskEvent";
import {
  CompletedIcon,
  InProgressIcon,
  NotStartedIcon,
} from "../../icons/status";
import { getTextFromDraftJsContentState } from "../../shared/richTextEditor/utils";
import TableFilter from "../../shared/filterSelect/TableFilter";
import { Switch, Case } from "react-if";

const LockIcon: React.FC<IconProps> = Icons["LockIcon"];

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

interface EventListTable {
  onRowClick: (event: any, rowOriginal: any) => void;
  events: EventsGridModel[];
  loading: boolean;
  rowSelection: MRT_RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<MRT_RowSelectionState>>;
}
const EventListTable = ({
  onRowClick,
  events,
  loading,
  rowSelection,
  setRowSelection,
}: EventListTable) => {
  const classes = useStyle();

  const getOptions = (
    key: keyof EventsGridModel,
    formatLabel: (value: any) => string = (value) => String(value)
  ) => {
    // Step 1: Create a Map to store unique values and their formatted labels
    const optionsMap = new Map();

    // Step 2: Iterate through the events array to populate the Map
    events.forEach((event) => {
      // Step 3: Skip undefined or null values
      if (event[key] === undefined || event[key] === null) return;

      // Step 4: Populate the Map with unique values and their formatted labels
      optionsMap.set(event[key], formatLabel(event[key]));
    });

    // Step 5: Convert the Map to an array of objects with 'text' and 'value' properties
    const optionsArray = Array.from(optionsMap.entries()).map(
      ([key, value]) => ({
        text: value,
        value: key,
      })
    );

    return optionsArray;
  };

  const assigneeOptions = Array.from(
    new Set(
      events
        .map((event) => event.assignees || [])
        .flat()
        .map(
          (assignee) =>
            `${assignee.assignee.first_name} ${assignee.assignee.last_name}`
        )
    )
  );

  const responsibilityOptions = Array.from(
    new Set(events.map((event) => event?.responsibility?.split(", ")).flat())
  ).filter((responsibility) => responsibility);

  const columns = React.useMemo<MRT_ColumnDef<EventsGridModel>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Task / Milestone",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        sortingFn: "sortFn",
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
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 100,
        // muiTableHeadCellFilterTextFieldProps: { placeholder: "Filter" },
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: "multiSelectFilter",
        filterSelectOptions: getOptions("type"),
        Cell: ({ cell, row }) => (
          <ETParagraph bold={row.original.type === EVENT_TYPE.MILESTONE}>
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: "multiSelectFilter",
        filterSelectOptions: getOptions("start_date", (value) =>
          dateUtils.formatDate(String(value), "MMM.DD YYYY")
        ),
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
        size: 140,
        header: "End Date",
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterSelectOptions: getOptions("end_date", (value) =>
          dateUtils.formatDate(String(value), "MMM.DD YYYY")
        ),
        Cell: ({ cell, row }) => (
          <ETParagraph
            bold={row.original.type === EVENT_TYPE.MILESTONE}
            className={classes.textEllipsis}
          >
            {cell.getValue<string>() &&
              dateUtils.formatDate(
                String(cell.getValue<string>()),
                "MMM.DD YYYY"
              )}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "number_of_days",
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: "multiSelectFilter",
        filterSelectOptions: getOptions("number_of_days", (value) =>
          String(value)
        ),
        size: 100,
        header: "Days",
        Cell: ({ cell, row }) => (
          <ETParagraph bold={row.original.type === EVENT_TYPE.MILESTONE}>
            {cell.getValue<string>()}
          </ETParagraph>
        ),
      },
      {
        header: "Assigned",
        accessorFn: (row: EventsGridModel) =>
          row.assignees
            ?.map((p) => `${p.assignee.first_name} ${p.assignee.last_name}`)
            .join(", "),
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length >= assigneeOptions.length
          ) {
            return true;
          }

          const renderedValue: string = row.renderValue(id);
          if (!renderedValue) return false;
          return filterValue.every((filterName: string) =>
            renderedValue.includes(filterName)
          );
        },
        filterSelectOptions: assigneeOptions,
        size: 140,
        Cell: ({ cell, row }) => {
          return (
            <ETParagraph
              bold={row.original.type === EVENT_TYPE.MILESTONE}
              enableEllipsis
              enableTooltip
              tooltip={cell.getValue<string>()}
            >
              {cell.getValue<string>()}
            </ETParagraph>
          );
        },
      },
      {
        accessorKey: "responsibility",
        header: "Responsibility",
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length >= responsibilityOptions.length
          ) {
            return true;
          }
          const value: string = row.getValue(id);

          if (!value) return false;

          console.log("renderedValue", value);
          console.log("filterValue", filterValue);
          return filterValue.every((filterName: string) =>
            value.includes(filterName)
          );
        },
        filterSelectOptions: responsibilityOptions,
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
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: "multiSelectFilter",
        filterSelectOptions: getOptions(
          "status",
          (value) =>
            statusOptions.find((statusOption) => statusOption.value == value)
              ?.label || ""
        ),
        header: "Progress",
        size: 150,
        Cell: ({ cell, row }) => {
          const value = cell.getValue<EVENT_STATUS>();
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Switch>
                <Case condition={value === EVENT_STATUS.NOT_STARTED}>
                  <NotStartedIcon fill={Palette.neutral.light} />
                </Case>
                <Case condition={value === EVENT_STATUS.INPROGRESS}>
                  <InProgressIcon fill={Palette.success.light} />
                </Case>
                <Case condition={value === EVENT_STATUS.COMPLETED}>
                  <CompletedIcon fill={Palette.neutral.accent.light} />
                </Case>
              </Switch>
              <ETParagraph bold={row.original.type === EVENT_TYPE.MILESTONE}>
                {
                  statusOptions.filter(
                    (statusOption) => statusOption.value === value
                  )[0]?.label
                }
              </ETParagraph>
            </Box>
          );
        },
      },
    ],
    [events]
  );

  return (
    <MasterTrackTable
      enableRowSelection={(row) => row.original.type !== "Milestone"}
      enableSelectAll
      enablePagination
      muiSelectCheckboxProps={({ row }) => ({
        indeterminateIcon: <LockIcon />,
        disabled:
          row.original.end_date === undefined &&
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
      }}
      onRowSelectionChange={setRowSelection}
      getRowId={(originalRow: EventsGridModel) => {
        return originalRow.type === EVENT_TYPE.MILESTONE
          ? `milestone_${originalRow.id}`
          : originalRow.id?.toString();
      }}
    />
  );
};

export default EventListTable;
