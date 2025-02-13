import { FC, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Grid } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import { Work } from "../../models/work";
import workService from "../../services/workService/workService";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer } from "components/shared";
import { ETChip } from "components/shared/chip/ETChip";
import TableFilter from "components/shared/filterSelect/TableFilter";
import { getSelectFilterOptions } from "components/shared/MasterTrackTable/utils";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { Restricted } from "components/shared/restricted";
import { ROLES } from "../../constants/application-constant";
import { WORK_STATE } from "components/shared/constants";
import { showNotification } from "components/shared/notificationProvider";
import { WorkDialog } from "./Dialog";
import { All_WORKS_FILTERS_CACHE_KEY } from "./constants";
import { useCachedState } from "hooks/useCachedFilters";
import { sort } from "utils";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";

const GoToIcon: FC<IconProps> = Icons["GoToIcon"];

const WorkList = () => {
  const [eaActs, setEAActs] = useState<string[]>([]);
  const [loadingWorks, setLoadingWorks] = useState<boolean>(true);
  const [phases, setPhases] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [showWorkDialogForm, setShowWorkDialogForm] = useState(false);
  const [states, setStates] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [workId, setWorkId] = useState<number>();
  const [works, setWorks] = useState<Work[]>([]);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
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
    current_work_phase: setPhases,
    ea_act: setEAActs,
    eao_team: setTeams,
    project: setProjects,
    work_state: setStates,
    work_type: setWorkTypes,
  };

  useEffect(() => {
    if (!works.length) return;
    Object.keys(codeTypes).forEach((key: string) => {
      let accessor = "name";
      if (key === "ministry") {
        accessor = "abbreviation";
      }
      // Look up work_state constant for label
      if (key === "work_state") {
        const codes = works
          .map(
            (w) =>
              WORK_STATE[w.work_state as keyof typeof WORK_STATE]?.label ||
              w.work_state
          )
          .filter(
            (element, index, array) =>
              element && array.indexOf(element) === index
          );
        codeTypes[key](codes);
        return;
      }
      const codes = works
        .map((w) => {
          const workKey = key as keyof Work;
          return w[workKey] ? (w[workKey] as any)[accessor] : null;
        })
        .filter(
          (element, index, array) => element && array.indexOf(element) === index
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

  const columns = useMemo<MRT_ColumnDef<Work>[]>(
    () => [
      {
        header: " ",
        size: 25,
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
        Cell: ({ row }) => (
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
        size: 180,
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
        size: 90,
        filterVariant: "multi-select",
        filterSelectOptions: eaActs,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="eaActFilter"
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
        size: 120,
        filterVariant: "multi-select",
        filterSelectOptions: workTypes,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="typeFilter"
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
        size: 60,
        filterVariant: "multi-select",
        filterSelectOptions: teams,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="teamFilter"
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
        size: 220,
        filterVariant: "multi-select",
        filterSelectOptions: phases,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="phaseFilter"
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
        accessorKey: "work_state",
        header: "Work state",
        size: 80,
        filterVariant: "multi-select",
        filterSelectOptions: states,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="stateFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > states.length // select all is selected
          ) {
            return true;
          }
          const value: string = row.getValue(id) || "";
          const label = WORK_STATE[value as keyof typeof WORK_STATE]?.label;
          return filterValue.includes(label);
        },
        Cell: ({ cell }) => {
          const stateValue = cell.getValue<keyof typeof WORK_STATE>();
          return <span>{WORK_STATE[stateValue]?.label ?? stateValue}</span>;
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        size: 75,
        filterVariant: "multi-select",
        filterSelectOptions: statuses,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="statusFilter"
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
    [eaActs, phases, projects, states, statuses, teams, workTypes]
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
            enableExport
            initialState={{
              sorting: [
                {
                  id: "title",
                  desc: false,
                },
              ],
              columnFilters: cachedFilters,
            }}
            onCacheFilters={handleCacheFilters}
            renderResultCount={true}
            state={{
              isLoading: loadingWorks,
              showGlobalFilter: true,
            }}
            renderTopToolbarCustomActions={() => (
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
            tableName="work-listing"
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
