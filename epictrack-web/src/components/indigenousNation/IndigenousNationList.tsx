import { useEffect, useMemo, useRef, useState } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { debounce } from "lodash";
import { Avatar, Box, Button, Grid, Stack, Typography } from "@mui/material";
import { FirstNation } from "models/firstNation";
import { Staff } from "models/staff";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { getSelectFilterOptions } from "components/shared/MasterTrackTable/utils";
import { hasPermission, Restricted } from "components/shared/restricted";
import { ETChip } from "components/shared/chip/ETChip";
import TableFilter from "components/shared/filterSelect/TableFilter";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { showNotification } from "components/shared/notificationProvider";
import UserMenu from "components/shared/userMenu/UserMenu";
import { ETCaption2, ETGridTitle, ETPageContainer } from "../shared";
import staffService from "services/staffService/staffService";
import IndigenousNationService from "services/indigenousNationService/indigenousNationService";
import {
  COMMON_ERROR_MESSAGE,
  ROLES,
} from "../../constants/application-constant";
import { useAppSelector } from "../../hooks";
import { useCachedState } from "hooks/useCachedFilters";
import { Palette } from "styles/theme";
import { FirstNationDialog } from "./Dialog";

const firstNationListColumnFiltersCacheKey =
  "first-nation-listing-column-filters";

const FirstNationList = () => {
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    firstNationListColumnFiltersCacheKey,
    []
  );
  const [firstNationId, setFirstNationId] = useState<number>();
  const [firstNations, setFirstNations] = useState<FirstNation[]>([]);
  const [loading, setLoading] = useState(true);
  const [relationshipHolder, setRelationshipHolder] = useState<Staff>();
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const menuHoverRef = useRef(false);

  const fetchFirstNations = async () => {
    setLoading(true);
    try {
      const response = await IndigenousNationService.getAll();
      setFirstNations(response.data);
      setLoading(false);
    } catch (error) {
      showNotification("Could not load First Nations", { type: "error" });
    }
  };

  useEffect(() => {
    fetchFirstNations();
  }, []);

  const orgTypes = useMemo(
    () =>
      getSelectFilterOptions(
        firstNations,
        "pip_org_type",
        (value) => value?.name,
        (value) => value?.name
      ),
    [firstNations]
  );

  const statusesOptions = getSelectFilterOptions(
    firstNations,
    "is_active",
    (value) => (value ? "Active" : "Inactive"),
    (value) => value
  );

  const handleCloseUserMenu = debounce(() => {
    if (!menuHoverRef.current) {
      setUserMenuAnchorEl(null);
      setRelationshipHolder(undefined);
    }
  }, 100); // 100ms delay

  const handleOpenUserMenu = (
    event: React.MouseEvent<HTMLElement>,
    staff: Staff
  ) => {
    setRelationshipHolder(staff);
    setUserMenuAnchorEl(event.currentTarget);
  };

  const columns = useMemo<MRT_ColumnDef<FirstNation>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: canEdit
          ? ({ cell, row, renderedCellValue }) => (
              <Restricted allowed={[ROLES.EDIT]} RenderError={undefined}>
                <ETGridTitle
                  to={"#"}
                  onClick={() => {
                    setFirstNationId(row.original.id);
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
        accessorKey: "pip_org_type.name",
        header: "Organization Type",
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="positionsFilter"
            />
          );
        },
        filterSelectOptions: orgTypes,
        filterFn: "multiSelectFilter",
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
        size: 115,
        Filter: ({ header, column }) => (
          <Box sx={{ width: "100px" }}>
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="statusFilter"
            />
          </Box>
        ),
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > statusesOptions.length
          ) {
            return true;
          }
          return filterValue.includes(row.getValue(id));
        },
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
      },
    ],
    [canEdit, handleCloseUserMenu, orgTypes, staffs, statusesOptions]
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
    <ETPageContainer container columnSpacing={2} rowSpacing={3}>
      <Grid item xs={12}>
        <MasterTrackTable
          columns={columns}
          data={firstNations}
          initialState={{
            sorting: [{ id: "name", desc: false }],
            columnFilters,
          }}
          state={{ isLoading: loading, showGlobalFilter: true }}
          tableName={"first-nation-listing"}
          enableExport
          renderTopToolbarCustomActions={() => (
            <Restricted
              allowed={[ROLES.CREATE]}
              errorProps={{ disabled: true }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  setShowFormDialog(true);
                  setFirstNationId(undefined);
                }}
              >
                Create First Nation
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
      <FirstNationDialog
        firstNationId={firstNationId}
        open={showFormDialog}
        saveFirstNationCallback={fetchFirstNations}
        setOpen={setShowFormDialog}
      />
    </ETPageContainer>
  );
};

export default FirstNationList;
