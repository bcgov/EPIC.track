import React, { useEffect } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from "material-react-table";
import {
  Box,
  Button,
  IconButton,
  FormHelperText,
  Grid,
  Tooltip,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { Group, User } from "../../models/user";
import { RESULT_STATUS } from "../../constants/application-constant";
import UserService from "../../services/userService";
import { ETPageContainer } from "../shared";
import Select from "react-select";
import MasterTrackTable, {
  MaterialReactTableProps,
} from "../shared/MasterTrackTable";
import { UserGroupUpdate } from "../../services/userService/type";
import { useAppSelector } from "../../hooks";
import { searchFilter } from "components/shared/MasterTrackTable/filters";

const UserList = () => {
  const [isValidGroup, setIsValidGroup] = React.useState<boolean>(true);
  const [updatedOn, setUpdatedOn] = React.useState<number>(
    new Date().getMilliseconds()
  );
  const userDetails = useAppSelector((state) => state.user.userDetail);

  const getUsers = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const userResult = await UserService.getUsers();
      if (userResult.status === 200) {
        const sortedResults = (userResult.data as User[]).sort((a, b) => {
          const aValue = a.group?.level ?? -0;
          const bValue = b.group?.level ?? -0;
          return bValue - aValue;
        });
        setUsers(sortedResults as never);
      }
    } catch (error) {
      console.error("User List: ", error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  const getGroups = React.useCallback(async () => {
    try {
      const groupResult = await UserService.getGroups();
      if (groupResult.status === 200) {
        setGroups(groupResult.data as Group[]);
      }
    } catch (error) {
      console.error("Group List: ", error);
    }
  }, []);

  React.useEffect(() => {
    getUsers();
  }, [updatedOn]);

  React.useEffect(() => {
    getGroups();
  }, []);

  const [groups, setGroups] = React.useState<Group[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [selectedGroup, setSelectedGroup] = React.useState<
    Group | undefined | null
  >();
  const currentUserGroup = React.useMemo<Group>(() => {
    return groups
      .filter((p) => userDetails.groups.includes(p.path))
      .sort((a, b) => b.level - a.level)[0];
  }, [userDetails, groups]);

  const columns = React.useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row: User) => `${row.last_name}, ${row.first_name}`,
        header: "Name",
        enableEditing: false,
        filterFn: searchFilter,
      },
      {
        accessorKey: "group.display_name",
        header: "Group",
        enableEditing: true,
        Edit: ({ cell }) => (
          <>
            <Select
              menuPosition="fixed"
              getOptionValue={(opt) => opt.id}
              getOptionLabel={(opt) => opt.display_name}
              options={groups.filter((p) => currentUserGroup.level >= p.level)}
              required={true}
              // menuPortalTarget={document.body}
              onChange={(newVal) => setSelectedGroup(newVal)}
              defaultValue={groups.find(
                (p) => p.id === cell.row.original.group?.id
              )}
              value={selectedGroup}
            />
            {!isValidGroup && (
              <FormHelperText
                error={true}
                className="MuiFormHelperText-sizeSmall"
                style={{ marginInline: "14px" }}
              >
                Please select the group
              </FormHelperText>
            )}
          </>
        ),
      },
    ],
    [groups, isValidGroup]
  );

  const handleCancelRowEdits = () => {
    setSelectedGroup(null);
  };

  const handleSaveRowEdits: MaterialReactTableProps<User>["onEditingRowSave"] =
    async ({ exitEditingMode, row, values }) => {
      const group = selectedGroup ? selectedGroup : row.original.group;
      setSelectedGroup(group);
      setIsValidGroup(!!group);
      if (!!group) {
        const updateGroup: UserGroupUpdate = {
          existing_group_id: row.original.group?.id,
          group_id_to_update: group.id,
        };
        setResultStatus(RESULT_STATUS.LOADING);
        try {
          await UserService.updateUserGroup(row.original.id, updateGroup);
          setUpdatedOn(new Date().getMilliseconds());
          setResultStatus(RESULT_STATUS.LOADED);
        } catch (e) {
          setResultStatus(RESULT_STATUS.ERROR);
        }
        setSelectedGroup(null);
        exitEditingMode(); //required to exit editing mode and close modal
      }
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
            data={users}
            editDisplayMode="modal"
            enableColumnOrdering
            enableEditing
            initialState={{
              sorting: [
                {
                  id: "group.level",
                  desc: false,
                },
              ],
            }}
            state={{
              isLoading: resultStatus === RESULT_STATUS.LOADING,
              showGlobalFilter: true,
            }}
            onEditingRowSave={handleSaveRowEdits}
            onEditingRowCancel={handleCancelRowEdits}
            renderRowActions={({ row, table }) => {
              const level = row.original.group?.level || 0;
              return (
                <>
                  {currentUserGroup && currentUserGroup.level >= level && (
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                      <Tooltip arrow placement="left" title="Edit">
                        <IconButton onClick={() => table.setEditingRow(row)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </>
              );
            }}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
};

export default UserList;
