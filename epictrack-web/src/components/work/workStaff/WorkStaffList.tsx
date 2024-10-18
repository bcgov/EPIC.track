import React, { useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Box, Grid, IconButton, Tooltip } from "@mui/material";
import { WorkStaff } from "../../../models/workStaff";
import workService from "../../../services/workService/workService";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { useCachedState } from "hooks/useCachedFilters";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import {
  ETGridTitle,
  ETPageContainer,
  ETParagraph,
  IButton,
} from "components/shared";
import { WorkStaffRole } from "models/role";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

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
      if (workStaffingResult.status === 200) {
        setWorkStaffData(workStaffingResult.data as WorkStaff[]);
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
        .filter(
          (person) =>
            ![WorkStaffRole.TEAM_LEAD, WorkStaffRole.RESPONSIBLE_EPD].includes(
              person.role.id
            )
        )
        .map((person) => person.role.name)
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
              .filter(
                (person: { role: { name: any } }) =>
                  person.role.name === rolename
              )
              .map(
                (person: { first_name: string; last_name: string }) =>
                  `${person.last_name} ${person.first_name}`
              )
              .join("; ")}`,
          enableHiding: false,
          enableColumnFilter: true,
          Cell: ({ row, renderedCellValue }) => {
            const staff = row.original.staff
              .filter(
                (person: { role: { name: any } }) =>
                  person.role.name === rolename
              )
              .map(
                (person: { first_name: string; last_name: string }) =>
                  `${person.last_name} ${person.first_name}`
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

  const projectFilter = React.useMemo(
    () =>
      workStaffData
        .filter((person) => person.project && person.project.name)
        .map((person) => person.project.name)
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
        .filter((person) => person.eao_team)
        .map((person) => person.eao_team.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData]
  );

  const responsibleEpdFilter = React.useMemo(
    () =>
      workStaffData
        .filter((person) => person.responsible_epd)
        .map(
          (person) =>
            `${person.responsible_epd.first_name} ${person.responsible_epd.last_name}`
        )
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData]
  );

  const workLeadFilter = React.useMemo(
    () =>
      workStaffData
        .filter((person) => person.responsible_epd)
        .map(
          (person) =>
            `${person.work_lead?.first_name} ${person.work_lead?.last_name}`
        )
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [workStaffData]
  );

  const columns = React.useMemo<MRT_ColumnDef<WorkStaff>[]>(
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
              titleText={row.original.title}
              enableTooltip
              enableEllipsis
              tooltip={row.original.title}
            >
              {renderedCellValue}
            </ETGridTitle>
          );
        },
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
          tableName={"work-staff-listing"}
          enableExport
          onCacheFilters={handleCacheFilters}
        />
      </Grid>
    </ETPageContainer>
  );
};

export default WorkStaffList;
