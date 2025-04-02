import React, { useContext, useEffect, useMemo, useState } from "react";
import { Box, Grid } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer, ETParagraph } from "../shared";
import { MasterContext } from "../shared/MasterContext";
import {
  BLANK_OPTION,
  getSelectFilterOptions,
} from "../shared/MasterTrackTable/utils";
import TableFilter from "../shared/filterSelect/TableFilter";
import { hasPermission } from "../shared/restricted";
import { MONTH_DAY_YEAR, ROLES } from "../../constants/application-constant";
import { searchFilter } from "../shared/MasterTrackTable/filters";
import { useAppSelector } from "../../hooks";
import { Palette } from "styles/theme";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { useCachedState } from "hooks/useCachedFilters";
import taskEventService from "services/taskEventService/taskEventService";
import { MyTask } from "models/task";
import { EVENT_STATUS, statusOptions } from "models/taskEvent";
import { Switch, Case } from "react-if";
import {
  CompletedIcon,
  InProgressIcon,
  NotStartedIcon,
} from "components/icons/status";
import { getTextFromDraftJsContentState } from "components/shared/richTextEditor/utils";
import { dateUtils } from "utils";
import { MyTaskDialog } from "./MyTaskDialog";

const myTasksListColumnFiltersCacheKey = "myTasks-listing-column-filters";

export default function MyTasksList() {
  const user = useAppSelector((state) => state.user.userDetail);
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    myTasksListColumnFiltersCacheKey,
    [
      {
        id: "status",
        value: [EVENT_STATUS.INPROGRESS, EVENT_STATUS.NOT_STARTED],
      },
      {
        id: "assigned",
        value: [`${user.firstName} ${user.lastName}`],
      },
    ]
  );
  const ctx = useContext(MasterContext);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [startDates, setStartDates] = useState<[]>([]);
  const [endDates, setEndDates] = useState<[]>([]);
  const [progress, setProgress] = useState<[]>([]);
  const [assigned, setAssigned] = useState<[]>([]);
  const [work, setWork] = useState<[]>([]);
  const [task, setTask] = useState<MyTask | null>(null);
  const [showModalForm, setShowModalForm] = useState<boolean>(false);

  const getMyTasks = async (): Promise<MyTask[]> => {
    const result: [] = [];
    try {
      const taskResult = await taskEventService.getMyTasks(
        Number(user.staffId)
      );

      if (taskResult.status === 200) {
        const tasksWithEndDates = (taskResult.data as MyTask[]).map((task) => {
          const startDate = new Date(task.start_date);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + task.number_of_days);
          return {
            ...task,
            end_date: dateUtils.formatDate(String(endDate), MONTH_DAY_YEAR),
          };
        });
        setMyTasks(tasksWithEndDates);
      }
    } catch (e) {
      setLoading(false);
    }
    return Promise.resolve(result);
  };

  useEffect(() => {
    ctx.setForm(<></>);
  }, []);

  const handleEdit = (task: MyTask) => {
    setTask(task);
    setShowModalForm(true);
  };

  useEffect(() => {
    getMyTasks();
  }, []);

  const statusFilterOptions = getSelectFilterOptions(
    myTasks,
    "status",
    (value) =>
      statusOptions.find((statusOption) => statusOption.value === value)
        ?.label ?? BLANK_OPTION
  );

  const startDateFilterOptions = getSelectFilterOptions(
    myTasks,
    "start_date",
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR)
  );

  const endDateFilterOptions = getSelectFilterOptions(
    myTasks,
    "end_date",
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR)
  );

  const assigneeOptions = Array.from(
    new Set(
      myTasks
        .map((task) => task.assignees || [""])
        .flat()
        .map((assignee) =>
          assignee
            ? `${assignee.assignee.first_name} ${assignee.assignee.last_name}`
            : BLANK_OPTION
        )
    )
  );

  const codeTypes: { [x: string]: any } = {
    start_date: setStartDates,
    end_date: setEndDates,
    progress: setProgress,
    assigned: setAssigned,
    work: setWork,
  };

  React.useEffect(() => {
    Object.keys(codeTypes).forEach((key: string) => {
      let accessor = `${key}`;
      if (key === "work") {
        accessor = "title";
      }
      const codes = myTasks
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .map((w) => (w[key] ? w[key][accessor] : null))
        .filter(
          (ele, index, arr) => arr.findIndex((t) => t === ele) === index && ele
        );
      codeTypes[key](codes);
    });
  }, [myTasks]);

  const columns = useMemo<MRT_ColumnDef<MyTask>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Task",
        size: 400,
        Cell: canEdit
          ? ({ cell, row, renderedCellValue }) => (
              <ETGridTitle
                to={`/my-tasks`}
                onClick={() => {
                  handleEdit(row.original);
                }}
                enableTooltip={true}
                tooltip={cell.getValue<string>()}
              >
                {renderedCellValue}
              </ETGridTitle>
            )
          : undefined,
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        filterVariant: "multi-select",
        filterSelectOptions: startDateFilterOptions,
        size: 140,
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
        Cell: ({ cell, row }) => (
          <ETParagraph enableEllipsis={true}>
            {dateUtils.formatDate(cell.getValue<string>(), MONTH_DAY_YEAR)}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "end_date",
        size: 140,
        header: "End Date",
        filterVariant: "multi-select",
        filterSelectOptions: endDateFilterOptions,
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
          <ETParagraph enableEllipsis={true}>
            {cell.getValue<string>() &&
              dateUtils.formatDate(
                String(cell.getValue<string>()),
                MONTH_DAY_YEAR
              )}
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
              <ETParagraph>
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
      {
        accessorKey: "assigned",
        header: "Assigned",
        accessorFn: (row) =>
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
        accessorKey: "notes",
        header: "Notes",
        size: 250,
        filterFn: searchFilter,
        sortingFn: "sortFn",
        Cell: ({ cell, row }) => (
          <ETParagraph
            enableEllipsis
            enableTooltip
            tooltip={getTextFromDraftJsContentState(cell.getValue<string>())}
          >
            {getTextFromDraftJsContentState(cell.getValue<string>())}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "work.title",
        header: "Work",
        filterVariant: "multi-select",
        filterSelectOptions: work,
        Cell: ({ cell, row, renderedCellValue }) => (
          <ETParagraph
            enableEllipsis
            enableTooltip
            tooltip={row.original.work.title}
          >
            {row.original.work.title}
          </ETParagraph>
        ),
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
        sortingFn: "sortFn",
      },
    ],
    [myTasks, work, assigned, startDates, endDates, progress]
  );

  const handleCacheFilters = (filters?: ColumnFilter[]) => {
    if (!filters) {
      return;
    }
    setColumnFilters(filters);
  };

  return (
    <>
      <ETPageContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
          <MasterTrackTable
            columns={columns}
            data={myTasks}
            initialState={{
              sorting: [{ id: "start_date", desc: false }],
              columnFilters,
            }}
            state={{
              isLoading: ctx.loading,
              showGlobalFilter: true,
            }}
            onCacheFilters={handleCacheFilters}
          />
        </Grid>
      </ETPageContainer>
      <MyTaskDialog
        data={{
          open: showModalForm,
          setOpen: setShowModalForm,
          task,
          setTask,
          saveMyTaskCallback: getMyTasks,
        }}
      />
    </>
  );
}
