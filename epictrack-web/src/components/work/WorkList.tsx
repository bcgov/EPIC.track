import React, { useEffect } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Box, Button, Grid, IconButton, Tooltip } from "@mui/material";
import { Work } from "../../models/work";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer, IButton } from "../shared";
import workService from "../../services/workService/workService";
import { ETChip } from "../shared/chip/ETChip";
import { Link } from "react-router-dom";
import TableFilter from "../shared/filterSelect/TableFilter";
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import { Restricted } from "../shared/restricted";
import { ROLES } from "../../constants/application-constant";
import { searchFilter } from "../shared/MasterTrackTable/filters";
import { WorkDialog } from "./Dialog";
import { showNotification } from "components/shared/notificationProvider";
import { All_WORKS_FILTERS_CACHE_KEY } from "./constants";
import { useCachedState } from "hooks/useCachedFilters";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { sort } from "utils";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";

const GoToIcon: React.FC<IconProps> = Icons["GoToIcon"];
const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const WorkList = () => {
  const [workId, setWorkId] = React.useState<number>();
  const [showWorkDialogForm, setShowWorkDialogForm] = React.useState(false);
  const [phases, setPhases] = React.useState<string[]>([]);
  const [eaActs, setEAActs] = React.useState<string[]>([]);
  const [workTypes, setWorkTypes] = React.useState<string[]>([]);
  const [projects, setProjects] = React.useState<string[]>([]);
  const [ministries, setMinistries] = React.useState<string[]>([]);
  const [teams, setTeams] = React.useState<string[]>([]);
  const [loadingWorks, setLoadingWorks] = React.useState<boolean>(true);
  const [works, setWorks] = React.useState<Work[]>([]);
  const [cachedFilters, setCachedFilters] = useCachedState<ColumnFilter[]>(
    All_WORKS_FILTERS_CACHE_KEY,
    [
      {
        id: "is_active",
        value: [true],
      },
    ]
  );

  const loadWorks = async () => {
    setLoadingWorks(true);
    try {
      const response = await workService.getAll();
      setWorks(sort(response.data, "title"));
      setLoadingWorks(false);
    } catch (error) {
      showNotification("Could not load works", { type: "error" });
    }
  };

  useEffect(() => {
    loadWorks();
  }, []);

  const codeTypes: { [x: string]: any } = {
    ea_act: setEAActs,
    work_type: setWorkTypes,
    project: setProjects,
    ministry: setMinistries,
    eao_team: setTeams,
    current_work_phase: setPhases,
  };

  React.useEffect(() => {
    Object.keys(codeTypes).forEach((key: string) => {
      let accessor = "name";
      if (key == "ministry") {
        accessor = "abbreviation";
      }
      const codes = works
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .map((w) => (w[key] ? w[key][accessor] : null))
        .filter(
          (ele, index, arr) => arr.findIndex((t) => t === ele) === index && ele
        );
      codeTypes[key](codes);
    });
  }, [works]);

  const statuses = getSelectFilterOptions(
    works,
    "is_active",
    (value) => (value ? "Active" : "Inactive"),
    (value) => value
  );

  const columns = React.useMemo<MRT_ColumnDef<Work>[]>(
    () => [
      {
        header: " ",
        size: 40,
        Cell: ({ row }) => (
          <Box>
            <Link to={`/work-plan?work_id=${row.original.id}`}>
              <GoToIcon />
            </Link>
          </Box>
        ),
      },
      {
        accessorKey: "title",
        header: "Name",
        size: 300,
        Cell: ({ row, renderedCellValue }) => (
          <ETGridTitle
            to="#"
            onClick={() => {
              setWorkId(row.original.id);
              setShowWorkDialogForm(true);
            }}
            enableTooltip
            tooltip={row.original.title}
            titleText={row.original.title}
          >
            {row.original.title}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "project.name",
        header: "Project",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: projects,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="projectFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > projects.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "ea_act.name",
        header: "EA Act",
        size: 100,
        filterVariant: "multi-select",
        filterSelectOptions: eaActs,
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
            filterValue.length > eaActs.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "work_type.name",
        header: "Work type",
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
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > workTypes.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
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
        accessorKey: "current_work_phase.name",
        header: "Current Phase",
        filterVariant: "multi-select",
        filterSelectOptions: phases,
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
            filterValue.length > phases.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        size: 80,
        filterVariant: "multi-select",
        filterSelectOptions: statuses,
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
            filterValue.length > statuses.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id);

          return filterValue.includes(value);
        },
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
      },
    ],
    [projects, phases, teams, ministries, workTypes, eaActs]
  );

  const handleCacheFilters = (filters?: ColumnFilter[]) => {
    if (!filters) {
      return;
    }
    setCachedFilters(filters);
  };

  return (
    <>
      <ETPageContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
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
              columnFilters: cachedFilters,
            }}
            state={{
              isLoading: loadingWorks,
              showGlobalFilter: true,
            }}
            tableName="work-listing"
            enableExport
            renderTopToolbarCustomActions={({ table }) => (
              <Restricted
                allowed={[ROLES.CREATE]}
                errorProps={{ disabled: true }}
              >
                <Button
                  onClick={() => {
                    setShowWorkDialogForm(true);
                    setWorkId(undefined);
                  }}
                  variant="contained"
                >
                  Create Work
                </Button>
              </Restricted>
            )}
            onCacheFilters={handleCacheFilters}
          />
        </Grid>
      </ETPageContainer>
      <WorkDialog
        workId={workId}
        open={showWorkDialogForm}
        setOpen={setShowWorkDialogForm}
        saveWorkCallback={loadWorks}
      />
    </>
  );
};

export default WorkList;
