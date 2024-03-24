import React, { useEffect } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { showNotification } from "components/shared/notificationProvider";
import { useAppSelector } from "hooks";
import { hasPermission } from "components/shared/restricted";
import {
  ACTIVE_STATUS,
  COMMON_ERROR_MESSAGE,
  ROLES,
} from "constants/application-constant";
import { Work } from "models/work";
import {
  getSelectFilterOptions,
  rowsPerPageOptions,
} from "components/shared/MasterTrackTable/utils";
import { ETGridTitle } from "components/shared";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { StaffWorkRole } from "models/staff";
import workService from "services/workService/workService";
import { WorkStaff } from "models/workStaff";
import { set } from "lodash";
import { Role, WorkStaffRole, WorkStaffRoleNames } from "models/role";
import { useGetWorkStaffsQuery } from "services/rtkQuery/workStaffInsights";

type WorkOrWorkStaff = Work | WorkStaff;

const WorkList = () => {
  const [workTypes, setWorkTypes] = React.useState<string[]>([]);
  const [leads, setLeads] = React.useState<string[]>([]);
  const [teams, setTeams] = React.useState<string[]>([]);
  const [workRoles, setWorkRoles] = React.useState<
    MRT_ColumnDef<WorkOrWorkStaff>[]
  >([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });

  const { data, error, isLoading } = useGetWorkStaffsQuery();
  const wsData = (data as WorkStaff[]) || [];

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: wsData.length,
    }));
  }, [wsData]);

  const officerAnalysts = React.useMemo(() => {
    return wsData.flatMap((row: any) =>
      row.staff
        ? row.staff.filter(
            (p: { role: Role }) => p.role.id === WorkStaffRole.OFFICER_ANALYST
          )
        : []
    );
  }, [wsData]);

  const officerAnalystOptions = React.useMemo(() => {
    return Array.from(
      new Set(
        officerAnalysts.map(
          (officerAnalyst: any) =>
            `${officerAnalyst.first_name} ${officerAnalyst.last_name}`
        )
      )
    );
  }, [officerAnalysts]);

  const officerFilterFunction = (row: any, id: any, filterValue: any) => {
    if (
      !filterValue.length ||
      filterValue.length > officerAnalystOptions.length // select all is selected
    ) {
      return true;
    }

    const value: string = row.getValue(id) || "";

    // Split the cell value into individual names
    const names = value.split(", ");

    // Check if any name includes the filter value
    return names.some((name) => filterValue.includes(name));
  };

  const tableColumns = React.useMemo(() => {
    let cols: Array<MRT_ColumnDef<WorkOrWorkStaff>> = [];
    if (wsData && wsData.length > 0) {
      const rolename = WorkStaffRoleNames[WorkStaffRole.OFFICER_ANALYST];
      cols = [
        {
          header: rolename,
          filterSelectOptions: officerAnalystOptions,
          accessorFn: (row: any) => {
            if (!row.staff) {
              return "";
            }
            const officerAnalystsForRow = row.staff.filter(
              (p: { role: Role }) => p.role.id === WorkStaffRole.OFFICER_ANALYST
            );
            return officerAnalystsForRow
              .map(
                (officerAnalyst: any) =>
                  `${officerAnalyst.first_name} ${officerAnalyst.last_name}`
              )
              .join(", ");
          },
          Cell: ({ renderedCellValue }) => (
            <ETGridTitle
              to="#"
              enableEllipsis
              enableTooltip={true}
              tooltip={renderedCellValue}
            >
              {renderedCellValue}
            </ETGridTitle>
          ),
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
          filterFn: officerFilterFunction,
        } as MRT_ColumnDef<WorkOrWorkStaff>,
      ];
    }
    setWorkRoles(cols);
  }, [wsData]);

  const codeTypes: { [x: string]: any } = {
    work_type: setWorkTypes,
    eao_team: setTeams,
    work_lead: setLeads,
  };

  React.useEffect(() => {
    Object.keys(codeTypes).forEach((key: string) => {
      let accessor = "name";
      if (key == "work_lead" || key == "responsible_epd") {
        accessor = "full_name";
      }
      const codes = wsData
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .map((w) => (w[key] ? w[key][accessor] : null))
        .filter(
          (ele, index, arr) => arr.findIndex((t) => t === ele) === index && ele
        );
      codeTypes[key](codes);
    });
  }, [wsData]);

  const columns = React.useMemo<MRT_ColumnDef<WorkOrWorkStaff>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: "Name",
        size: 300,
        Cell: canEdit
          ? ({ row, renderedCellValue }) => (
              <ETGridTitle
                to="#"
                onClick={() => {
                  //TODO: Implement this
                  return;
                }}
                titleText={row.original.title}
              >
                {renderedCellValue}
              </ETGridTitle>
            )
          : undefined,
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "eao_team.name",
        header: "Team",
        size: 200,
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
  }, [leads, teams, workRoles, workTypes, wsData]);
  return (
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
      }}
      state={{
        isLoading: isLoading,
        showGlobalFilter: true,
        pagination: pagination,
      }}
      enablePagination
      muiPaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(wsData.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default WorkList;
