import { useCallback, useEffect, useMemo, useState } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Grid } from "@mui/material";
import { WorkStaff } from "../../../models/workStaff";
import { workService } from "../../../services/workService/workService";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { useCachedState } from "hooks/useCachedFilters";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { ETGridTitle, ETPageContainer, ETParagraph } from "components/shared";
import { WorkStaffRole } from "models/role";
import { getSelectFilterOptions } from "components/shared/MasterTrackTable/utils";
import { getStatusFilter } from "components/shared/filterSelect/utils";
import { ETChip } from "components/shared/chip/ETChip";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import { WORK_STATE } from "components/shared/constants";

const workStaffListColumnFiltersCacheKey = "work-staff-listing-column-filters";
const WorkStaffList = () => {
  const [workStaffData, setWorkStaffData] = useState<WorkStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [workStates, setWorkStates] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    workStaffListColumnFiltersCacheKey,
    [],
  );

  const getWorkStaffAllocation = useCallback(async () => {
    setLoading(true);
    try {
      const workStaffingResult = await workService.getWorkStaffDetails();
      if (workStaffingResult.status === 200) {
        setWorkStaffData(workStaffingResult.data as WorkStaff[]);
      }
    } catch (error) {
      console.error("Work Staffing List: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getWorkStaffAllocation();
  }, [getWorkStaffAllocation]);

  const uniquestaff = useMemo(() => {
    const uniqueRoles = new Set<string>();

    workStaffData.forEach((value) => {
      if (value.staff.length > 0) {
        value.staff
          .filter(
            (person) =>
              ![
                WorkStaffRole.TEAM_LEAD,
                WorkStaffRole.RESPONSIBLE_EPD,
              ].includes(person.role.id),
          )
          .forEach((person) => uniqueRoles.add(person.role.name));
      }
    });

    return Array.from(uniqueRoles);
  }, [workStaffData]);

  const setRoleColumns = useCallback(() => {
    let columns: Array<MRT_ColumnDef<WorkStaff>> = [];
    if (workStaffData && workStaffData.length > 0) {
      columns = uniquestaff.map((rolename: any, index: number) => {
        return {
          header: rolename,
          accessorFn: (row: any) =>
            `${row.staff
              .filter(
                (person: { role: { name: any } }) =>
                  person.role.name === rolename,
              )
              .map(
                (person: { first_name: string; last_name: string }) =>
                  `${person.last_name} ${person.first_name}`,
              )
              .join("; ")}`,
          enableHiding: false,
          enableColumnFilter: true,
          Cell: ({ row, renderedCellValue }) => {
            const staff = row.original.staff
              .filter(
                (person: { role: { name: any } }) =>
                  person.role.name === rolename,
              )
              .map(
                (person: { first_name: string; last_name: string }) =>
                  `${person.last_name} ${person.first_name}`,
              )
              .join("; ");

            return (
              <ETParagraph enableTooltip enableEllipsis tooltip={staff}>
                {renderedCellValue}
              </ETParagraph>
            );
          },
        } as MRT_ColumnDef<WorkStaff>;
      });
    }
    return columns;
  }, [workStaffData, uniquestaff]);

  const statuses = getSelectFilterOptions(
    workStaffData,
    "is_active",
    (value) => (value ? "Active" : "Inactive"),
    (value) => value,
  );

  useEffect(() => {
    if (!workStaffData.length) return;
    const options = workStaffData
      .map(
        (w) =>
          WORK_STATE[w.work_state as keyof typeof WORK_STATE]?.label ||
          w.work_state,
      )
      .filter(
        (element, index, array) => element && array.indexOf(element) === index,
      );
    setWorkStates(options);
  }, [workStaffData]);

  const projectFilter = useMemo(
    () =>
      workStaffData
        .filter((person) => person.project && person.project.name)
        .map((person) => person.project.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData],
  );

  const titleFilter = useMemo(
    () =>
      workStaffData
        .filter((p) => p.title)
        .map((p) => p.title)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData],
  );

  const teamFilter = useMemo(
    () =>
      workStaffData
        .filter((person) => person.eao_team)
        .map((person) => person.eao_team.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData],
  );

  const responsibleEpdFilter = useMemo(
    () =>
      workStaffData
        .filter((person) => person.responsible_epd)
        .map(
          (person) =>
            `${person.responsible_epd.first_name} ${person.responsible_epd.last_name}`,
        )
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData],
  );

  const workLeadFilter = useMemo(
    () =>
      workStaffData
        .filter((person) => person.responsible_epd)
        .map(
          (person) =>
            `${person.work_lead?.first_name} ${person.work_lead?.last_name}`,
        )
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData],
  );

  const columns = useMemo<MRT_ColumnDef<WorkStaff>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Work Title",
        filterVariant: "multi-select",
        filterSelectOptions: titleFilter,
        Cell: ({ row, renderedCellValue }) => {
          return (
            <ETGridTitle
              to={`/work-plan?work_id=${row.original.id}`}
              enableTooltip
              enableEllipsis={true}
              tooltip={row.original.title}
            >
              {renderedCellValue}
            </ETGridTitle>
          );
        },
      },
      {
        accessorKey: "work_state",
        header: "Work State",
        size: 80,
        filterVariant: "multi-select",
        filterSelectOptions: workStates,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="stateFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (!filterValue.length || !filterValue.length) {
            return true;
          }
          if (
            workStates.length > 0 &&
            filterValue.length >= workStates.length
          ) {
            return true; // "select all" case
          }
          const value: string = row.getValue(id) || "";
          const label = WORK_STATE[value as keyof typeof WORK_STATE]?.label;
          return filterValue.includes(label);
        },
        Cell: ({ cell }) => {
          const stateValue = cell.getValue<keyof typeof WORK_STATE>();
          return <span>{WORK_STATE[stateValue]?.label ?? stateValue}</span>;
        },
      },
      {
        accessorKey: "is_active",
        header: "Work Status",
        size: 75,
        filterVariant: "multi-select",
        filterSelectOptions: statuses,
        filterFn: "multiSelectFilter",
        Filter: getStatusFilter<WorkStaff>,
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
      },
      {
        accessorKey: "project.name",
        header: "Project",
        enableHiding: false,
        filterVariant: "multi-select",
        filterSelectOptions: projectFilter,
        Cell: ({ row, renderedCellValue }) => {
          return (
            <ETParagraph
              enableTooltip
              enableEllipsis
              tooltip={row.original.project.name}
            >
              {renderedCellValue}
            </ETParagraph>
          );
        },
      },
      {
        accessorFn: (row: WorkStaff) =>
          row.responsible_epd
            ? `${row.responsible_epd?.first_name} ${row.responsible_epd?.last_name}`
            : "",
        header: "Responsible EPD",
        filterVariant: "multi-select",
        filterSelectOptions: responsibleEpdFilter,
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
      projectFilter,
      responsibleEpdFilter,
      setRoleColumns,
      statuses,
      teamFilter,
      titleFilter,
      workLeadFilter,
      workStates,
    ],
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
          }}
          loading={loading}
          state={{
            isLoading: loading,
            showGlobalFilter: true,
            columnFilters,
          }}
          renderResultCount
          tableName={"work-staff-listing"}
          enableExport
          onCacheFilters={handleCacheFilters}
        />
      </Grid>
    </ETPageContainer>
  );
};

export default WorkStaffList;
