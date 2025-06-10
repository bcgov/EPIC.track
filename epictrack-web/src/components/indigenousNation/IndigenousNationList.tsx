import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { debounce, isEqual } from "lodash";
import { AxiosError } from "axios";
import { Avatar, Button, Grid, Stack, Typography } from "@mui/material";
import { ElevatedRoleEnum } from "models/elevated_role";
import { FirstNation } from "models/firstNation";
import { Staff } from "models/staff";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { getSelectFilterOptions } from "components/shared/MasterTrackTable/utils";
import { getStatusFilter } from "components/shared/filterSelect/utils";
import { hasPermission, Restricted } from "components/shared/restricted";
import { ETChip } from "components/shared/chip/ETChip";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { showNotification } from "components/shared/notificationProvider";
import UserMenu from "components/shared/userMenu/UserMenu";
import { ETCaption2, ETGridTitle, ETPageContainer } from "../shared";
import staffElevatedRoleService from "services/staffElevatedRoleService/staffElevatedRoleService";
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
  const [elevatedRoles, setElevatedRoles] = useState<number[]>([]);
  const [firstNationId, setFirstNationId] = useState<number>();
  const [firstNations, setFirstNations] = useState<FirstNation[]>([]);
  const [loading, setLoading] = useState(true);
  const [relationshipHolder, setRelationshipHolder] = useState<Staff>();
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const { roles, staffId } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({
    roles,
    elevatedRoles,
    allowed: [ROLES.EDIT],
    elevatedAllowed: [ElevatedRoleEnum.MANAGE_FIRST_NATIONS],
  });
  const menuHoverRef = useRef(false);

  const fetchFirstNations = async () => {
    setLoading(true);
    try {
      const response = await IndigenousNationService.getAll();
      setFirstNations(response.data || []);
      setLoading(false);
    } catch (error) {
      showNotification("Could not load First Nations", { type: "error" });
    }
  };

  useEffect(() => {
    fetchFirstNations();
  }, []);

  useEffect(() => {
    if (!staffId) {
      setElevatedRoles([]);
      return;
    }

    const fetchStaffElevatedRoles = async () => {
      try {
        const response =
          await staffElevatedRoleService.getActiveStaffElevatedRoleByStaffId(
            String(staffId)
          );
        setElevatedRoles(response.data.map((role) => role.elevated_role_id));
      } catch (error) {
        if ((error as AxiosError).response?.status === 404) {
          setElevatedRoles([]);
        } else {
          showNotification("Could not load Additional Roles", {
            type: "error",
          });
        }
      }
    };

    fetchStaffElevatedRoles();
  }, [staffId]);

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

  const statusesOptions = useMemo(
    () =>
      getSelectFilterOptions(
        firstNations,
        "is_active",
        (value) => (value ? "Active" : "Inactive"),
        (value) => value
      ),
    [firstNations]
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
              <Restricted
                allowed={[ROLES.EDIT]}
                elevatedRoles={elevatedRoles}
                elevatedAllowed={[ElevatedRoleEnum.MANAGE_FIRST_NATIONS]}
                RenderError={undefined}
              >
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
        filterFn: "multiSelectFilter",
        filterSelectOptions: orgTypes,
        filterVariant: "multi-select",
        header: "Organization Type",
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
        Filter: getStatusFilter<FirstNation>,
        filterFn: "multiSelectFilter",
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
      },
    ],
    [
      canEdit,
      elevatedRoles,
      handleCloseUserMenu,
      orgTypes,
      staffs,
      statusesOptions,
    ]
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

  const handleCacheFilters = useCallback(
    (filters?: ColumnFilter[]) => {
      if (!filters) {
        return;
      }
      setColumnFilters((prevFilters) => {
        return isEqual(prevFilters, filters) ? prevFilters : filters;
      });
    },
    [setColumnFilters]
  );

  const renderTopToolbarCustomActions = useCallback(
    () => (
      <Restricted
        allowed={[ROLES.CREATE]}
        elevatedAllowed={[ElevatedRoleEnum.MANAGE_FIRST_NATIONS]}
        elevatedRoles={elevatedRoles}
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
    ),
    [setShowFormDialog, setFirstNationId, elevatedRoles]
  );

  return (
    <ETPageContainer container columnSpacing={2} rowSpacing={3}>
      <Grid item xs={12}>
        <MasterTrackTable
          columns={columns}
          data={firstNations}
          initialState={{
            sorting: [
              {
                id: "name",
                desc: false,
              },
            ],
          }}
          loading={loading}
          renderResultCount
          state={{
            columnFilters: columnFilters,
            isLoading: loading,
            showGlobalFilter: true,
          }}
          tableName={"first-nation-listing"}
          enableExport
          renderTopToolbarCustomActions={renderTopToolbarCustomActions}
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
