import { FC, useEffect, useMemo, useState } from "react";
import { MRT_ColumnDef, MRT_TableOptions } from "material-react-table";
import { Box, Grid, IconButton } from "@mui/material";
import { getErrorMessage } from "utils/axiosUtils";
import { useCachedState } from "hooks/useCachedFilters";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { ETChip } from "components/shared/chip/ETChip";
import { ETSubhead } from "components/shared";
import { getSelectFilterOptions } from "components/shared/MasterTrackTable/utils";
import { Restricted } from "components/shared/restricted";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { showNotification } from "components/shared/notificationProvider";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import TrackSelect from "components/shared/TrackSelect";
import elevatedRoleService from "services/elevatedRoleService";
import staffElevatedRoleService from "services/staffElevatedRoleService/staffElevatedRoleService";
import staffService from "services/staffService/staffService";
import { ROLES } from "constants/application-constant";
import { ElevatedRole } from "models/elevated_role";
import { Staff, StaffElevatedRole, StaffWithElevatedRoles } from "models/staff";
import { Palette } from "styles/theme";
import { getStatusFilter } from "components/shared/filterSelect/utils";

const EditIcon: FC<IconProps> = Icons["PencilEditIcon"];
const CheckIcon: FC<IconProps> = Icons["CheckIcon"];
const CancelIcon: FC<IconProps> = Icons["CloseXIcon"];

const userManagementListColumnFiltersCacheKey =
  "user-management-listing-column-filters";

const UserManagementList = () => {
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    userManagementListColumnFiltersCacheKey,
    [
      {
        id: "position.name",
        value: ["IPE"],
      },
      {
        id: "is_active",
        value: [true],
      },
    ]
  );
  const [elevatedRoles, setElevatedRoles] = useState<ElevatedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffElevatedRoles, setStaffElevatedRoles] = useState<
    StaffElevatedRole[]
  >([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [staffsWithElevatedRoles, setStaffsWithElevatedRoles] = useState<
    StaffWithElevatedRoles[]
  >([]);

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const response = await staffService.getAll();
      setStaffs((response.data as StaffWithElevatedRoles[]) || []);
    } catch (error) {
      showNotification("Could not load Staffs", {
        duration: 3000,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffElevatedRoles = async () => {
    setLoading(true);
    try {
      const response = await staffElevatedRoleService.getAll();
      setStaffElevatedRoles((response.data as StaffElevatedRole[]) || []);
    } catch (error) {
      showNotification("Could not load Staff Additional Roles", {
        duration: 3000,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchElevatedRoles = async () => {
    try {
      const response = await elevatedRoleService.getAll();
      setElevatedRoles((response.data as ElevatedRole[]) || []);
    } catch (error) {
      showNotification("Could not load elevated roles", { type: "error" });
    }
  };

  useEffect(() => {
    fetchStaffs();
    fetchElevatedRoles();
    fetchStaffElevatedRoles();
  }, []);

  const elevatedRoleOptions = useMemo(() => {
    return elevatedRoles
      .filter((role: ElevatedRole) => role?.name)
      .map((role) => {
        return {
          value: role.id,
          label: role.name,
        };
      });
  }, [elevatedRoles]);

  const positions = useMemo(
    () =>
      getSelectFilterOptions(
        staffs,
        "position",
        (value) => value?.name,
        (value) => value?.name
      ),
    [staffs]
  );

  useEffect(() => {
    if (staffs.length && staffElevatedRoles.length) {
      const updatedStaffs = staffs.map((staff) => {
        const roles = staffElevatedRoles
          .filter((ser) => ser.staff_id === staff.id)
          .map((ser) => {
            const el = elevatedRoles.find(
              (er) => er.id === ser.elevated_role_id
            );
            return {
              id: ser.elevated_role_id,
              name: el ? el.name : "",
            };
          });
        return {
          ...staff,
          elevated_roles: roles,
        } as StaffWithElevatedRoles;
      });
      setStaffsWithElevatedRoles(updatedStaffs);
    } else if (staffs.length && !staffElevatedRoles.length) {
      setStaffsWithElevatedRoles(
        staffs.map((staff) => {
          return {
            ...staff,
            elevated_roles: [],
          } as StaffWithElevatedRoles;
        })
      );
    }
  }, [elevatedRoles, staffElevatedRoles, staffs]);

  const statusesOptions = getSelectFilterOptions(
    staffs,
    "is_active",
    (value) => (value ? "Active" : "Inactive"),
    (value) => value
  );

  const columns = useMemo<MRT_ColumnDef<StaffWithElevatedRoles>[]>(
    () => [
      {
        accessorKey: "full_name",
        enableEditing: false,
        filterFn: searchFilter,
        header: "Name",
        sortingFn: "sortFn",
        size: 180,
      },
      {
        accessorKey: "phone",
        enableEditing: false,
        header: "Phone Number",
        size: 120,
      },
      {
        accessorKey: "email",
        enableEditing: false,
        header: "Email",
      },
      {
        id: "position.name",
        accessorFn: (row) => row.position.name,
        enableEditing: false,
        filterVariant: "multi-select",
        header: "Position",
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
        filterSelectOptions: positions,
        filterFn: "multiSelectFilter",
      },
      {
        accessorKey: "is_active",
        enableEditing: false,
        header: "Status",
        filterVariant: "multi-select",
        filterSelectOptions: statusesOptions,
        size: 110,
        Filter: getStatusFilter<StaffWithElevatedRoles>,
        filterFn: "multiSelectFilter",
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
      },
      {
        id: "elevated_roles",
        accessorFn: (row) => {
          return (
            <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
              {row.elevated_roles
                ?.map((elevated_roles) => elevated_roles.name)
                .join(", ")}
            </div>
          );
        },
        header: "Additional Role",
        enableEditing: true,
        editSelectOptions: elevatedRoleOptions,
        editVariant: "select",
        filterVariant: "multi-select",
        filterSelectOptions: elevatedRoleOptions.map((option) =>
          String(option.label)
        ),
        size: 200,
        Edit: ({ column, row, table }) => {
          const onBlur = (newValue: any) => {
            const value = newValue.map((role: any) => role.value);
            row._valuesCache[column.id] = value;
            table.setEditingRow(row);
          };
          const defaultValues =
            row.original.elevated_roles?.map((role) => ({
              value: role.id,
              label: role.name,
            })) || [];

          return (
            <TrackSelect
              isMulti
              options={elevatedRoleOptions}
              defaultValue={defaultValues}
              onChange={onBlur}
              placeholder="Select Roles"
              closeMenuOnSelect={false}
            />
          );
        },
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: (row, id, filterValues) => {
          if (
            !filterValues.length ||
            filterValues.length > elevatedRoleOptions.length // select all is selected
          ) {
            return true;
          }
          const thisStaffsElevatedRoles: string[] =
            row.original.elevated_roles?.map((role) => role.name) || [];
          return filterValues.some((filterValue: string) =>
            thisStaffsElevatedRoles.includes(filterValue)
          );
        },
      },
    ],
    [elevatedRoleOptions, positions, statusesOptions]
  );

  const handleEditRowSave: MRT_TableOptions<StaffWithElevatedRoles>["onEditingRowSave"] =
    async ({ values, table, row }) => {
      const staff_id = Number(row.id);
      const elevated_roles_selected = values.elevated_roles || [];

      try {
        // Fetch previous roles
        const previousEntries: StaffElevatedRole[] =
          await staffElevatedRoleService
            .getAllStaffElevatedRoleByStaffId(String(staff_id))
            .then((res) => res.data)
            .catch((error) => {
              if (error.response?.status === 404) {
                return [];
              }
              throw error;
            });

        const previousRoleIds = previousEntries.map(
          (role) => role.elevated_role_id
        );

        // Find roles to update and/or add
        const rolesToUpdate = previousEntries.map((role) => ({
          ...role,
          is_active: elevated_roles_selected.includes(role.elevated_role_id),
        }));

        const newRoles = [...elevated_roles_selected].filter(
          (role) => !previousRoleIds.includes(role)
        );

        // Updates
        await Promise.all([
          ...rolesToUpdate.map((role) =>
            staffElevatedRoleService.update(role, role.id)
          ),
          ...newRoles.map((role) =>
            staffElevatedRoleService.create({
              elevated_role_id: Number(role),
              is_active: true,
              staff_id,
            })
          ),
        ]);

        // Notification and cleanup
        table.setEditingRow(null);
        fetchStaffElevatedRoles();
        showNotification(`Updated Additional Roles for ${values.full_name}`, {
          type: "success",
        });
      } catch (error) {
        showNotification(getErrorMessage(error), { type: "error" });
      }
    };

  const handleCacheFilters = (filters?: ColumnFilter[]) => {
    if (!filters) {
      return;
    }
    setColumnFilters(filters);
  };

  return (
    <Box sx={{ pt: 4 }}>
      <ETSubhead bold color={Palette.neutral.dark}>
        {" "}
        Assign Additional Roles to Users{" "}
      </ETSubhead>
      <Grid item xs={12}>
        <MasterTrackTable
          columns={columns}
          data={staffsWithElevatedRoles}
          editDisplayMode="row"
          enableEditing={true}
          enableRowActions={true}
          getRowId={(originalRow) => originalRow.id?.toString() || ""}
          initialState={{
            sorting: [
              {
                id: "full_name",
                desc: false,
              },
            ],
          }}
          onEditingRowCancel={({ table }) => {
            table.setEditingRow(null);
          }}
          onEditingRowSave={handleEditRowSave}
          onCacheFilters={handleCacheFilters}
          state={{ isLoading: loading, columnFilters }}
          tableName="user-management-listing"
          renderRowActions={({ row, table }) => (
            <Box>
              <Restricted
                allowed={[ROLES.MANAGE_USERS]}
                errorProps={{ disabled: true }}
              >
                <IconButton
                  color="primary"
                  onClick={() => {
                    table.setEditingRow(row);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Restricted>
            </Box>
          )}
          icons={{
            SaveIcon: (props: any) => (
              <CheckIcon {...props} fill={Palette.success.main} />
            ),
            CancelIcon: (props: any) => (
              <CancelIcon {...props} fill={Palette.error.main} />
            ),
          }}
        />
      </Grid>
    </Box>
  );
};

export default UserManagementList;
