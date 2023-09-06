import React from "react";
import { MRT_ColumnDef, MRT_Row } from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton } from "@mui/material";
import StaffForm from "./StaffForm";
import { Staff } from "../../models/staff";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer, ETParagraph } from "../shared";
import { MasterContext } from "../shared/MasterContext";
import staffService from "../../services/staffService/staffService";
import { ActiveChip, InactiveChip } from "../shared/chip/ETChip";
import { Link } from "react-router-dom";
import { Palette } from "../../styles/theme";
import FilterSelect from "../shared/filterSelect/FilterSelect";

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
    if (staff) {
      const positions = staff
        .map((p) => p.position?.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
      setPositions(positions);
    }
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
        Cell: ({ cell, row }) => (
          <ETGridTitle to={"#"} onClick={() => onEdit(row.original.id)}>
            {cell.getValue<string>()}
          </ETGridTitle>
        ),
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
        Filter: ({ header, column }) => {
          return (
            <FilterSelect
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="positionsFilter"
            />
          );
        },
        filterSelectOptions: positions,
        filterFn: "multiSelectFilter",
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
    [positions]
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
                  variant="contained"
                  onClick={() => {
                    ctx.setShowModalForm(true);
                    setStaffId(undefined);
                  }}
                >
                  Create Staff
                </Button>
              </Box>
            )}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
};

export default StaffList;
