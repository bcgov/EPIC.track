import { useCallback, useEffect, useMemo, useState } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Button, Grid } from "@mui/material";
import { Staff } from "../../models/staff";
import MasterTrackTable from "../shared/MasterTrackTable";
import { searchFilter } from "../shared/MasterTrackTable/filters";
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import { hasPermission, Restricted } from "../shared/restricted";
import { ETChip } from "../shared/chip/ETChip";
import { getStatusFilter } from "components/shared/filterSelect/utils";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { showNotification } from "components/shared/notificationProvider";
import { ETGridTitle, ETPageContainer } from "../shared";
import staffService from "../../services/staffService/staffService";
import { ROLES } from "../../constants/application-constant";
import { useAppSelector } from "../../hooks";
import { useCachedState } from "hooks/useCachedFilters";
import { StaffDialog } from "./Dialog";

const staffListColumnFiltersCacheKey = "staff-listing-column-filters";

const StaffList = () => {
  const [staffId, setStaffId] = useState<number>();
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [positions, setPositions] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    staffListColumnFiltersCacheKey,
    []
  );
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const response = await staffService.getAll();
      setStaffs((response.data as Staff[]) || []);
      setLoading(false);
    } catch (error) {
      showNotification("Could not load Staffs", { type: "error" });
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  useEffect(() => {
    if (staffs) {
      const positions = staffs
        .map((staffs) => staffs.position)
        .sort(
          (positionA, positionB) => positionA.sort_order - positionB.sort_order
        )
        .map((position) => position.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
      setPositions(positions);
    }
  }, [staffs]);

  const statusesOptions = useMemo(
    () =>
      getSelectFilterOptions(
        staffs,
        "is_active",
        (value) => (value ? "Active" : "Inactive"),
        (value) => value
      ),
    [staffs]
  );

  const columns = useMemo<MRT_ColumnDef<Staff>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Name",
        Cell: canEdit
          ? ({ cell, row, renderedCellValue }) => (
              <Restricted allowed={[ROLES.EDIT]} RenderError={undefined}>
                <ETGridTitle
                  to={"#"}
                  onClick={() => {
                    setStaffId(row.original.id);
                    setShowFormDialog(true);
                  }}
                  enableTooltip={true}
                  tooltip={cell.getValue<string>()}
                >
                  {renderedCellValue}
                </ETGridTitle>
              </Restricted>
            )
          : undefined,
        sortingFn: "sortFn",
        filterFn: searchFilter,
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
        filterFn: "multiSelectFilter",
      },
      {
        accessorKey: "is_active",
        header: "Status",
        filterVariant: "multi-select",
        filterSelectOptions: statusesOptions,
        size: 115,
        Filter: getStatusFilter<Staff>,
        filterFn: "multiSelectFilter",
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
      },
    ],
    [canEdit, statusesOptions, positions]
  );

  const handleCacheFilters = useCallback(
    (filters?: ColumnFilter[]) => {
      if (!filters) return;

      // Avoid update if filters are identical
      const current = JSON.stringify(columnFilters);
      const next = JSON.stringify(filters);

      if (current !== next) {
        setColumnFilters(filters);
      }
    },
    [columnFilters, setColumnFilters]
  );

  const renderTopToolbarCustomActions = useCallback(
    () => (
      <Restricted allowed={[ROLES.CREATE]} errorProps={{ disabled: true }}>
        <Button
          variant="contained"
          onClick={() => {
            setShowFormDialog(true);
            setStaffId(undefined);
          }}
        >
          Create Staff
        </Button>
      </Restricted>
    ),
    [setShowFormDialog, setStaffId]
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
            data={staffs}
            enableExport
            initialState={{
              sorting: [
                {
                  id: "full_name",
                  desc: false,
                },
              ],
              columnFilters,
            }}
            state={{
              isLoading: loading,
              showGlobalFilter: true,
            }}
            tableName={"staff-listing"}
            onCacheFilters={handleCacheFilters}
            renderTopToolbarCustomActions={renderTopToolbarCustomActions}
          />
        </Grid>
      </ETPageContainer>
      <StaffDialog
        open={showFormDialog}
        saveStaffCallback={fetchStaffs}
        setOpen={setShowFormDialog}
        staffId={staffId}
      />
    </>
  );
};

export default StaffList;
