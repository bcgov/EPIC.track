import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton } from "@mui/material";
import { Work } from "../../models/work";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETLink, ETPageContainer } from "../shared";
import { MasterContext } from "../shared/MasterContext";
import WorkForm from "./WorkForm";
import workService from "../../services/workService/workService";
import { ActiveChip, InactiveChip } from "../shared/chip/ETChip";

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

  const handleDelete = (id: string) => {
    ctx.setShowDeleteDialog(true);
    ctx.setId(id);
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
    current_phase: setPhases,
  };

  React.useEffect(() => {
    Object.keys(codeTypes).forEach((key: string) => {
      const codes = works
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .map((w) => w[key]?.name)
        .filter(
          (ele, index, arr) => arr.findIndex((t) => t === ele) === index && ele
        );
      codeTypes[key](codes);
    });
  }, [works]);

  const columns = React.useMemo<MRT_ColumnDef<Work>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Name",
        Cell: ({ row }) => (
          <ETGridTitle to={`/work-plan?work_id=${row.original.id}`}>
            {row.original.title}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
      },
      {
        accessorKey: "project.name",
        header: "Project",
        filterVariant: "multi-select",
        filterSelectOptions: projects,
      },
      {
        accessorKey: "ea_act.name",
        header: "EA Act",
        filterVariant: "multi-select",
        filterSelectOptions: eaActs,
      },
      {
        accessorKey: "work_type.name",
        header: "Work type",
        filterVariant: "multi-select",
        filterSelectOptions: workTypes,
      },
      {
        accessorKey: "ministry.abbreviation",
        header: "Ministry",
        filterVariant: "multi-select",
        filterSelectOptions: ministries,
      },
      {
        accessorKey: "eao_team.name",
        header: "Team",
        filterVariant: "multi-select",
        filterSelectOptions: teams,
      },
      {
        accessorKey: "current_phase.name",
        header: "Current Phase",
        filterVariant: "multi-select",
        filterSelectOptions: phases,
      },
      {
        accessorKey: "is_active",
        header: "Active",
        filterVariant: "checkbox",
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
            enableRowActions={true}
            renderRowActions={({ row }: any) => (
              <Box>
                <IconButton onClick={() => handleDelete(row.original.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "right",
                }}
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
              </Box>
            )}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
};

export default WorkList;
