import React, { useEffect } from "react";
import {
  MRT_Cell,
  MRT_ColumnDef,
  MaterialReactTableProps,
} from "material-react-table";
import { Group, User } from "../../models/user";
import { EpicTrackPageGridContainer } from "../shared";
import { Button, Grid } from "@mui/material";
import MasterTrackTable from "../shared/MasterTrackTable";
import { RESULT_STATUS } from "../../constants/application-constant";
import UserService from "../../services/userService";
import Select from "react-select";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";

const UserList = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [test, setTest] = React.useState<string>();
  const [selectedGroup, setSelectedGroup] = React.useState<
    Group | undefined | null
  >();
  const [resultStatus, setResultStatus] = React.useState<string>();

  const getUsers = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const userResult = await UserService.getUsers();
      if (userResult.status === 200) {
        setUsers(userResult.data as never);
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
    setTest("dinesh");
  }, []);

  useEffect(() => {
    getGroups();
  }, []);

  const callMe = () => {
    console.log("selelcted group", selectedGroup);
  };
  const columns = React.useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row: User) => `${row.last_name}, ${row.first_name}`,
        header: "Name",
        sortingFn: "sortFn",
        enableEditing: false,
      },
      {
        accessorKey: "email",
        header: "Email",
        enableEditing: false,
      },
      {
        accessorKey: "group.name",
        header: "Group",
        enableEditing: true,
        Edit: ({ cell, column, table }) => (
          <Select
            getOptionValue={(opt) => opt.id}
            getOptionLabel={(opt) => opt.name}
            options={groups}
            required={true}
            // menuPortalTarget={document.body}
            onChange={(newVal) => setSelectedGroup(newVal)}
            // defaultValue={cell.row.original.group?.id}
            value={selectedGroup}
            // styles={{
            //   menuPortal: (base: any) => ({
            //     ...base,
            //     zIndex: 99999,
            //   }),
            // }}
          />
        ),
      },
    ],
    [groups, selectedGroup]
  );

  const handleSaveRow: MaterialReactTableProps<User>["onEditingRowSave"] =
    React.useCallback(
      ({ exitEditingMode, row, values }: any) => {
        // //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here.
        // tableData[row.index] = values;
        // //send/receive api updates here
        // setTableData([...tableData]);
        console.log(groups);
        console.log(row.original.group);
        console.log(selectedGroup);
        // exitEditingMode();
      },
      [selectedGroup]
    );
  return (
    <>
      <EpicTrackPageGridContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
          <MasterTrackTable
            columns={columns}
            data={users}
            initialState={{
              sorting: [
                {
                  id: "name",
                  desc: false,
                },
              ],
            }}
            state={{
              isLoading: resultStatus === RESULT_STATUS.LOADING,
              showGlobalFilter: true,
            }}
            enableEditing
            editingMode="modal"
            onEditingRowSave={async (params: any) => {
              // //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here.
              // tableData[row.index] = values;
              // //send/receive api updates here
              // setTableData([...tableData]);
              console.log(groups);
              console.log(params.row.original.group);
              console.log(selectedGroup);
              setTest("Harish");
            }}
          />
        </Grid>
      </EpicTrackPageGridContainer>
    </>
  );
};

export default UserList;
// import React, { useMemo, useState, useEffect } from "react";
// import MaterialReactTable, {
//   type MaterialReactTableProps,
//   type MRT_ColumnDef,
// } from "material-react-table";
// import MasterTrackTable from "../shared/MasterTrackTable";

// type Person = {
//   firstName: string;
//   lastName: string;
//   address: string;
//   city: string;
//   state: string;
// };

// const UserList = () => {
//   const columns = useMemo<MRT_ColumnDef<Person>[]>(
//     () => [
//       //column definitions...
//       {
//         accessorKey: "firstName",
//         header: "First Name",
//       },
//       {
//         accessorKey: "lastName",
//         header: "Last Name",
//       },

//       {
//         accessorKey: "address",
//         header: "Address",
//       },
//       {
//         accessorKey: "city",
//         header: "City",
//       },

//       {
//         accessorKey: "state",
//         header: "State",
//       }, //end
//     ],
//     []
//   );

//   const [tableData, setTableData] = useState<Person[]>([]);
//   useEffect(() => {
//     setTableData([
//       {
//         firstName: "Dylan",
//         lastName: "Murray",
//         address: "261 Erdman Ford",
//         city: "East Daphne",
//         state: "Kentucky",
//       },
//       {
//         firstName: "Raquel",
//         lastName: "Kohler",
//         address: "769 Dominic Grove",
//         city: "Columbus",
//         state: "Ohio",
//       },
//     ]);
//   }, []);

//   const handleSaveRow: MaterialReactTableProps<Person>["onEditingRowSave"] =
//     async ({ exitEditingMode, row, values }) => {
//       //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here.
//       console.log("Table data ", tableData);
//       tableData[row.index] = values;
//       //send/receive api updates here
//       setTableData([...tableData]);
//       exitEditingMode(); //required to exit editing mode
//     };

//   return (
//     <MasterTrackTable
//       columns={columns}
//       data={tableData}
//       editingMode="modal" //default
//       enableEditing
//       onEditingRowSave={handleSaveRow}
//     />
//   );
// };
// export default UserList;
