import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_ToggleFullScreenButton,
  MRT_ShowHideColumnsButton,
  MRT_TableInstance,
  MRT_ToggleFiltersButton,
  MRT_VisibilityState,
} from "material-react-table";
import { json2csv } from "json-2-csv";
import {
  REPORT_TYPE,
  DISPLAY_DATE_FORMAT,
  COMMON_ERROR_MESSAGE,
} from "../../../constants/application-constant";
import ReportService from "../../../services/reportService";
import { dateUtils } from "../../../utils";
import { ResourceForecastModel } from "./type";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ReportHeader from "../shared/report-header/ReportHeader";
import { ETPageContainer, ETParagraph, IButton } from "../../shared";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { showNotification } from "components/shared/notificationProvider";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

export default function ResourceForecast() {
  const [reportDate, setReportDate] = useState<string>("");
  const [showReportDateBanner, setShowReportDateBanner] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rfData, setRFData] = useState<ResourceForecastModel[]>([]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    {}
  );
  const [globalFilter, setGlobalFilter] = useState();
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10, //customize the default page size
  });

  const FILENAME_PREFIX = "EAO_Resource_Forecast";

  useEffect(() => {
    const options = rowsPerPageOptions(rfData.length);
    setPagination((prev) => ({
      ...prev,
      pageSize: options[options.length - 1].value,
    }));
  }, [rfData]);
  React.useEffect(() => {
    const hiddenColumns = Object.keys(columnVisibility).filter(
      (p) => !columnVisibility[p]
    );
    const filteredColumnFilters = columnFilters.filter(
      (p) => !hiddenColumns.includes(p.id)
    );
    setColumnFilters(filteredColumnFilters);
  }, [columnVisibility, setColumnFilters]);

  const exportToCsv = React.useCallback(
    async (table: MRT_TableInstance<ResourceForecastModel>) => {
      const filteredResult = table.getFilteredRowModel().flatRows.map((p) => {
        return {
          ...p.original,
          [p.original.months[0].label]: p.original.months[0].phase,
          [p.original.months[1].label]: p.original.months[1].phase,
          [p.original.months[2].label]: p.original.months[2].phase,
          [p.original.months[3].label]: p.original.months[3].phase,
        };
      });
      const columns = table
        .getVisibleFlatColumns()
        .map((p) => p.columnDef.id?.toString());
      const csv = await json2csv(filteredResult, {
        emptyFieldValue: "",
        keys: columns as string[],
      });
      const url = window.URL.createObjectURL(new Blob([csv as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${FILENAME_PREFIX}-${dateUtils.formatDate(
          reportDate ? reportDate : new Date().toISOString()
        )}.csv`
      );
      document.body.appendChild(link);
      link.click();
    },
    [reportDate]
  );

  React.useEffect(() => {
    const diff = dateUtils.diff(
      reportDate,
      new Date(2019, 11, 19).toISOString(),
      "days"
    );
    setShowReportDateBanner(diff < 0 && !Number.isNaN(diff));
  }, [reportDate]);
  React.useEffect(() => {
    setFilters((prev) => {
      const state = {
        ...prev,
        exclude: Object.keys(columnVisibility).filter(
          (p) => !columnVisibility[p]
        ),
        filter_search: (() => {
          let result = {};
          columnFilters.forEach((filter) => {
            result = {
              ...result,
              [filter["id"]]: filter["value"],
            };
          });
          return result;
        })(),
        global_search: globalFilter,
      };
      return state;
    });
  }, [columnFilters, columnVisibility, globalFilter]);

  const setMonthColumns = React.useCallback(() => {
    let columns: Array<MRT_ColumnDef<ResourceForecastModel>> = [];
    if (rfData && rfData.length > 0) {
      columns = rfData[0].months.map((rfMonth: any, index: number) => {
        return {
          header: rfMonth["label"],
          accessorFn: (row: any) => `${row.months[index].phase}`,
          enableHiding: false,
          size: 200,
          enableColumnFilter: false,
          Cell: ({ row }: any) => (
            <Tooltip title={row.original.months[index].phase}>
              <Box
                sx={{
                  bgcolor: row.original.months[index].color,
                  overflow: "hidden",
                  padding: "0.5rem 0.5rem 0.5rem 1rem",
                  textOverflow: "ellipsis",
                }}
              >
                {row.original.months[index].phase}
              </Box>
            </Tooltip>
          ),
        } as MRT_ColumnDef<ResourceForecastModel>;
      });
    }
    return columns;
  }, [rfData]);

  const filterFn = React.useCallback(
    (filterField: keyof ResourceForecastModel) =>
      rfData
        .filter((p) => p[filterField])
        .map((p) => p[filterField]?.toString())
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [rfData]
  );

  const eaTypeFilter = filterFn("ea_type");
  const workFilter = filterFn("work_title");
  const projectPhaseFilter = filterFn("project_phase");
  const eaActFilter = filterFn("ea_act");
  const iaacFilter = filterFn("iaac");
  const typeFilter = filterFn("sector(sub)");
  const envRegionFilter = filterFn("env_region");
  const nrsRegionFilter = filterFn("nrs_region");
  const workLeadFilter = filterFn("work_lead");
  const epdFilter = filterFn("responsible_epd");
  const teamFilter = filterFn("eao_team");
  const cairtLeadFilter = filterFn("cairt_lead");

  const columns = React.useMemo<MRT_ColumnDef<ResourceForecastModel>[]>(
    () => [
      {
        accessorKey: "work_title",
        header: "Work",
        enableHiding: false,
        filterVariant: "multi-select",
        filterSelectOptions: workFilter,
        Filter: ({ ...props }) => (
          <Autocomplete
            multiple
            options={workFilter}
            onChange={(e, value) => props.header.column.setFilterValue(value)}
            value={
              props.header.column.getFilterValue()
                ? (props.header.column.getFilterValue() as [])
                : []
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder="Select to Hide"
              />
            )}
          />
        ),
        filterFn: (row, id, filterValue) => {
          return !filterValue.includes(row.getValue(id));
        },
        Cell: ({ row }: any) => (
          <ETParagraph
            enableEllipsis
            enableTooltip
            tooltip={row.original.work_title}
          >
            {row.original.work_title}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "capital_investment",
        header: "Capital Investment",
      },
      {
        accessorKey: "fte_positions_construction",
        header: "Est. FTEs in construction",
      },
      {
        accessorKey: "fte_positions_operation",
        header: "Est. FTEs in operation",
      },
      {
        accessorKey: "ea_type",
        header: "EA Type",
        enableHiding: false,
        filterVariant: "select",
        filterSelectOptions: eaTypeFilter,
      },
      {
        header: "Project Phase",
        filterVariant: "select",
        filterSelectOptions: projectPhaseFilter,
        Cell: ({ row }: any) => (
          <ETParagraph
            enableEllipsis
            enableTooltip
            tooltip={row.original.project_phase}
          >
            {row.original.project_phase}
          </ETParagraph>
        ),
      },
      {
        accessorKey: "ea_act",
        header: "EA Act",
        filterVariant: "select",
        filterSelectOptions: eaActFilter,
      },
      {
        accessorKey: "iaac",
        header: "IAAC",
        filterVariant: "select",
        filterSelectOptions: iaacFilter,
      },
      {
        accessorKey: "sector(sub)",
        header: "Type (Subtype)",
        filterVariant: "select",
        filterSelectOptions: typeFilter,
      },
      {
        accessorKey: "env_region",
        header: "ENV Region",
        filterVariant: "select",
        filterSelectOptions: envRegionFilter,
      },
      {
        accessorKey: "nrs_region",
        header: "NRS Region",
        filterVariant: "select",
        filterSelectOptions: nrsRegionFilter,
      },
      {
        accessorKey: "responsible_epd",
        header: "Responsible EPD",
        filterVariant: "select",
        filterSelectOptions: epdFilter,
      },
      {
        accessorKey: "cairt_lead",
        header: "FN CAIRT Lead",
        filterVariant: "select",
        filterSelectOptions: cairtLeadFilter,
      },
      {
        accessorKey: "eao_team",
        header: "Lead's Team",
        filterVariant: "select",
        filterSelectOptions: teamFilter,
      },
      {
        accessorKey: "work_lead",
        header: "Work Lead",
        filterVariant: "select",
        filterSelectOptions: workLeadFilter,
      },
      {
        header: "Work Team Members",
        Cell: ({ row }: any) => (
          <ETParagraph
            enableEllipsis
            enableTooltip
            tooltip={row.original.work_team_members}
          >
            {row.original.work_team_members}
          </ETParagraph>
        ),
      },
      ...setMonthColumns(),
      {
        accessorKey: "referral_timing",
        accessorFn: (row) =>
          dateUtils.formatDate(row.referral_timing, DISPLAY_DATE_FORMAT),
        header: "Referral Timing",
        enableHiding: true,
      },
    ],
    [
      setMonthColumns,
      cairtLeadFilter,
      eaActFilter,
      eaTypeFilter,
      envRegionFilter,
      epdFilter,
      iaacFilter,
      nrsRegionFilter,
      workFilter,
      projectPhaseFilter,
      teamFilter,
      typeFilter,
      workLeadFilter,
    ]
  );
  const fetchReportData = React.useCallback(async () => {
    try {
      const reportData = await ReportService.fetchReportData(
        REPORT_TYPE.RESOURCE_FORECAST,
        {
          report_date: reportDate,
          color_intensity: "25",
        }
      );
      if (reportData.status && reportData.status === 200) {
        const data = reportData.data as never[];
        data.forEach((element) => {
          Object.keys(element).forEach(
            (key) => (element[key] = element[key] ?? "")
          );
        });
        setRFData(data);
      } else {
        setRFData([]);
      }
    } catch (error) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
      setRFData([]);
    }
  }, [reportDate]);

  const downloadPDFReport = React.useCallback(async () => {
    try {
      const binaryReponse = await ReportService.downloadPDF(
        REPORT_TYPE.RESOURCE_FORECAST,
        {
          report_date: reportDate,
          filters,
          color_intensity: "25",
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([(binaryReponse as any).data])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${FILENAME_PREFIX}-${dateUtils.formatDate(
          reportDate ? reportDate : new Date().toISOString()
        )}.pdf`
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  }, [reportDate, filters]);

  return (
    <ETPageContainer
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
      container
      columnSpacing={2}
      rowSpacing={3}
    >
      <Grid item sm={12}>
        <ReportHeader
          setReportDate={setReportDate}
          fetchReportData={fetchReportData}
          downloadPDFReport={downloadPDFReport}
          showReportDateBanner={showReportDateBanner}
        />
      </Grid>
      <Grid item sm={12}>
        <MasterTrackTable
          columns={columns}
          enablePagination
          onPaginationChange={setPagination}
          muiPaginationProps={{
            rowsPerPageOptions: rowsPerPageOptions(rfData.length),
          }}
          state={{
            columnFilters,
            columnVisibility,
            globalFilter,
            isLoading: isLoading,
            showGlobalFilter: true,
            pagination,
          }}
          positionGlobalFilter="left"
          muiSearchTextFieldProps={{
            placeholder: "Search",
            sx: { minWidth: "300px" },
            variant: "outlined",
          }}
          muiTableBodyCellProps={{
            sx: {
              paddingRight: "2px",
            },
          }}
          muiTableContainerProps={{
            sx: {
              maxHeight: {
                xs: "calc(100vh - 200px)",
                sm: "calc(100vh - 250px)",
                md: "calc(100vh - 300px)",
                lg: "calc(100vh - 350px)",
                xl: "calc(100vh - 400px)",
              },
            },
          }}
          onColumnFiltersChange={setColumnFilters}
          onColumnVisibilityChange={setColumnVisibility}
          onGlobalFilterChange={setGlobalFilter}
          enableHiding={true}
          renderToolbarInternalActions={({ table }) => (
            <>
              <MRT_ToggleFiltersButton table={table} />
              <MRT_ShowHideColumnsButton table={table} />
              {/* add your own custom print button or something */}
              <Tooltip title="Clear all filters">
                <IconButton
                  onClick={() => {
                    setColumnFilters([]);
                    setColumnVisibility({});
                    setGlobalFilter(undefined);
                  }}
                >
                  <ClearAllIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export to csv">
                <IButton onClick={() => exportToCsv(table)}>
                  <DownloadIcon className="icon" />
                </IButton>
              </Tooltip>
              <MRT_ToggleFullScreenButton table={table} />
            </>
          )}
          data={rfData}
        />
      </Grid>
    </ETPageContainer>
  );
}
