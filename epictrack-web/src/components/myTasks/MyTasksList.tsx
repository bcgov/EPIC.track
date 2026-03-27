import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Box, Button, Grid } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import { Switch, Case } from "react-if";
import { ETGridTitle, ETPageContainer, ETParagraph } from "components/shared";
import MasterTrackTable from "components/shared/MasterTrackTable";
import TrackDialog from "components/shared/TrackDialog";
import { MasterContext } from "components/shared/MasterContext";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import {
  BLANK_OPTION,
  getSelectFilterOptions,
} from "components/shared/MasterTrackTable/utils";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import { hasPermission } from "components/shared/restricted";
import { getTextFromDraftJsContentState } from "components/shared/richTextEditor/utils";
import { showNotification } from "components/shared/notificationProvider";
import TaskForm from "components/workPlan/task/TaskForm";
import Icons from "components/icons";
import {
  CompletedIcon,
  InProgressIcon,
  NotStartedIcon,
} from "components/icons/status";
import { IconProps } from "components/icons/type";
import { MONTH_DAY_YEAR, ROLES } from "constants/application-constant";
import { MyTask } from "models/task";
import { EVENT_STATUS, statusOptions, TaskEvent } from "models/taskEvent";
import { taskEventService } from "services/taskEventService/taskEventService";
import { useAppSelector } from "hooks";
import { useCachedState } from "hooks/useCachedFilters";
import { dateUtils } from "utils";
import { Palette } from "styles/theme";

const myTasksListColumnFiltersCacheKey = "myTasks-listing-column-filters";
const DeleteIcon: FC<IconProps> = Icons["DeleteIcon"];

function myTaskToTaskEvent(myTask: MyTask): TaskEvent {
  return {
    id: myTask.id,
    name: myTask.name,
    work_phase_id: myTask.work_phase_id,
    start_date: myTask.start_date,
    number_of_days: myTask.number_of_days,
    tips: myTask.tips,
    notes: myTask.notes,
    assignee_ids: myTask.assignees.map((a) => a.assignee_id.toString()),
    responsibility_ids: myTask.responsibilities
      .filter((r) => r.is_active)
      .map((r) => r.responsibility_id.toString()),
    status: myTask.status,
  };
}

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
    ],
  );
  const ctx = useContext(MasterContext);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [task, setTask] = useState<MyTask | null>(null);
  const [showModalForm, setShowModalForm] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  const taskEvent = useMemo(
    () => (task ? myTaskToTaskEvent(task) : undefined),
    [task],
  );

  const getMyTasks = useCallback(async (): Promise<MyTask[]> => {
    const result: [] = [];
    try {
      const taskResult = await taskEventService.getMyTasks(
        Number(user.staffId),
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
      console.log("Error fetching my tasks", e);
    }
    return Promise.resolve(result);
  }, [user.staffId, setMyTasks]);

  useEffect(() => {
    ctx.setForm(<></>);
  }, [ctx]);

  const handleEdit = (task: MyTask) => {
    setTask(task);
    setShowModalForm(true);
  };

  useEffect(() => {
    getMyTasks();
  }, [getMyTasks]);

  const deleteTasks = async () => {
    const response = await taskEventService.deleteTasks({
      task_ids: task?.id ? task.id : null,
      work_id: task?.work?.id,
    });
    try {
      if (response.status === 200) {
        showNotification("Deleted successfully", {
          type: "success",
        });
        onSaveHandler();
      }
    } catch (e) {
      showNotification("Failed to delete Task", {
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleDelete = () => {
    deleteTasks();
    setShowDeleteDialog(false);
  };

  const deleteAction = (
    <>
      {task && (
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
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </Box>
      )}
    </>
  );

  const onSaveHandler = () => {
    setShowModalForm(false);
    setTask(null);
    getMyTasks();
  };

  const onCancelHandler = () => {
    setShowModalForm(false);
    setTask(null);
  };

  const statusFilterOptions = getSelectFilterOptions(
    myTasks,
    "status",
    (value) =>
      statusOptions.find((statusOption) => statusOption.value === value)
        ?.label ?? BLANK_OPTION,
  );

  const startDateFilterOptions = getSelectFilterOptions(
    myTasks,
    "start_date",
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
  );

  const endDateFilterOptions = getSelectFilterOptions(
    myTasks,
    "end_date",
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
    (value) => dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
  );

  const workFilterOptions = getSelectFilterOptions(
    myTasks,
    "work",
    (value) => value?.title || BLANK_OPTION,
    (value) => value?.title || "",
  );

  const assigneeOptions = Array.from(
    new Set(
      myTasks
        .map((task) => task.assignees || [""])
        .flat()
        .map((assignee) =>
          assignee
            ? `${assignee.assignee.first_name} ${assignee.assignee.last_name}`
            : BLANK_OPTION,
        ),
    ),
  );

  const columns = useMemo<MRT_ColumnDef<MyTask>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Task",
        size: 300,
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
            dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
          );
        },
        Cell: ({ cell, row }) => (
          <ETParagraph>
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
              : dateUtils.formatDate(String(value), MONTH_DAY_YEAR),
          );
        },
        Cell: ({ cell, row }) => (
          <ETParagraph>
            {cell.getValue<string>() &&
              dateUtils.formatDate(
                String(cell.getValue<string>()),
                MONTH_DAY_YEAR,
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
                    (statusOption) => statusOption.value === value,
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
            renderedValue.includes(filterName),
          );
        },
        filterSelectOptions: assigneeOptions,
        size: 140,
        Cell: ({ cell, row }) => {
          return (
            <ETParagraph enableTooltip tooltip={cell.getValue<string>()}>
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
        filterSelectOptions: workFilterOptions,
        Cell: ({ cell, row, renderedCellValue }) => (
          <ETParagraph enableTooltip tooltip={row.original.work.title}>
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
    [
      assigneeOptions,
      canEdit,
      endDateFilterOptions,
      startDateFilterOptions,
      statusFilterOptions,
      workFilterOptions,
    ],
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
            }}
            state={{
              isLoading: ctx.loading,
              showGlobalFilter: true,
              columnFilters,
            }}
            onCacheFilters={handleCacheFilters}
          />
        </Grid>
        <TrackDialog
          open={showModalForm}
          dialogTitle={task ? task?.name : "Add Task"}
          disableEscapeKeyDown
          fullWidth
          maxWidth="md"
          okButtonText="Save"
          cancelButtonText="Cancel"
          isActionsRequired
          onCancel={() => onCancelHandler()}
          formId="task-form"
          additionalActions={deleteAction}
          heading={task?.work.title}
        >
          <TaskForm
            key={task?.id || "new"}
            onSave={onSaveHandler}
            taskEvent={taskEvent}
            work_id={task?.work.id}
            phase_id={task?.work_phase_id}
          />
        </TrackDialog>
        <TrackDialog
          open={showDeleteDialog}
          dialogTitle="Delete"
          dialogContentText="Are you sure you want to delete this task?"
          okButtonText="Yes"
          cancelButtonText="No"
          isActionsRequired
          onCancel={() => setShowDeleteDialog(!showDeleteDialog)}
          onOk={() => handleDelete()}
        />
      </ETPageContainer>
    </>
  );
}
