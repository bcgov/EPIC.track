import { FC, useEffect, useMemo, useState } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { showNotification } from "components/shared/notificationProvider";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { useGetWorksWithNationsQuery } from "services/rtkQuery/workInsights";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { Tooltip, Box } from "@mui/material";
import { sort } from "utils";
import { ETGridTitle, IButton } from "components/shared";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { useInsightsContext } from "components/insights/InsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";

const DownloadIcon: FC<IconProps> = Icons["DownloadIcon"];

const WorkList = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });
  const { columnFilters, setColumnFilters } = useTableFilterContext();
  const { isUserInsights, staffId } = useInsightsContext();

  const queryArg = useMemo(() => {
    return {
      is_active: true,
      ...(isUserInsights && staffId ? { staffId } : {}),
    };
  }, [isUserInsights, staffId]);

  const { data, error, isLoading } = useGetWorksWithNationsQuery(queryArg, {
    refetchOnMountOrArgChange: true,
  });

  const works = useMemo(() => data || [], [data]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: works.length,
    }));
  }, [works]);

  useEffect(() => {
    if (error) {
      showNotification("Error fetching Works", {
        duration: 3000,
        type: "error",
      });
    }
  }, [error]);

  const federalInvolvements = useMemo(() => {
    return Array.from(
      new Set(
        [...works]
          .sort(
            (a, b) =>
              Number(a?.federal_involvement?.sort_order) -
              Number(b?.federal_involvement?.sort_order),
          )
          .filter((p) => p.federal_involvement)
          .map((w) => w?.federal_involvement?.name),
      ),
    );
  }, [works]);

  const ministries = useMemo(() => {
    const ministry = Array.from(
      new Set(
        [...works]
          .sort((a, b) => a.ministry?.sort_order - b.ministry?.sort_order)
          .filter((w) => w.ministry)
          .map((w) => w.ministry.name),
      ),
    );
    return ministry;
  }, [works]);

  const indigenousNations = useMemo(() => {
    const nations = works.map((work) => work.indigenous_works).flat();

    const uniqueNations = Array.from(
      new Set(
        sort([...nations], "name")
          .map((nation) => nation?.name ?? "")
          .filter((nation) => nation),
      ),
    );

    return uniqueNations;
  }, [works]);

  const relStaff = useMemo(() => {
    const staff = works
      .map((work) => work.rel_staff || [])
      .flat()
      .filter((s) => s);

    const uniqueStaff = Array.from(
      new Set(staff.map((s) => s.full_name)),
    ).sort();

    return uniqueStaff;
  }, [works]);

  const workTypes = useMemo(() => {
    return Array.from(
      new Set(
        [...works]
          .filter((w) => w.work_type)
          .map((w) => w.work_type.name),
      ),
    ).sort();
  }, [works]);

  const columns = useMemo<MRT_ColumnDef<Work>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Name",
        size: 300,
        sortingFn: "sortFn",
        filterFn: searchFilter,
        Cell: ({ row, renderedCellValue }) => (
          <ETGridTitle
            to={`/work-plan?work_id=${row.original.id}`}
            enableTooltip
            tooltip={row.original.title}
          >
            {renderedCellValue}
          </ETGridTitle>
        ),
      },
      {
        accessorKey: "ministry.name",
        header: "Other Ministry",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: ministries,
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
        filterFn: (row, id, filterValues) => {
          if (
            !filterValues.length ||
            filterValues.length > ministries.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValues.some((filerValue: string) =>
            value.includes(filerValue),
          );
        },
      },
      {
        accessorKey: "federal_involvement.name",
        header: "Federal Involvement",
        size: 100,
        filterSelectOptions: federalInvolvements,
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
            filterValue.length > federalInvolvements.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "indigenous_works.name",
        header: "First Nations",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: indigenousNations,
        accessorFn: (row) => {
          return (
            <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
              {row.indigenous_works
                ?.map((indigenous_work) => indigenous_work.name)
                .join(", ")}
            </div>
          );
        },
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
        filterFn: (row, id, filterValues) => {
          if (
            !filterValues.length ||
            filterValues.length > indigenousNations.length // select all is selected
          ) {
            return true;
          }

          // list of First Nations associated with the work
          const workIndigenousNations: string[] =
            row.original.indigenous_works?.map((work) => work.name) || [];

          return filterValues.some((filterValue: string) =>
            workIndigenousNations.includes(filterValue),
          );
        },
      },
      {
        accessorKey: "rel_staff",
        header: "REL",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: relStaff,
        accessorFn: (row) => {
          return row.rel_staff?.map((staff) => staff.full_name).join(", ") || "";
        },
        Cell: ({ row }) => {
          return (
            <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
              {row.original.rel_staff
                ?.map((staff) => staff.full_name)
                .join(", ") || ""}
            </div>
          );
        },
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
        filterFn: (row, id, filterValues) => {
          if (
            !filterValues.length ||
            filterValues.length > relStaff.length // select all is selected
          ) {
            return true;
          }

          // list of REL staff associated with the work
          const workRelStaff: string[] =
            row.original.rel_staff?.map((staff) => staff.full_name) || [];

          return filterValues.some((filterValue: string) =>
            workRelStaff.includes(filterValue),
          );
        },
      },
      {
        accessorKey: "work_type.name",
        header: "Work Type",
        size: 150,
        filterVariant: "multi-select",
        filterSelectOptions: workTypes,
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
        filterFn: (row, id, filterValues) => {
          if (
            !filterValues.length ||
            filterValues.length > workTypes.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValues.includes(value);
        },
      },
    ],
    [federalInvolvements, indigenousNations, ministries, relStaff, workTypes],
  );
  return (
    <MasterTrackTable
      columns={columns}
      data={works}
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
                  filenamePrefix: "partners-insights-listing",
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
        rowsPerPageOptions: rowsPerPageOptions(works.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default WorkList;
