import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton } from "@mui/material";
import { RESULT_STATUS } from "../../constants/application-constant";
import StaffForm from "./StaffForm";
import { Staff } from "../../models/staff";
import StaffService from "../../services/staffService";
import MasterTrackTable from "../shared/MasterTrackTable";
import TrackDialog from "../shared/TrackDialog";
import { EpicTrackPageGridContainer } from "../shared";

const StaffList = () => {
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [staffId, setStaffId] = React.useState<number>();
  const [deleteStaffId, setDeleteStaffId] = React.useState<number>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const [positions, setPositions] = React.useState<string[]>([]);

  const titleSuffix = "Staff Details";
  const onDialogClose = (event: any, reason: any) => {
    if (reason && reason == "backdropClick") return;
    setShowDialog(false);
  };
  const onEdit = (id: number) => {
    setStaffId(id);
    setShowDialog(true);
  };
  const getStaff = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const staffResult = await StaffService.getStaffs();
      if (staffResult.status === 200) {
        setStaffs((staffResult.data as never)["staffs"]);
      }
    } catch (error) {
      console.error("Staff List: ", error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  React.useEffect(() => {
    getStaff();
  }, [getStaff]);
  React.useEffect(() => {
    const positions = staffs
      .map((p) => p.position?.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setPositions(positions);
  }, [staffs]);

  const handleDelete = (id: number) => {
    setShowDeleteDialog(true);
    setDeleteStaffId(id);
  };

  const deleteStaff = async (id?: number) => {
    const result = await StaffService.deleteStaff(id);
    if (result.status === 200) {
      setDeleteStaffId(undefined);
      setShowDeleteDialog(false);
      getStaff();
    }
  };

  const columns = React.useMemo<MRT_ColumnDef<Staff>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Name",
        sortingFn: "sortFn",
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "position.name",
        header: "Position",
        filterVariant: "multi-select",
        filterSelectOptions: positions,
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
    [positions]
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
            data={staffs}
            initialState={{
              sorting: [
                {
                  id: "full_name",
                  desc: false,
                },
              ],
            }}
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
                    setStaffId(undefined);
                  }}
                  variant="contained"
                >
                  Create Staff
                </Button>
              </Box>
            )}
          />
        </Grid>
      </EpicTrackPageGridContainer>
      <TrackDialog
        open={showDialog}
        dialogTitle={(staffId ? "Update " : "Create ") + titleSuffix}
        onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
      >
        <StaffForm
          onCancel={onDialogClose}
          staffId={staffId}
          onSubmitSuccess={getStaff}
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
        onOk={() => deleteStaff(deleteStaffId)}
      />
    </>
  );
};

export default StaffList;
