import React, { useEffect, useMemo, useRef } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { showNotification } from "components/shared/notificationProvider";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { useGetWorksWithNationsQuery } from "services/rtkQuery/workInsights";
import { All_WORKS_FILTERS_CACHE_KEY } from "components/work/constants";
import { useCachedState } from "hooks/useCachedFilters";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { ETGridTitle } from "components/shared";
import { useNavigate } from "react-router-dom";

const WorkList = () => {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [cachedFilters, setCachedFilters] = useCachedState<ColumnFilter[]>(
    All_WORKS_FILTERS_CACHE_KEY,
    []
  );
  const navigate = useNavigate();
  const prevCachedFiltersRef = useRef(cachedFilters);
  const { data, error, isLoading } = useGetWorksWithNationsQuery();

  const works = data || [];

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: works.length,
    }));
  }, [works]);

  useEffect(() => {
    if (
      JSON.stringify(prevCachedFiltersRef.current) !==
      JSON.stringify(cachedFilters)
    ) {
      navigate("/works");
    }
    prevCachedFiltersRef.current = cachedFilters;
  }, [cachedFilters]);

  useEffect(() => {
    if (error) {
      showNotification("Error fetching works", { type: "error" });
    }
  }, [error]);

  const federalInvolvements = useMemo(() => {
    return Array.from(new Set(works.map((w) => w?.federal_involvement?.name)));
  }, [works]);

  const ministries = useMemo(() => {
    return Array.from(new Set(works.map((w) => w?.ministry?.name)));
  }, [works]);

  const handleFilterChange = (newFilter: ColumnFilter) => {
    const newFilters = cachedFilters.map((filter) =>
      filter.id === newFilter.id ? newFilter : filter
    );

    if (!newFilters.find((filter) => filter.id === newFilter.id)) {
      newFilters.push(newFilter);
    }

    setCachedFilters(newFilters);
  };

  const indigenousNations = useMemo(() => {
    const nations = works
      .map((work) => work.indigenous_works)
      .flat()
      .map((nation) => nation?.name ?? "")
      .filter((nation) => nation);
    return Array.from(new Set(nations));
  }, [works]);

  const columns = React.useMemo<MRT_ColumnDef<Work>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Name",
        size: 300,
        sortingFn: "sortFn",
        filterFn: searchFilter,
        Cell: ({ row, renderedCellValue }) => (
          <ETGridTitle
            to="#"
            enableTooltip
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange({
                id: "title",
                value: row.original.title,
              });
            }}
            titleText={row.original.title}
            tooltip={row.original.title}
          >
            {row.original.title}
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
            value.includes(filerValue)
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
        accessorKey: "indigenous_nations",
        header: "First nations",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: indigenousNations,
        accessorFn: (row) => {
          return (
            <ul>
              {row.indigenous_works?.map((indigenous_work) => (
                <li key={indigenous_work.id}>{indigenous_work.name}</li>
              ))}
            </ul>
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
