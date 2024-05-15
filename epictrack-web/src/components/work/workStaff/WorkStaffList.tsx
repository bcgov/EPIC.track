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
  const [wsData, setwsData] = React.useState<WorkStaff[]>([]);
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
        setwsData(workStaffingResult.data as WorkStaff[]);
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
  wsData.forEach((value, index) => {
    if (value.staff.length > 0) {
      const roles = value.staff
        .filter(
          (p) =>
            ![WorkStaffRole.TEAM_LEAD, WorkStaffRole.RESPONSIBLE_EPD].includes(
              p.role.id
            )
        )
        .map((p) => p.role.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
      uniquestaff = [...uniquestaff, ...roles].filter(
        (ele, index, arr) => arr.findIndex((t) => t === ele) === index
      );
    }
  });

  const setRoleColumns = React.useCallback(() => {
    let columns: Array<MRT_ColumnDef<WorkStaff>> = [];
    if (wsData && wsData.length > 0) {
      columns = uniquestaff.map((rolename: any, index: number) => {
        return {
          header: rolename,
          accessorFn: (row: any) =>
            `${row.staff
              .filter((p: { role: { name: any } }) => p.role.name === rolename)
              .map(
                (p: { first_name: string; last_name: string }) =>
                  `${p.last_name} ${p.first_name}`
              )
              .join(", ")}`,
          enableHiding: false,
          enableColumnFilter: true,
          Cell: ({ row, renderedCellValue }) => {
            const staff = row.original.staff
              .filter((p: { role: { name: any } }) => p.role.name === rolename)
              .map(
                (p: { first_name: string; last_name: string }) =>
                  `${p.last_name} ${p.first_name}`
              )
              .join(", ");

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
  }, [wsData, uniquestaff]);

  const projectFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.project && p.project.name)
        .map((p) => p.project.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const titleFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.title)
        .map((p) => p.title)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const teamFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.eao_team)
        .map((p) => p.eao_team.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const responsibleEpdFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.responsible_epd)
        .map(
          (p) =>
            `${p.responsible_epd.first_name} ${p.responsible_epd.last_name}`
        )
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const workLeadFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.responsible_epd)
        .map((p) => `${p.work_lead?.first_name} ${p.work_lead?.last_name}`)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
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
        Cell: ({ renderedCellValue }) => {
          return renderedCellValue;
        },
      },
      {
        accessorKey: "eao_team.name",
        header: "Team",
        filterVariant: "multi-select",
        filterSelectOptions: teamFilter,
        Cell: ({ renderedCellValue }) => {
          return renderedCellValue;
        },
      },
      {
        accessorFn: (row: WorkStaff) =>
          row.work_lead
            ? `${row.work_lead?.first_name} ${row.work_lead?.last_name}`
            : "",
        header: "Work Lead",
        filterVariant: "multi-select",
        filterSelectOptions: workLeadFilter,
        Cell: ({ renderedCellValue }) => {
          return renderedCellValue;
        },
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
          data={wsData}
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
          renderTopToolbarCustomActions={({ table }) => (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "right",
              }}
            >
              <Tooltip title="Export to csv">
                <IButton
                  onClick={() =>
                    exportToCsv({
                      table,
                      downloadDate: new Date().toISOString(),
                      filenamePrefix: "work-staff-listing",
                    })
                  }
                >
                  <DownloadIcon className="icon" />
                </IButton>
              </Tooltip>
            </Box>
          )}
          onCacheFilters={handleCacheFilters}
        />
      </Grid>
    </ETPageContainer>
  );
};

export default WorkStaffList;
