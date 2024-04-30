import React, { useEffect } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { useAppSelector } from "hooks";
import { hasPermission } from "components/shared/restricted";
import { ROLES } from "constants/application-constant";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { ETGridTitle } from "components/shared";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { WorkStaff } from "models/workStaff";
import { Role, WorkStaffRole, WorkStaffRoleNames } from "models/role";
import { useGetWorkStaffsQuery } from "services/rtkQuery/workStaffInsights";
import { sort } from "utils";
import { useGetWorksQuery } from "services/rtkQuery/workInsights";

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
      setWorkData(mergedData);
      setPagination((prev) => ({
        ...prev,
        pageSize: workStaffs.length,
      }));
    }
  }, [workStaffs, works]);

  const officerAnalysts = React.useMemo(() => {
    if (!workStaffs) return [];
    return workStaffs.flatMap((row: any) =>
      row.staff
        ? row.staff.filter(
            (p: { role: Role }) => p.role.id === WorkStaffRole.OFFICER_ANALYST
          )
        : []
    );
  }, [workStaffs]);

  const officerAnalystOptions = React.useMemo(() => {
    const sortedOfficerAnalysts = sort(officerAnalysts, "full_name");
    const uniqueOfficerAnalystNames = Array.from(
      new Set(
        sortedOfficerAnalysts.map(
          (officerAnalyst: any) => `${officerAnalyst.full_name}`
        )
      )
    );
    return uniqueOfficerAnalystNames;
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
    let cols: Array<MRT_ColumnDef<WorkStaffWithWork>> = [];
    if (workStaffs && workStaffs.length > 0) {
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
              .map((officerAnalyst: any) => `${officerAnalyst.full_name}`)
              .join(", ");
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
          filterFn: officerFilterFunction,
        } as MRT_ColumnDef<WorkStaffWithWork>,
      ];
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
        accessorKey: "work.title",
        header: "Name",
        size: 200,
        Cell: ({ row, renderedCellValue }) => {
          return (
            <ETGridTitle
              to={`/work-plan?work_id=${row.original.work.id}`}
              titleText={row.original.work.title}
              enableTooltip
              tooltip={row.original.work.title}
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
      enablePagination
      muiPaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(workStaffs?.length || 0),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default WorkList;
