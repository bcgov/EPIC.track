import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton } from "@mui/material";
import { RESULT_STATUS } from "../../constants/application-constant";
import WorkTombstoneForm from "./tombstone/WorkTombstoneForm";
import { WorkTombstone } from "../../models/work";
import WorkService from "../../services/workService";
import MasterTrackTable from "../shared/MasterTrackTable";
import TrackDialog from "../shared/TrackDialog";
import { EpicTrackPageGridContainer } from "../shared";
import { ListType } from "../../models/code";
import { Ministry } from "../../models/ministry";
import codeService, { Code } from "../../services/codeService";

const WorkList = () => {
  const [works, setWorks] = React.useState<WorkTombstone[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [workId, setWorkId] = React.useState<number>();
  const [deleteWorkId, setDeleteWorkId] = React.useState<number>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const [phases, setPhases] = React.useState<ListType[]>([]);
  const [eaActs, setEAActs] = React.useState<ListType[]>([]);
  const [workTypes, setWorkTypes] = React.useState<ListType[]>([]);
  const [projects, setProjects] = React.useState<ListType[]>([]);
  const [ministries, setMinistries] = React.useState<Ministry[]>([]);
  const [teams, setTeams] = React.useState<ListType[]>([]);
  const titleSuffix = "Work Details";
  const onDialogClose = (event: any, reason: any) => {
    if (reason && reason == "backdropClick") return;
    setShowDialog(false);
  };
  const onEdit = (id: number) => {
    setWorkId(id);
    setShowDialog(true);
  };

  const codeTypes: { [x: string]: any } = {
    phases: setPhases,
    ea_acts: setEAActs,
    work_types: setWorkTypes,
    projects: setProjects,
    ministries: setMinistries,
    eao_teams: setTeams,
  };

  const getCodes = async (code: Code) => {
    const codeResult = await codeService.getCodes(code);
    if (codeResult.status === 200) {
      codeTypes[code]((codeResult.data as never)["codes"]);
    }
  };

  React.useEffect(() => {
    const promises: any[] = [];
    Object.keys(codeTypes).forEach(async (key) => {
      promises.push(getCodes(key as Code));
    });
    Promise.all(promises);
  }, []);
  const getWorks = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const workResult = await WorkService.getWorks();
      if (workResult.status === 200) {
        setWorks((workResult.data as never)["works"]);
      }
    } catch (error) {
      console.error("Work List: ", error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  React.useEffect(() => {
    getWorks();
  }, [getWorks]);

  const handleDelete = (id: number) => {
    setShowDeleteDialog(true);
    setDeleteWorkId(id);
  };

  const deleteWork = async (id?: number) => {
    const result = await WorkService.deleteWork(id);
    if (result.status === 200) {
      setDeleteWorkId(undefined);
      setShowDeleteDialog(false);
      getWorks();
    }
  };

  const columns = React.useMemo<MRT_ColumnDef<WorkTombstone>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Name",
      },
      {
        accessorKey: "project.name",
        header: "Project",
        filterVariant: "multi-select",
        filterSelectOptions: projects.map((p) => p.name),
      },
      {
        accessorKey: "ea_act.name",
        header: "EA Act",
        filterVariant: "multi-select",
        filterSelectOptions: eaActs.map((e) => e.name),
      },
      {
        accessorKey: "work_type.name",
        header: "Work type",
        filterVariant: "multi-select",
        filterSelectOptions: workTypes.map((w) => w.name),
      },
      {
        accessorKey: "ministry.abbreviation",
        header: "Ministry",
        filterVariant: "multi-select",
        filterSelectOptions: ministries.map((m) => m.abbreviation),
      },
      {
        accessorKey: "eao_team.name",
        header: "Team",
        filterVariant: "multi-select",
        filterSelectOptions: teams.map((t) => t.name),
      },
      {
        accessorKey: "current_phase.name",
        header: "Current Phase",
        filterVariant: "multi-select",
        filterSelectOptions: phases.map((p) => p.name),
      },
      {
        accessorKey: "is_active",
        header: "Active",
        filterVariant: "checkbox",
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && (
              <Chip label="Active" color="primary" />
            )}
            {!cell.getValue<boolean>() && (
              <Chip label="Inactive" color="error" />
            )}
          </span>
        ),
      },
    ],
    [projects, phases, teams, ministries, workTypes, eaActs]
  );
  return (
    <>
      <EpicTrackPageGridContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
          <MasterTrackTable
            columns={columns}
            data={works}
            state={{
              isLoading: resultStatus === RESULT_STATUS.LOADING,
              showGlobalFilter: true,
            }}
            enableRowActions={true}
            renderRowActions={({ row }: any) => (
              <Box>
                {/* <IconButton onClick={() => onEdit(row.original.id)}>
                  <EditIcon />
                </IconButton> */}
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
                    setShowDialog(true);
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
      </EpicTrackPageGridContainer>
      <TrackDialog
        open={showDialog}
        dialogTitle={(workId ? "Update " : "Create ") + titleSuffix}
        onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
      >
        <WorkTombstoneForm
          onCancel={onDialogClose}
          workId={workId}
          onSubmitSuccess={getWorks}
        />
      </TrackDialog>
      <TrackDialog
        open={showDeleteDialog}
        dialogTitle="Delete"
        dialogContentText="Are you sure you want to delete?"
        okButtonText="Yes"
        cancelButtonText="No"
        isActionsRequired
        onCancel={() => setShowDeleteDialog(!showDeleteDialog)}
        onOk={() => deleteWork(deleteWorkId)}
      />
    </>
  );
};

export default WorkList;
