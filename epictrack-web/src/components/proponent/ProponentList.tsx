import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Box, Button, Grid, Stack, Typography } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { ETCaption2, ETGridTitle, ETPageContainer } from "components/shared";
import { ETChip } from "components/shared/chip/ETChip";
import TableFilter from "components/shared/filterSelect/TableFilter";
import { Staff } from "../../models/staff";
import { Proponent } from "../../models/proponent";
import staffService from "../../services/staffService/staffService";
import proponentService from "../../services/proponentService/proponentService";
import { getSelectFilterOptions } from "components/shared/MasterTrackTable/utils";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { debounce } from "lodash";
import { useAppSelector } from "../../hooks";
import { useCachedState } from "hooks/useCachedFilters";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE, ROLES } from "constants/application-constant";
import { hasPermission, Restricted } from "components/shared/restricted";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import UserMenu from "components/shared/userMenu/UserMenu";
import { Palette } from "styles/theme";
import { ProponentDialog } from "./Dialog";

const proponentsListColumnFiltersCacheKey = "proponents-listing-column-filters";

const ProponentList = () => {
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    proponentsListColumnFiltersCacheKey,
    []
  );
  const [loadingProponents, setLoadingProponents] = useState(true);
  const [proponentId, setProponentId] = useState<number>();
  const [proponents, setProponents] = useState<Proponent[]>([]);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [relationshipHolder, setRelationshipHolder] = useState<Staff>();
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const menuHoverRef = useRef(false);

  const fetchProponents = async () => {
    setLoadingProponents(true);
    try {
      const response = await proponentService.getAll();
      setProponents((response.data as Proponent[]) || []);
      setLoadingProponents(false);
    } catch (error) {
      showNotification("Could not load Projects", { type: "error" });
    }
  };

  useEffect(() => {
    fetchProponents();
  }, []);

  const handleOpenUserMenu = (
    event: React.MouseEvent<HTMLElement>,
    staff: Staff
  ) => {
    setRelationshipHolder(staff);
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = debounce(() => {
    if (!menuHoverRef.current) {
      setUserMenuAnchorEl(null);
      setRelationshipHolder(undefined);
    }
  }, 100); // 100ms delay

  const statusesOptions = getSelectFilterOptions(
    proponents,
    "is_active",
    (value) => (value ? "Active" : "Inactive"),
    (value) => value
  );

  const columns = useMemo<MRT_ColumnDef<Proponent>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: canEdit
          ? ({ cell, row, renderedCellValue }) => (
              <ETGridTitle
                to={"#"}
                onClick={() => {
                  setProponentId(row.original.id);
                  setShowFormDialog(true);
                }}
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
        accessorKey: "relationship_holder.full_name",
        header: "Relationship Holder",
        filterSelectOptions: staffs.map((s) => s.full_name),
        Cell: ({ row }) => {
          const user = row.original.relationship_holder;
          if (user === undefined || user === null) return <></>;
          return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Avatar
                sx={{
                  backgroundColor: Palette.neutral.bg.main,
                  color: Palette.neutral.accent.dark,
                  fontSize: "1rem",
                  lineHeight: "1.3rem",
                  fontWeight: 700,
                  width: "2rem",
                  height: "2rem",
                }}
                onMouseEnter={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  handleCloseUserMenu.cancel();
                  handleOpenUserMenu(event, user);
                }}
                onMouseLeave={handleCloseUserMenu}
              >
                <ETCaption2 bold>
                  {`${user?.first_name[0]}${user?.last_name[0]}`}
                </ETCaption2>
              </Avatar>
              <Typography
                style={{
                  fontWeight: "400",
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                  color: Palette.neutral.dark,
                }}
                component="span"
              >
                {user.full_name}
              </Typography>
            </Stack>
          );
        },
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
                name="statusFilter"
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
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
      },
    ],
    [canEdit, handleCloseUserMenu, staffs, statusesOptions]
  );

  const getStaffs = async () => {
    try {
      const staffsResult = await staffService.getAll();
      if (staffsResult.status === 200) {
        setStaffs(staffsResult.data as never);
      }
    } catch (error) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };
  useEffect(() => {
    getStaffs();
  }, []);

  const handleCacheFilters = (filters?: ColumnFilter[]) => {
    if (!filters) {
      return;
    }
    setColumnFilters(filters);
  };

  return (
    <ETPageContainer direction="row" container columnSpacing={2} rowSpacing={3}>
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
            columnFilters,
          }}
          state={{
            isLoading: loadingProponents,
            showGlobalFilter: true,
          }}
          tableName={"proponent-listing"}
          enableExport
          renderTopToolbarCustomActions={({ table }) => (
            <Restricted
              allowed={[ROLES.CREATE]}
              errorProps={{ disabled: true }}
            >
              <Button
                onClick={() => {
                  setShowFormDialog(true);
                  setProponentId(undefined);
                }}
                variant="contained"
              >
                Create Proponent
              </Button>
            </Restricted>
          )}
          onCacheFilters={handleCacheFilters}
        />
      </Grid>
      <UserMenu
        anchorEl={userMenuAnchorEl}
        email={relationshipHolder?.email || ""}
        phone={relationshipHolder?.phone || ""}
        position={relationshipHolder?.position?.name || ""}
        firstName={relationshipHolder?.first_name || ""}
        lastName={relationshipHolder?.last_name || ""}
        onClose={handleCloseUserMenu}
        onMouseEnter={(event) => {
          event.stopPropagation();
          event.preventDefault();
          handleCloseUserMenu.cancel();
          menuHoverRef.current = true;
        }}
        onMouseLeave={() => {
          menuHoverRef.current = false;
          handleCloseUserMenu();
        }}
        origin={{ vertical: "top", horizontal: "left" }}
        sx={{
          marginTop: "2.1em",
          pointerEvents: "none",
        }}
        id={`relationship_holder_${relationshipHolder?.id || ""}`}
      />
      <ProponentDialog
        proponentId={proponentId}
        open={showFormDialog}
        setOpen={setShowFormDialog}
        saveProponentCallback={fetchProponents}
      />
    </ETPageContainer>
  );
};

export default ProponentList;
