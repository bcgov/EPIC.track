import React, { useContext, useEffect, useState } from "react";
import { EVENT_TYPE } from "../phase/type";
import MasterTrackTable from "../../shared/MasterTrackTable";
import Icons from "../../icons";
import { EventPosition, EventsGridModel } from "../../../models/event";
import { MRT_ColumnDef, MRT_RowSelectionState } from "material-react-table";
import { ETGridTitle, ETParagraph, IButton } from "../../shared";
import { dateUtils } from "../../../utils";
import { Box, Button, Grid, Tooltip } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { IconProps } from "../../icons/type";
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
import { MONTH_DAY_YEAR, ROLES } from "../../../constants/application-constant";
import { searchFilter } from "../../shared/MasterTrackTable/filters";
import { useAppSelector } from "../../../hooks";
import { hasPermission, Restricted } from "../../shared/restricted";
import { WorkplanContext } from "../WorkPlanContext";
import { TemplateStatus } from "models/work";

const LockIcon: React.FC<IconProps> = Icons["LockIcon"];
const ImportFileIcon: React.FC<IconProps> = Icons["ImportFileIcon"];

const highlightedRowBGColor = "rgb(249, 249, 251)";

interface EventListTable {
  onRowClick: (
    event: React.MouseEvent<HTMLAnchorElement>,
    rowOriginal: EventsGridModel
  ) => void;
  events: EventsGridModel[];
  loading: boolean;
  rowSelection: MRT_RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<MRT_RowSelectionState>>;
  templateAvailable: TemplateStatus | undefined;
  userIsActiveTeamMember: boolean;
  onAddTask: () => void;
  onAddMilestone: () => void;
  handleExportToSheet: () => void;
  handleTaskFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setShowTemplateForm: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
}
const EventListTable = ({
  loading,
  events,
  onRowClick,
  rowSelection,
  setRowSelection,
  templateAvailable,
  userIsActiveTeamMember,
  onAddMilestone,
  onAddTask,
  handleTaskFileUpload,
  setShowTemplateForm,
}: EventListTable) => {
  const { team } = useContext(WorkplanContext);
  const { highlightedRows } = useContext(EventContext);
  const { roles, email } = useAppSelector((state) => state?.user.userDetail);
  const userIsTeamMember = Boolean(
    team.find((member) => member.staff.email === email)
  );
  const canEdit =
    hasPermission({ roles, allowed: [ROLES.EDIT] }) || userIsTeamMember;

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
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR)
  );
  const endDateFilterOptions = getSelectFilterOptions(
    events,
    "end_date",
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR)
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
        filterFn: searchFilter,
        size: 300,
        Cell: canEdit
          ? ({ cell, row, renderedCellValue }) => (
              <ETGridTitle
                to="#"
                bold={[EventPosition.START, EventPosition.END].includes(
                  row.original.event_configuration?.event_position
                )}
                enableEllipsis
                onClick={(event: any) => onRowClick(event, row.original)}
                enableTooltip={true}
                tooltip={cell.getValue<string>()}
              >
                {renderedCellValue}
              </ETGridTitle>
            )
          : undefined,
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
            dateUtils.formatDate(String(value), MONTH_DAY_YEAR)
          );
        },
        filterSelectOptions: startDateFilterOptions,
        size: 140,
        Cell: ({ cell, row }) => (
          <ETParagraph
            bold={row.original.type === EVENT_TYPE.MILESTONE}
            enableEllipsis={true}
          >
            {dateUtils.formatDate(cell.getValue<string>(), MONTH_DAY_YEAR)}
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
              : dateUtils.formatDate(String(value), MONTH_DAY_YEAR)
          );
        },
        Cell: ({ cell, row }) => (
          <ETParagraph
            bold={row.original.type === EVENT_TYPE.MILESTONE}
            enableEllipsis={true}
          >
            {cell.getValue<string>() &&
              dateUtils.formatDate(
                String(cell.getValue<string>()),
                MONTH_DAY_YEAR
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
      tableName="eventListTable"
      enableSorting={false}
      enableRowSelection={(row) => row.original.type !== "Milestone"}
      enableSelectAll={true}
      enableExport={true}
      muiSelectAllCheckboxProps={{
        disabled: !canEdit,
      }}
      enablePagination
      onPaginationChange={setPagination}
      muiPaginationProps={{
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
          !canEdit ||
          (row.original.type === EVENT_TYPE.MILESTONE &&
            !row.original.is_complete),
        indeterminate:
          row.original.is_complete &&
          row.original.type === EVENT_TYPE.MILESTONE,
      })}
      columns={columns}
      data={events}
      enableTopToolbar={true}
      renderTopToolbarCustomActions={() => (
        <Grid container sx={{ display: "flex", gap: "1rem", width: "100%" }}>
          <Grid
            item
            sx={{ display: "flex", gap: "1rem", alignContent: "left" }}
          >
            <Restricted
              allowed={[ROLES.CREATE]}
              errorProps={{ disabled: true }}
              exception={userIsActiveTeamMember}
            >
              <Button
                variant="contained"
                onClick={onAddTask}
                sx={{ alignSelf: "left" }}
              >
                Add Task
              </Button>
            </Restricted>
            <Restricted
              allowed={[ROLES.CREATE]}
              errorProps={{ disabled: true }}
              exception={userIsActiveTeamMember}
            >
              <Button
                variant="outlined"
                onClick={onAddMilestone}
                sx={{ alignSelf: "left" }}
              >
                Add Milestone
              </Button>
            </Restricted>
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
          <Grid item sx={{ display: "flex", flexGrow: 1, gap: "1rem" }}></Grid>
          <Grid item sx={{ display: "flex", gap: "1rem" }}>
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
      )}
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
