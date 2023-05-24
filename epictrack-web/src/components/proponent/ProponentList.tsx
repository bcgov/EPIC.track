import React from "react";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, IconButton, Grid, Chip } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import { useState, useCallback, useMemo, useEffect } from "react";
import { RESULT_STATUS } from "../../constants/application-constant";
import ProponentService from "../../services/proponentService";
import MasterTrackTable from "../shared/MasterTrackTable";
import { EpicTrackPageGridContainer } from "../shared";
import TrackDialog from "../shared/TrackDialog";
import ProponentForm from "./ProponentForm";
import { Staff } from "../../models/staff";
import StaffService from "../../services/staffService";
import { Proponent } from "../../models/proponent";
import { sort } from "../../utils";

export default function ProponentList() {
  const [resultStatus, setResultStatus] = useState<string>();
  const [proponents, setProponents] = useState<Proponent[]>([]);
  const [proponentID, setProponentID] = useState<number>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const titleSuffix = "Proponent Details";
  const [staffs, setStaffs] = React.useState<Staff[]>([]);

  const columns = useMemo<MRT_ColumnDef<Proponent>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "relationship_holder.full_name",
        header: "Relationship Holder",
        filterSelectOptions: staffs.map((s) => s.full_name),
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
    [staffs]
  );

  const onDialogClose = (event: any, reason: any) => {
    if (reason && reason == "backdropClick") return;
    setShowDialog(false);
  };
  const onEdit = (id: number) => {
    setProponentID(id);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    setShowDeleteDialog(true);
    setProponentID(id);
  };

  const getStaffs = async () => {
    const staffsResult = await StaffService.getStaffs();
    if (staffsResult.status === 200) {
      setStaffs((staffsResult.data as never)["staffs"]);
    }
  };
  useEffect(() => {
    getStaffs();
  }, []);

  const getProponents = useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const proponentsResult = await ProponentService.getProponents();
      if (proponentsResult.status === 200) {
        setProponents(
          sort((proponentsResult.data as never)["proponents"], "name")
        );
      }
    } catch (error) {
      console.error("Proponent List: ", error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  const deleteProponent = async (id?: number) => {
    const result = await ProponentService.deleteProponent(id);
    if (result.status === 200) {
      setProponentID(undefined);
      setShowDeleteDialog(false);
      getProponents();
    }
  };

  useEffect(() => {
    getProponents();
  }, [getProponents]);

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
            data={proponents}
            state={{
              isLoading: resultStatus === RESULT_STATUS.LOADING,
              showGlobalFilter: true,
            }}
            enableRowActions={true}
            renderRowActions={({ row }: any) => (
              <Box>
                <IconButton onClick={() => onEdit(row.original.id)}>
                  <EditIcon />
                </IconButton>
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
                    setProponentID(undefined);
                  }}
                  variant="contained"
                >
                  Create Proponent
                </Button>
              </Box>
            )}
          />
        </Grid>
      </EpicTrackPageGridContainer>
      <TrackDialog
        open={showDialog}
        dialogTitle={(proponentID ? "Update " : "Create ") + titleSuffix}
        onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
      >
        <ProponentForm
          onCancel={onDialogClose}
          proponentID={proponentID}
          onSubmitSuccess={getProponents}
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
        onOk={() => deleteProponent(proponentID)}
      />
    </>
  );
}
