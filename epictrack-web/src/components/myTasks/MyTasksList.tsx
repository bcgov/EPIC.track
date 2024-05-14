import React, { useContext, useEffect, useMemo, useState } from "react";
import { Avatar, Box, Grid, Stack, Typography } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETCaption2, ETGridTitle, ETPageContainer } from "../shared";
import { Staff } from "../../models/staff";
import staffService from "../../services/staffService/staffService";
import { Proponent } from "../../models/proponent";
import { MasterContext } from "../shared/MasterContext";
import proponentService from "../../services/proponentService/proponentService";
import { ETChip } from "../shared/chip/ETChip";
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import TableFilter from "../shared/filterSelect/TableFilter";
import { hasPermission } from "../shared/restricted";
import { ROLES } from "../../constants/application-constant";
import { searchFilter } from "../shared/MasterTrackTable/filters";
import { useAppSelector } from "../../hooks";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { Palette } from "styles/theme";
import { debounce } from "lodash";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { useCachedState } from "hooks/useCachedFilters";
import taskEventService from "services/taskEventService/taskEventService";
import { MyTask } from "models/task";

const proponentsListColumnFiltersCacheKey = "proponents-listing-column-filters";

export default function MyTasksList() {
  const user = useAppSelector((state) => state.user.userDetail);
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    proponentsListColumnFiltersCacheKey,
    [
      {
        id: "progress",
        value: ["In Progress", "Not Started"],
      },
      {
        id: "assigned",
        value: [user.lastName + ", " + user.firstName],
      },
    ]
  );
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const ctx = useContext(MasterContext);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState<[]>([]);
  const [startDates, setStartDates] = useState<[]>([]);
  const [endDates, setEndDates] = useState<[]>([]);
  const [progress, setProgress] = useState<[]>([]);
  const [assigned, setAssigned] = useState<[]>([]);
  const [work, setWork] = useState<[]>([]);

  const getMyTasks = async (): Promise<MyTask[]> => {
    const result: [] = [];
    try {
      const taskResult = await taskEventService.getMyTasks(
        Number(user.staffId)
      );

      if (taskResult.status === 200) {
        console.log("taskResult", taskResult.data);
        setMyTasks(taskResult.data as never);
      }
    } catch (e) {
      setLoading(false);
    }
    return Promise.resolve(result);
  };

  useEffect(() => {
    ctx.setForm(<></>);
  }, []);

  const onEdit = (id: number) => {
    ctx.setShowModalForm(true);
  };

  useEffect(() => {
    getMyTasks();
  }, []);

  const progressOptions = getSelectFilterOptions(
    myTasks,
    "is_active",
    (value) => (value ? "In Progress" : "Not Started"),
    (value) => value
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
      if (key == "work") {
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
        accessorKey: "title",
        header: "Task",
        Cell: canEdit
          ? ({ cell, row, renderedCellValue }) => (
              <ETGridTitle
                to={"#"}
                onClick={() => onEdit(row.original.id)}
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
        accessorKey: "work.start_date",
        header: "Start Date",
        sortingFn: "sortFn",
        filterFn: searchFilter,
        filterVariant: "multi-select",
        filterSelectOptions: endDates,
      },
      {
        accessorKey: "work.end_date",
        header: "End Date",
        sortingFn: "sortFn",
        filterVariant: "multi-select",
        filterSelectOptions: startDates,
        filterFn: searchFilter,
      },
      {
        accessorKey: "name",
        header: "Progress",
        filterVariant: "multi-select",
        filterSelectOptions: progress,
        Cell: ({ cell, row, renderedCellValue }) => renderedCellValue,
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "name",
        header: "Assigned",
        filterVariant: "multi-select",
        filterSelectOptions: assigned,
        Cell: ({ cell, row, renderedCellValue }) =>
          user.lastName + ", " + user.firstName,
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "name",
        header: "Notes",
        Cell: canEdit
          ? ({ cell, row, renderedCellValue }) => (
              <ETGridTitle
                to={"#"}
                onClick={() => onEdit(row.original.id)}
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
        accessorKey: "work.title",
        header: "Work",
        filterVariant: "multi-select",
        filterSelectOptions: work,
        Cell: ({ cell, row, renderedCellValue }) => renderedCellValue,
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
    ],
    [staffs, myTasks, work, assigned, startDates, endDates, progress]
  );

  const getStaffs = async () => {
    try {
      const staffsResult = await staffService.getAll();
      if (staffsResult.status === 200) {
        setStaffs(staffsResult.data as never);
      }
    } catch (error) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };
  useEffect(() => {
    getStaffs();
  }, []);

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
              sorting: [
                {
                  id: "name",
                  desc: false,
                },
                { id: "work.start_date", desc: false },
              ],
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
    </>
  );
}
