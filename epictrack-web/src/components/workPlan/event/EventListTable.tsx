import React, { useContext, useEffect, useState } from "react";
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
import {
  BLANK_OPTION,
  getSelectFilterOptions,
  rowsPerPageOptions,
} from "../../shared/MasterTrackTable/utils";
import { EventContext } from "./EventContext";

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

const highlightedRowBGColor = "rgb(249, 249, 251)";

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

  const { highlightedRows } = useContext(EventContext);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10, //customize the default page size
  });

  useEffect(() => {
    const options = rowsPerPageOptions(events.length);
    setPagination((prev) => ({
      ...prev,
      pageSize: options[options.length - 1].value,
    }));
  }, [events]);

  const typeFilterOptions = getSelectFilterOptions(events, "type");
  const startDateFilterOptions = getSelectFilterOptions(
    events,
    "start_date",
    (value) => dateUtils.formatDate(String(value), "MMM.DD YYYY"),
    (value) => dateUtils.formatDate(String(value), "MMM.DD YYYY")
  );
  const endDateFilterOptions = getSelectFilterOptions(
    events,
    "end_date",
    (value) => dateUtils.formatDate(String(value), "MMM.DD YYYY"),
    (value) => dateUtils.formatDate(String(value), "MMM.DD YYYY")
  );
  const numberOfDaysFilterOptions = getSelectFilterOptions(
    events,
    "number_of_days",
    (value) => String(value),
    (value) => Number(value)
  );
  const assigneeOptions = Array.from(
    new Set(
      events
        .map((event) => event.assignees || [""])
        .flat()
        .map((assignee) =>
          assignee
            ? `${assignee.assignee.first_name} ${assignee.assignee.last_name}`
            : BLANK_OPTION
        )
    )
  );
  const responsibilityFilterOptions = Array.from(
    new Set(
      events
        .map((event) => event?.responsibility?.split(", "))
        .flat()
        .map((responsibility) => responsibility || BLANK_OPTION)
    )
  );

  const statusFilterOptions = getSelectFilterOptions(
    events,
    "status",
    (value) =>
      statusOptions.find((statusOption) => statusOption.value == value)
        ?.label ?? BLANK_OPTION
  );

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
            filterValue.length > typeFilterOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
        filterSelectOptions: typeFilterOptions,
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
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > startDateFilterOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(
            dateUtils.formatDate(String(value), "MMM.DD YYYY")
          );
        },
        filterSelectOptions: startDateFilterOptions,
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
        filterSelectOptions: endDateFilterOptions,
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > endDateFilterOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(
            value === ""
              ? value
              : dateUtils.formatDate(String(value), "MMM.DD YYYY")
          );
        },
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
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > numberOfDaysFilterOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id);

          return filterValue.includes(value);
        },
        filterSelectOptions: numberOfDaysFilterOptions,
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
            filterValue.length > assigneeOptions.length // select all is selected
          ) {
            return true;
          }

          const renderedValue: string = row.renderValue(id) || BLANK_OPTION;
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
            filterValue.length > responsibilityFilterOptions.length // select all is selected
          ) {
            return true;
          }
          const value: string = row.getValue(id) || BLANK_OPTION;

          return filterValue.every((filterName: string) =>
            value.includes(filterName)
          );
        },
        filterSelectOptions: responsibilityFilterOptions,
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
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > statusFilterOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
        filterSelectOptions: statusFilterOptions,
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
      enableSorting={false}
      enableRowSelection={(row) => row.original.type !== "Milestone"}
      enableSelectAll
      enablePagination
      onPaginationChange={setPagination}
      muiTablePaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(events.length),
      }}
      muiTableBodyRowProps={({ row }) => {
        const isHighlightRow = highlightedRows.find(
          (rowToHighlight) =>
            rowToHighlight.type === row.original.type &&
            rowToHighlight.id === row.original.id
        );
        if (isHighlightRow) {
          return {
            style: {
              background: highlightedRowBGColor,
            },
          };
        }

        return {};
      }}
      state={{
        isLoading: loading,
        showGlobalFilter: true,
        rowSelection,
        pagination,
      }}
      muiSelectCheckboxProps={({ row }) => ({
        indeterminateIcon: <LockIcon />,
        disabled:
          row.original.type === EVENT_TYPE.MILESTONE &&
          !row.original.is_complete,
        indeterminate:
          row.original.is_complete &&
          row.original.type === EVENT_TYPE.MILESTONE,
      })}
      columns={columns}
      data={events}
      enableTopToolbar={false}
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
