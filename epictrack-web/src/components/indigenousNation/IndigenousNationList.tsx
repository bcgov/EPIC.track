import React, { useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import indigenousNationService from "../../services/indigenousNationService/indigenousNationService";
import { FirstNation } from "../../models/firstNation";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETCaption2, ETGridTitle, ETPageContainer, IButton } from "../shared";
import IndigenousNationForm from "./IndigenousNationForm";
import { Staff } from "../../models/staff";
import staffService from "../../services/staffService/staffService";
import { MasterContext } from "../shared/MasterContext";
import { ETChip } from "../shared/chip/ETChip";
import TableFilter from "../shared/filterSelect/TableFilter";
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import { searchFilter } from "../shared/MasterTrackTable/filters";
import { Restricted, hasPermission } from "../shared/restricted";
import { ROLES } from "../../constants/application-constant";
import { useAppSelector } from "../../hooks";
import UserMenu from "components/shared/userMenu/UserMenu";
import { debounce } from "lodash";
import { Palette } from "styles/theme";
import { useCachedState } from "hooks/useCachedFilters";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";

const firstNationsColumnFiltersCacheKey =
  "first-nations-listing-column-filters";
export default function IndigenousNationList() {
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    firstNationsColumnFiltersCacheKey,
    []
  );
  const [indigenousNationID, setIndigenousNationID] = React.useState<number>();
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const ctx = React.useContext(MasterContext);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const [userMenuAnchorEl, setUserMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [relationshipHolder, setRelationshipHolder] = React.useState<Staff>();
  const menuHoverRef = React.useRef(false);
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

  const orgTypes = useMemo(
    () =>
      getSelectFilterOptions(
        indigenousNations,
        "pip_org_type",
        (value) => value?.name,
        (value) => value?.name
      ),
    [indigenousNations]
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
                <ETCaption2
                  bold
                >{`${user?.first_name[0]}${user?.last_name[0]}`}</ETCaption2>
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
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
      },
    ],
    [staffs, indigenousNations, userMenuAnchorEl, relationshipHolder]
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

  const handleCacheFilters = (filters?: ColumnFilter[]) => {
    if (!filters) {
      return;
    }
    setColumnFilters(filters);
  };

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
              columnFilters,
            }}
            state={{
              isLoading: ctx.loading,
              showGlobalFilter: true,
            }}
            tableName="first-nations-listing"
            enableExport
            renderTopToolbarCustomActions={({ table }) => (
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
      </ETPageContainer>
    </>
  );
}
