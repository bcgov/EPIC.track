import React, { useEffect, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { showNotification } from "components/shared/notificationProvider";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { useGetWorksWithNationsQuery } from "services/rtkQuery/workInsights";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { Tooltip, Box } from "@mui/material";
import { sort } from "utils";
import { ETGridTitle, IButton } from "components/shared";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

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
    return Array.from(
      new Set(
        [...works]
          .sort(
            (a, b) =>
              Number(a?.federal_involvement?.sort_order) -
              Number(b?.federal_involvement?.sort_order)
          )
          .filter((p) => p.federal_involvement)
          .map((w) => w?.federal_involvement?.name)
      )
    );
  }, [works]);

  const ministries = useMemo(() => {
    const ministry = Array.from(
      new Set(
        [...works]
          .sort((a, b) => a.ministry?.sort_order - b.ministry?.sort_order)
          .filter((w) => w.ministry)
          .map((w) => w.ministry.name)
      )
    );
    return ministry;
  }, [works]);

  const indigenousNations = useMemo(() => {
    const nations = works.map((work) => work.indigenous_works).flat();

    const uniqueNations = Array.from(
      new Set(
        sort([...nations], "name")
          .map((nation) => nation?.name ?? "")
          .filter((nation) => nation)
      )
    );

    return uniqueNations;
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
            to={`/work-plan?work_id=${row.original.id}`}
            enableTooltip
            titleText={row.original.title}
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
        accessorKey: "indigenous_works.name",
        header: "First nations",
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
            workIndigenousNations.includes(filterValue)
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
