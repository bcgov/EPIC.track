import React, { useEffect, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { ETGridTitle, IButton } from "components/shared";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { WorkStaff } from "models/workStaff";
import { useGetWorkStaffsQuery } from "services/rtkQuery/workStaffInsights";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { Tooltip, Box } from "@mui/material";
import { sort } from "utils";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { WorkStaffRole } from "models/role";
import { useInsightsContext } from "components/insights/InsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const WorkList = () => {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  });
  const { columnFilters, setColumnFilters } = useTableFilterContext();
  const { isUserInsights, staffId } = useInsightsContext();

  const { data: workStaffs, isLoading } = useGetWorkStaffsQuery();

  const workData = useMemo(() => {
    const visible = (workStaffs ?? []).filter((workStaff) =>
      isUserInsights
        ? workStaff.staff
            .map((staff) => staff.id)
            ?.includes(staffId ? staffId : -1)
        : true,
    );
    return sort([...visible], "title");
  }, [isUserInsights, staffId, workStaffs]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: workData.length || prev.pageSize,
    }));
  }, [workData]);

  const workLeads = useMemo(() => {
    return Array.from(
      new Set(
        workStaffs?.map((workStaff) => workStaff.work_lead.full_name).sort() ||
          [],
      ),
    );
  }, [workStaffs]);

  const teams = useMemo(() => {
    return Array.from(
      new Set(
        workStaffs?.map((workStaff) => workStaff.eao_team.name).sort() || [],
      ),
    );
  }, [workStaffs]);

  const columns = React.useMemo<MRT_ColumnDef<WorkStaff>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: "Name",
        size: 200,
        Cell: ({ row, renderedCellValue }) => {
          return (
            <ETGridTitle
              to={`/work-plan?work_id=${row.original.id}`}
              enableTooltip
              tooltip={row.original.title}
            >
              {renderedCellValue}
            </ETGridTitle>
          );
        },
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "eao_team.name",
        header: "Team",
        size: 80,
        filterVariant: "multi-select",
        filterSelectOptions: teams,
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
            filterValue.length > teams.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "work_lead.full_name",
        header: "Lead",
        size: 100,
        filterVariant: "multi-select",
        filterSelectOptions: workLeads,
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
            filterValue.length > workLeads.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorFn: (row) =>
          row.staff
            ?.filter(
              (s) =>
                s.role.id !== WorkStaffRole.RESPONSIBLE_EPD &&
                s.role.id !== WorkStaffRole.TEAM_LEAD,
            )
            .map((s) => `${s.first_name} ${s.last_name}`)
            .join(", ") || "",
        id: "staff",
        header: "Staff",
        size: 200,
        Cell: ({ row }) => {
          const staffList = row.original.staff
            ?.filter(
              (s) =>
                s.role.id !== WorkStaffRole.RESPONSIBLE_EPD &&
                s.role.id !== WorkStaffRole.TEAM_LEAD,
            )
            .map((s) => `${s.first_name} ${s.last_name}`)
            .join(", ");
          return <span>{staffList}</span>;
        },
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value: string = row.getValue(id) || "";
          return value.toLowerCase().includes(filterValue.toLowerCase());
        },
      },
    ];
  }, [workLeads, teams]);

  return (
    <MasterTrackTable
      columns={columns}
      data={workData}
      initialState={{
        sorting: [
          {
            id: "title",
            desc: false,
          },
        ],
      }}
      loading={isLoading}
      onColumnFiltersChange={setColumnFilters}
      state={{
        isLoading: isLoading,
        showGlobalFilter: true,
        pagination: pagination,
        columnFilters,
      }}
      renderResultCount
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
                  filenamePrefix: "staff-insights-listing",
                })
              }
            >
              <DownloadIcon className="icon" />
            </IButton>
          </Tooltip>
        </Box>
      )}
      enablePagination
      muiPaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(workData.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default WorkList;
