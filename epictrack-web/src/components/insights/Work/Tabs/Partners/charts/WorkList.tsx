import React, { useEffect, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { showNotification } from "components/shared/notificationProvider";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { useGetWorksWithNationsQuery } from "services/rtkQuery/workInsights";
import { sort } from "utils";

const WorkList = () => {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, error, isLoading } = useGetWorksWithNationsQuery();

  const works = data || [];

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: works.length,
    }));
  }, [works]);

  useEffect(() => {
    if (error) {
      showNotification("Error fetching works", { type: "error" });
    }
  }, [error]);

  const federalInvolvements = useMemo(() => {
    return Array.from(new Set(works.map((w) => w?.federal_involvement?.name)));
  }, [works]);

  const ministries = useMemo(() => {
    return Array.from(
      new Set(
        [...works]
          .sort(
            (a, b) =>
              a.ministry?.minister?.position?.sort_order -
              b.ministry?.minister?.position?.sort_order
          )
          .filter((w) => w.ministry)
          .map((w) => w.ministry.name)
      )
    );
  }, [works]);

  const indigenousNations = useMemo(() => {
    const nations = works
      .map((work) => work.indigenous_works)
      .flat()
      .map((nation) => nation?.name ?? "")
      .filter((nation) => nation);
    return Array.from(new Set(nations)).sort();
  }, [works]);

  const columns = React.useMemo<MRT_ColumnDef<Work>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Name",
        size: 300,
        sortingFn: "sortFn",
        filterFn: searchFilter,
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
            value.includes(filerValue)
          );
        },
      },
      {
        accessorKey: "federal_involvement.name",
        header: "Federal Involvement",
        size: 200,
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
        accessorKey: "indigenous_nations",
        header: "First nations",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: indigenousNations,
        accessorFn: (row) => {
          return (
            row.indigenous_works
              ?.map((indigenous_work) => indigenous_work.name)
              ?.join(", ") ?? ""
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

          const value: string = row.getValue(id) || "";

          return filterValues.some((filterValue: string) =>
            value.includes(filterValue)
          );
        },
      },
    ],
    [ministries, works]
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
      state={{
        isLoading: isLoading,
        showGlobalFilter: true,
        pagination: pagination,
      }}
      enablePagination
      muiPaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(works.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default WorkList;
