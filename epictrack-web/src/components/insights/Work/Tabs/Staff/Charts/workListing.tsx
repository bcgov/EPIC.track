import React, { useEffect, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { ETGridTitle, IButton } from "components/shared";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { WorkStaff } from "models/workStaff";
import { useGetWorkStaffsQuery } from "services/rtkQuery/workStaffInsights";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { Tooltip, Box } from "@mui/material";
import { sort } from "utils";
import { useGetWorksQuery } from "services/rtkQuery/workInsights";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

type WorkStaffWithWork = WorkStaff & { work: Work };

const WorkList = () => {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [workData, setWorkData] = React.useState<WorkStaffWithWork[]>([]);

  const { data: workStaffs, isLoading } = useGetWorkStaffsQuery();
  const { data: works } = useGetWorksQuery();

  useEffect(() => {
    if (workStaffs && works) {
      const mergedData = workStaffs
        .map((workStaff) => {
          const work = works.find(
            (w) => w.eao_team_id === workStaff.eao_team.id
          );
          if (!work) {
            return null;
          }
          return { ...workStaff, work };
        })
        .filter(Boolean) as WorkStaffWithWork[];
      setWorkData(sort(mergedData, "work.title"));
      setPagination((prev) => ({
        ...prev,
        pageSize: workStaffs.length,
      }));
    }
  }, [workStaffs, works]);

  const workLeads = useMemo(() => {
    return (
      workStaffs
        ?.map((workStaff) => workStaff.work_lead.full_name)
        .filter((lead) => lead)
        .sort() || []
    );
  }, [workStaffs]);

  const teams = useMemo(() => {
    return (
      workStaffs
        ?.map((workStaff) => workStaff.eao_team.name)
        .filter((team) => team)
        .sort() || []
    );
  }, [workStaffs]);

  const columns = React.useMemo<MRT_ColumnDef<WorkStaffWithWork>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: "Name",
        size: 200,
        Cell: ({ row, renderedCellValue }) => {
          return (
            <ETGridTitle
              to={`/work-plan?work_id=${row.original.id}`}
              titleText={row.original.title}
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
    ];
  }, [workLeads, teams, workStaffs]);
  return (
    <MasterTrackTable
      columns={columns}
      data={workData || []}
      initialState={{
        sorting: [
          {
            id: "title",
            desc: false,
          },
        ],
      }}
      state={{
        isLoading: isLoading,
        showGlobalFilter: true,
        pagination: pagination,
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
        rowsPerPageOptions: rowsPerPageOptions(workStaffs?.length || 0),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default WorkList;
