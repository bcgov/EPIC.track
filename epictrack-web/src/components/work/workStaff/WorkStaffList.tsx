import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Grid } from "@mui/material";
import { WorkStaff } from "../../../models/workStaff";
import workService from "../../../services/workService/workService";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { useCachedState } from "hooks/useCachedFilters";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { ETPageContainer } from "components/shared";
import { Work } from "models/work";

const workStaffListColumnFiltersCacheKey = "work-staff-listing-column-filters";
const WorkStaffList = () => {
  const [workStaffData, setWorkStaffData] = React.useState<WorkStaff[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    workStaffListColumnFiltersCacheKey,
    []
  );

  const getWorkStaffAllocation = React.useCallback(async () => {
    setLoading(true);
    try {
      const workStaffingResult = await workService.getWorkStaffDetails();
      const worksResult = await workService.getAll();
      if (workStaffingResult.status === 200 && worksResult.status === 200) {
        const mergedData = (workStaffingResult.data as WorkStaff[])
          .map((workStaff: WorkStaff) => {
            const work = (worksResult.data as Work[]).find(
              (w: Work) => w.eao_team_id === workStaff.eao_team.id
            );
            if (!work) {
              return null;
            }
            return { ...workStaff, title: work.title };
          })
          .filter(Boolean) as WorkStaff[];
        setWorkStaffData(mergedData);
      }
    } catch (error) {
      console.error("Work Staffing List: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    getWorkStaffAllocation();
  }, []);

  let uniquestaff: any[] = [];
  workStaffData.forEach((value, index) => {
    if (value.staff.length > 0) {
      const roles = value.staff
        .map((p) => p.role.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
      uniquestaff = [...uniquestaff, ...roles].filter(
        (ele, index, arr) => arr.findIndex((t) => t === ele) === index
      );
    }
  });
  const setRoleColumns = React.useCallback(() => {
    let columns: Array<MRT_ColumnDef<WorkStaff>> = [];
    if (workStaffData && workStaffData.length > 0) {
      columns = uniquestaff.map((rolename: any, index: number) => {
        return {
          header: rolename,
          accessorFn: (row: any) =>
            `${row.staff
              .filter((p: { role: { name: any } }) => p.role.name === rolename)
              .map(
                (p: { first_name: string; last_name: string }) =>
                  `${p.first_name} ${p.last_name}`
              )
              .join(", ")}`,
          enableHiding: false,
          enableColumnFilter: true,
        } as MRT_ColumnDef<WorkStaff>;
      });
    }
    return columns;
  }, [workStaffData]);

  const projectFilter = React.useMemo(
    () =>
      workStaffData
        .filter((p) => p.project && p.project.name)
        .map((p) => p.project.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData]
  );

  const titleFilter = React.useMemo(
    () =>
      workStaffData
        .filter((p) => p.title)
        .map((p) => p.title)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData]
  );

  const teamFilter = React.useMemo(
    () =>
      workStaffData
        .filter((p) => p.eao_team)
        .map((p) => p.eao_team.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData]
  );

  const responsibleEpdFilter = React.useMemo(
    () =>
      workStaffData
        .filter((p) => p.responsible_epd)
        .map(
          (p) =>
            `${p.responsible_epd.first_name} ${p.responsible_epd.last_name}`
        )
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData]
  );

  const workLeadFilter = React.useMemo(
    () =>
      workStaffData
        .filter((p) => p.responsible_epd)
        .map((p) => `${p.work_lead?.first_name} ${p.work_lead?.last_name}`)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData]
  );

  const columns = React.useMemo<MRT_ColumnDef<WorkStaff>[]>(
    () => [
      {
        accessorKey: "project.name",
        header: "Project",
        enableHiding: false,
        filterVariant: "multi-select",
        filterSelectOptions: projectFilter,
      },
      {
        accessorKey: "title",
        header: "Work Title",
        filterVariant: "multi-select",
        filterSelectOptions: titleFilter,
      },
      {
        accessorKey: "eao_team.name",
        header: "Team",
        filterVariant: "multi-select",
        filterSelectOptions: teamFilter,
      },
      {
        accessorFn: (row: WorkStaff) =>
          row.work_lead
            ? `${row.work_lead?.first_name} ${row.work_lead?.last_name}`
            : "",
        header: "Work Lead",
        filterVariant: "multi-select",
        filterSelectOptions: workLeadFilter,
      },
      ...setRoleColumns(),
    ],
    [
      setRoleColumns,
      titleFilter,
      teamFilter,
      responsibleEpdFilter,
      workLeadFilter,
    ]
  );

  const handleCacheFilters = (filters?: ColumnFilter[]) => {
    if (!filters) {
      return;
    }
    setColumnFilters(filters);
  };

  return (
    <ETPageContainer direction="row" container columnSpacing={2} rowSpacing={3}>
      <Grid item xs={12}>
        <MasterTrackTable
          columns={columns}
          data={workStaffData}
          initialState={{
            sorting: [
              {
                id: "title",
                desc: false,
              },
            ],
            columnFilters,
          }}
          state={{
            isLoading: loading,
            showGlobalFilter: true,
          }}
          onCacheFilters={handleCacheFilters}
        />
      </Grid>
    </ETPageContainer>
  );
};

export default WorkStaffList;
