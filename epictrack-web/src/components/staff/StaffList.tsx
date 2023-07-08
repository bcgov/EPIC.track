import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton } from "@mui/material";
import StaffForm from "./StaffForm";
import { Staff } from "../../models/staff";
import MasterTrackTable from "../shared/MasterTrackTable";
import { EpicTrackPageGridContainer } from "../shared";
import { MasterContext } from "../shared/MasterContext";
import staffService from "../../services/staffService/staffService";

const StaffList = () => {
  const [staffId, setStaffId] = React.useState<number>();
  const [positions, setPositions] = React.useState<string[]>([]);
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setForm(<StaffForm staffId={staffId} />);
  }, [staffId]);

  const onEdit = (id: number) => {
    setStaffId(id);
    ctx.setShowModalForm(true);
  };

  React.useEffect(() => {
    ctx.setService(staffService);
  }, []);

  const staff = React.useMemo(() => ctx.data as Staff[], [ctx.data]);

  React.useEffect(() => {
    const positions = staff
      .map((p) => p.position?.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setPositions(positions);
  }, [staff]);

  const handleDelete = (id: string) => {
    ctx.setShowDeleteDialog(true);
    ctx.setId(id);
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
            data={staff}
            initialState={{
              sorting: [
                {
                  id: "full_name",
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
                    ctx.setShowModalForm(true);
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
    </>
  );
};

export default StaffList;
