import React, { useContext, useEffect, useMemo, useState } from "react";
import { Box, Button, Grid } from "@mui/material";
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
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import TableFilter from "../shared/filterSelect/TableFilter";

export default function ProponentList() {
  const [proponentId, setProponentId] = useState<number>();
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const ctx = useContext(MasterContext);

  useEffect(() => {
    ctx.setForm(<ProponentForm proponentId={proponentId} />);
  }, [proponentId]);

  const onEdit = (id: number) => {
    setProponentId(id);
    ctx.setShowModalForm(true);
  };

  useEffect(() => {
    ctx.setService(proponentService);
  }, []);

  const proponents = useMemo(() => ctx.data as Proponent[], [ctx.data]);
  const statusesOptions = getSelectFilterOptions(
    proponents,
    "is_active",
    (value) => (value ? "Active" : "Inactive"),
    (value) => value
  );

  console.log("proponents", proponents);
  console.log("statusesOptions", statusesOptions);

  const columns = useMemo<MRT_ColumnDef<Proponent>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ cell, row }) => (
          <ETGridTitle
            to={"#"}
            onClick={() => onEdit(row.original.id)}
            enableTooltip={true}
            tooltip={cell.getValue<string>()}
          >
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
        header: "Status",
        filterVariant: "multi-select",
        filterSelectOptions: statusesOptions,
        size: 60,
        Filter: ({ header, column }) => {
          return (
            <Box sx={{ width: "100px" }}>
              <TableFilter
                isMulti
                header={header}
                column={column}
                variant="inline"
                name="rolesFilter"
              />
            </Box>
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > statusesOptions.length // select all is selected
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
    [staffs, proponents]
  );

  const getStaffs = async () => {
    const staffsResult = await staffService.getAll();
    if (staffsResult.status === 200) {
      setStaffs(staffsResult.data as never);
    }
  };
  useEffect(() => {
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
