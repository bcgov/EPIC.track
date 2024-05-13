import React, { useContext, useEffect, useMemo, useState } from "react";
import { Avatar, Box, Grid, Stack, Typography } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETCaption2, ETGridTitle, ETPageContainer } from "../shared";
import { Staff } from "../../models/staff";
import staffService from "../../services/staffService/staffService";
import { Proponent } from "../../models/proponent";
import { MasterContext } from "../shared/MasterContext";
import proponentService from "../../services/proponentService/proponentService";
import { ETChip } from "../shared/chip/ETChip";
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import TableFilter from "../shared/filterSelect/TableFilter";
import { hasPermission } from "../shared/restricted";
import { ROLES } from "../../constants/application-constant";
import { searchFilter } from "../shared/MasterTrackTable/filters";
import { useAppSelector } from "../../hooks";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { Palette } from "styles/theme";
import { debounce } from "lodash";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { useCachedState } from "hooks/useCachedFilters";
const proponentsListColumnFiltersCacheKey = "proponents-listing-column-filters";

export default function MyTasksList() {
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    proponentsListColumnFiltersCacheKey,
    []
  );
  const [proponentId, setProponentId] = useState<number>();
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const ctx = useContext(MasterContext);
  const [relationshipHolder, setRelationshipHolder] = React.useState<Staff>();
  const [userMenuAnchorEl, setUserMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const menuHoverRef = React.useRef(false);

  useEffect(() => {
    ctx.setForm(<></>);
  }, [proponentId]);

  const onEdit = (id: number) => {
    setProponentId(id);
    ctx.setShowModalForm(true);
  };

  useEffect(() => {
    ctx.setService(proponentService);
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
  }, 100);

  const proponents = useMemo(() => ctx.data as Proponent[], [ctx.data]);
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
        header: "Task",
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
        accessorKey: "relationship_holder.full_name",
        header: "Start Date",
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
        accessorKey: "name",
        header: "End Date",
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
        accessorKey: "name",
        header: "Progress",
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
        accessorKey: "name",
        header: "Assigned",
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
        accessorKey: "name",
        header: "Notes",
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
        accessorKey: "name",
        header: "Work",
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
    ],
    [staffs, proponents, userMenuAnchorEl, relationshipHolder]
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
              columnFilters,
            }}
            state={{
              isLoading: ctx.loading,
              showGlobalFilter: true,
            }}
            onCacheFilters={handleCacheFilters}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
}
