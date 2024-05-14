import React, { useCallback, useEffect } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { useAppSelector } from "hooks";
import { hasPermission } from "components/shared/restricted";
import { ROLES } from "constants/application-constant";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { ETGridTitle, IButton } from "components/shared";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { WorkStaff } from "models/workStaff";
import { Role, WorkStaffRole, WorkStaffRoleNames } from "models/role";
import { useGetWorkStaffsQuery } from "services/rtkQuery/workStaffInsights";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { FileDownload } from "@mui/icons-material";
import { IconButton, Tooltip, Box } from "@mui/material";
import { sort } from "utils";
import { useGetWorksQuery } from "services/rtkQuery/workInsights";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

type WorkStaffWithWork = WorkStaff & { work: Work };

const WorkList = () => {
  const [workTypes, setWorkTypes] = React.useState<string[]>([]);
  const [leads, setLeads] = React.useState<string[]>([]);
  const [teams, setTeams] = React.useState<string[]>([]);
  const [workRoles, setWorkRoles] = React.useState<
    MRT_ColumnDef<WorkStaffWithWork>[]
  >([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const [workData, setWorkData] = React.useState<WorkStaffWithWork[]>([]);

  const { data: workStaffs, error, isLoading } = useGetWorkStaffsQuery();
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

  const filteredStaffByPosition = useCallback(
    (position: WorkStaffRole) => {
      if (!workStaffs) return [];
      const staff = workStaffs.flatMap((row: any) =>
        row.staff
          ? row.staff.filter((p: { role: Role }) => p.role.id === position)
          : []
      );
      const staffSorted = sort(staff, "full_name");
      const uniqueStaffNames = Array.from(
        new Set(
          staffSorted.map(
            (staffEntry: any) =>
              `${staffEntry.last_name}, ${staffEntry.first_name}`
          )
        )
      );
      return uniqueStaffNames;
    },
    [workStaffs]
  );
  const coLeadOptions = filteredStaffByPosition(WorkStaffRole.TEAM_CO_LEAD);
  const officerAnalystOptions = filteredStaffByPosition(
    WorkStaffRole.OFFICER_ANALYST
  );

  const roleFilterFunction = (row: any, id: any, filterValue: any) => {
    const options =
      id === WorkStaffRoleNames[WorkStaffRole.OFFICER_ANALYST]
        ? officerAnalystOptions
        : coLeadOptions;
    if (
      !filterValue.length ||
      filterValue.length > options.length // select all is selected
    ) {
      return true;
    }

    const value: string = row.getValue(id) || "";
    // Split the cell value into individual names
    const names = value.split("; ");

    // Check if any name includes the filter value
    return names.some((name) => filterValue.includes(name));
  };
  const getRolfilterOptions = (role: WorkStaffRole) => {
    return role === WorkStaffRole.OFFICER_ANALYST
      ? officerAnalystOptions
      : coLeadOptions;
  };
  const tableColumns = React.useMemo(() => {
    const cols: Array<MRT_ColumnDef<WorkStaffWithWork>> = [];
    if (workStaffs && workStaffs.length > 0) {
      const roles = [WorkStaffRole.TEAM_CO_LEAD, WorkStaffRole.OFFICER_ANALYST];
      roles.forEach((role, index) => {
        const roleName = WorkStaffRoleNames[role];
        cols.push({
          header: roleName,
          id: `${WorkStaffRoleNames[role]}`,
          filterSelectOptions: getRolfilterOptions(role),
          accessorFn: (row: any) => {
            if (!row.staff) {
              return "";
            }
            const staffRowWithRole = row.staff.filter(
              (p: { role: Role }) => p.role.id === role
            );
            return staffRowWithRole
              .map((staff: any) => `${staff.last_name}, ${staff.first_name}`)
              .join("; ");
          },
          Cell: ({ renderedCellValue }) => renderedCellValue,
          enableHiding: false,
          enableColumnFilter: true,
          sortingFn: "sortFn",
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
          filterFn: roleFilterFunction,
        });
      });
    }
    setWorkRoles(cols);
  }, [workStaffs]);

  const codeTypes: { [x: string]: any } = {
    eao_team: setTeams,
    work_lead: setLeads,
  };

  React.useEffect(() => {
    if (!workStaffs) return;
    Object.keys(codeTypes).forEach((key: string) => {
      let accessor = "name";
      let sort_key = "sort_order";
      if (key == "work_lead") {
        accessor = "full_name";
        sort_key = "full_name";
      }
      sort_key = key + "." + sort_key;
      const codes = sort([...workStaffs], sort_key)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .map((w) => (w[key] ? w[key][accessor] : null))
        .filter(
          (ele, index, arr) => arr.findIndex((t) => t === ele) === index && ele
        );
      codeTypes[key](codes);
    });
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
        filterSelectOptions: leads,
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
            filterValue.length > leads.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      ...workRoles,
    ];
  }, [leads, teams, workRoles, workTypes, workStaffs]);
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
