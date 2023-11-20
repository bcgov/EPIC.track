import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Box, Button, Grid } from "@mui/material";
import { Work } from "../../models/work";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer } from "../shared";
import { MasterContext } from "../shared/MasterContext";
import WorkForm from "./WorkForm";
import workService from "../../services/workService/workService";
import { ActiveChip, InactiveChip } from "../shared/chip/ETChip";
import { Link } from "react-router-dom";
import { IconProps } from "../icons/type";
import Icons from "../icons";
import TableFilter from "../shared/filterSelect/TableFilter";
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import { Restricted } from "../shared/restricted";
import { GROUPS } from "../../constants/application-constant";

const GoToIcon: React.FC<IconProps> = Icons["GoToIcon"];

const WorkList = () => {
  const [workId, setWorkId] = React.useState<number>();
  const [phases, setPhases] = React.useState<string[]>([]);
  const [eaActs, setEAActs] = React.useState<string[]>([]);
  const [workTypes, setWorkTypes] = React.useState<string[]>([]);
  const [projects, setProjects] = React.useState<string[]>([]);
  const [ministries, setMinistries] = React.useState<string[]>([]);
  const [teams, setTeams] = React.useState<string[]>([]);
  const ctx = React.useContext(MasterContext);
  React.useEffect(() => {
    ctx.setForm(<WorkForm workId={workId} />);
  }, [workId]);

  React.useEffect(() => {
    ctx.setTitle("Work");
  }, [ctx.title]);

  const onEdit = (id: number) => {
    setWorkId(id);
    ctx.setShowModalForm(true);
  };

  React.useEffect(() => {
    ctx.setService(workService);
  }, []);
  const works = React.useMemo(() => ctx.data as Work[], [ctx.data]);
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
        .map((w) => w[key][accessor])
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
            onClick={() => onEdit(row.original.id)}
            titleText={row.original.title}
          >
            {renderedCellValue}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
      },
      {
        accessorKey: "project.name",
        header: "Project",
        filterVariant: "multi-select",
        filterSelectOptions: projects,
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
            {cell.getValue<boolean>() && (
              <ActiveChip label="Active" color="primary" />
            )}
            {!cell.getValue<boolean>() && (
              <InactiveChip label="Inactive" color="error" />
            )}
          </span>
        ),
      },
    ],
    [projects, phases, teams, ministries, workTypes, eaActs]
  );
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
            }}
            state={{
              isLoading: ctx.loading,
              showGlobalFilter: true,
            }}
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "right",
                }}
              >
                <Restricted
                  allowed={[GROUPS.SUPER_USER, GROUPS.DEVELOPER]}
                  errorProps={{ disabled: true }}
                >
                  <Button
                    onClick={() => {
                      ctx.setShowModalForm(true);
                      setWorkId(undefined);
                    }}
                    variant="contained"
                  >
                    Create Work
                  </Button>
                </Restricted>
              </Box>
            )}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
};

export default WorkList;
