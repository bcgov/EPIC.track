import React from "react";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, IconButton, Grid, Chip } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import indigenousNationService from "../../services/indigenousNationService/indigenousNationService";
import { IndigenousNation } from "../../models/indigenousNation";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer } from "../shared";
import IndigenousNationForm from "./IndigneousNationForm";
import { Staff } from "../../models/staff";
import staffService from "../../services/staffService/staffService";
import { MasterContext } from "../shared/MasterContext";
import { ActiveChip, InactiveChip } from "../shared/chip/Chip";

export default function IndigenousNationList() {
  const [indigenousNationID, setIndigenousNationID] = React.useState<number>();
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const ctx = React.useContext(MasterContext);
  React.useEffect(() => {
    ctx.setForm(
      <IndigenousNationForm indigenousNationID={indigenousNationID} />
    );
  }, [indigenousNationID]);

  React.useEffect(() => {
    ctx.setTitle("Indigenous Nation");
  }, [ctx.title]);

  const onEdit = (id: number) => {
    setIndigenousNationID(id);
    ctx.setShowModalForm(true);
  };

  React.useEffect(() => {
    ctx.setService(indigenousNationService);
  }, []);

  const indigenousNations = React.useMemo(
    () => ctx.data as IndigenousNation[],
    [ctx.data]
  );

  const handleDelete = (id: string) => {
    ctx.setShowDeleteDialog(true);
    ctx.setId(id);
  };

  const columns = React.useMemo<MRT_ColumnDef<IndigenousNation>[]>(
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
            data={indigenousNations}
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
                    setIndigenousNationID(undefined);
                  }}
                  variant="contained"
                >
                  Create Indigenous Nation
                </Button>
              </Box>
            )}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
}
