import React from "react";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, IconButton, Grid, Chip } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer } from "../shared";
import ProponentForm from "./ProponentForm";
import { Staff } from "../../models/staff";
import staffService from "../../services/staffService/staffService";
import { Proponent } from "../../models/proponent";
import { MasterContext } from "../shared/MasterContext";
import proponentService from "../../services/proponentService/proponentService";
import { ActiveChip, InactiveChip } from "../shared/chip/ETChip";

export default function ProponentList() {
  const [proponentId, setProponentId] = React.useState<number>();
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setForm(<ProponentForm proponentId={proponentId} />);
  }, [proponentId]);

  const onEdit = (id: number) => {
    setProponentId(id);
    ctx.setShowModalForm(true);
  };

  React.useEffect(() => {
    ctx.setService(proponentService);
  }, []);

  const proponents = React.useMemo(() => ctx.data as Proponent[], [ctx.data]);
  const columns = React.useMemo<MRT_ColumnDef<Proponent>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ cell, row }) => (
          <ETGridTitle to={"#"} onClick={() => onEdit(row.original.id)}>
            {cell.getValue<string>()}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
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
              <ActiveChip label="Active" color="primary" />
            )}
            {!cell.getValue<boolean>() && (
              <InactiveChip label="Inactive" color="error" />
            )}
          </span>
        ),
      },
    ],
    [staffs]
  );

  const getStaffs = async () => {
    const staffsResult = await staffService.getAll();
    if (staffsResult.status === 200) {
      setStaffs(staffsResult.data as never);
    }
  };
  React.useEffect(() => {
    getStaffs();
  }, []);

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
            data={proponents}
            initialState={{
              sorting: [
                {
                  id: "name",
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
                <Button
                  onClick={() => {
                    ctx.setShowModalForm(true);
                    setProponentId(undefined);
                  }}
                  variant="contained"
                >
                  Create Proponent
                </Button>
              </Box>
            )}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
}
