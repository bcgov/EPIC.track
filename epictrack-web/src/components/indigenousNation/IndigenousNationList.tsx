import React, { useMemo } from "react";
import { Box, Button, Grid } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import indigenousNationService from "../../services/indigenousNationService/indigenousNationService";
import { FirstNation } from "../../models/firstNation";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer } from "../shared";
import IndigenousNationForm from "./IndigenousNationForm";
import { Staff } from "../../models/staff";
import staffService from "../../services/staffService/staffService";
import { MasterContext } from "../shared/MasterContext";
import { ActiveChip, InactiveChip } from "../shared/chip/ETChip";
import TableFilter from "../shared/filterSelect/TableFilter";
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import { searchFilter } from "../shared/MasterTrackTable/filters";
import { Restricted, hasPermission } from "../shared/restricted";
import { ROLES } from "../../constants/application-constant";
import { useAppSelector } from "../../hooks";

export default function IndigenousNationList() {
  const [indigenousNationID, setIndigenousNationID] = React.useState<number>();
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const ctx = React.useContext(MasterContext);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });

  React.useEffect(() => {
    ctx.setForm(
      <IndigenousNationForm indigenousNationID={indigenousNationID} />
    );
  }, [indigenousNationID]);

  React.useEffect(() => {
    ctx.setTitle("First Nation");
  }, [ctx.title]);

  const onEdit = (id: number) => {
    setIndigenousNationID(id);
    ctx.setShowModalForm(true);
  };

  React.useEffect(() => {
    ctx.setService(indigenousNationService);
  }, []);

  const indigenousNations = React.useMemo(
    () => ctx.data as FirstNation[],
    [ctx.data]
  );

  const statusesOptions = useMemo(
    () =>
      getSelectFilterOptions(
        indigenousNations,
        "is_active",
        (value) => (value ? "Active" : "Inactive"),
        (value) => value
      ),
    [indigenousNations]
  );

  const columns = React.useMemo<MRT_ColumnDef<FirstNation>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: canEdit
          ? ({ cell, row, renderedCellValue }) => (
              <ETGridTitle
                to={"#"}
                onClick={() => onEdit(row.original.id)}
                enableTooltip={true}
                tooltip={cell.getValue<string>()}
              >
                {renderedCellValue}
              </ETGridTitle>
            )
          : undefined,
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "pip_org_type.name",
        header: "Organization Type",
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
    [staffs, indigenousNations]
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
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "right",
                }}
              >
                <Restricted
                  allowed={[ROLES.CREATE]}
                  errorProps={{ disabled: true }}
                >
                  <Button
                    onClick={() => {
                      ctx.setShowModalForm(true);
                      setIndigenousNationID(undefined);
                    }}
                    variant="contained"
                  >
                    Create First Nation
                  </Button>
                </Restricted>
              </Box>
            )}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
}
