import { useContext, useMemo } from "react";
import { Button, Grid } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { ETGridTitle, ETHeading4 } from "components/shared";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { Ministry } from "models/ministry";
import { SpecialHistoryContext } from "./SpecialHistorySettingsContext";

const AddIcon: React.FC<IconProps> = Icons["AddIcon"];

const SpecialHistorySettings = () => {
  const { setCreateMinistryDialogOpen, ministries, setMinistry } = useContext(
    SpecialHistoryContext,
  );

  const columns = useMemo<MRT_ColumnDef<Ministry>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 300,
        sortingFn: "sortFn",
        filterFn: searchFilter,
        Cell: ({ row }) => {
          const name = row.original.name;
          return (
            <ETGridTitle
              to="#"
              onClick={() => {
                setMinistry(row.original);
                setCreateMinistryDialogOpen(true);
              }}
              enableTooltip
              tooltip={name}
            >
              {name}
            </ETGridTitle>
          );
        },
      },
      {
        accessorFn: (row) => row?.minister?.full_name || "",
        header: "Minister",
        size: 300,
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "date_created",
        enableColumnFilter: false,
        header: "Date Created",
        size: 300,
        sortingFn: "sortFn",
        Cell: ({ row }) => {
          const date_created = row.original.date_created;
          if (!date_created) {
            return "";
          }

          const date = new Date(date_created);
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${month}-${day}-${year}`;
        },
      },
      {
        accessorKey: "date_closed",
        enableColumnFilter: false,
        header: "Date Closed",
        size: 300,
        sortingFn: "sortFn",
        Cell: ({ row }) => {
          const date_closed = row.original.date_closed;
          if (!date_closed) {
            return "";
          }
          const date = new Date(date_closed);
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${month}-${day}-${year}`;
        },
      },
    ],
    [setCreateMinistryDialogOpen, setMinistry],
  );

  return (
    <Grid container>
      <Grid item xs={12} sx={{ pt: "32px" }}>
        <ETHeading4 bold>Special History Settings</ETHeading4>
      </Grid>
      <Grid item xs={12} sx={{ pt: "16px" }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setCreateMinistryDialogOpen(true);
          }}
          variant="contained"
        >
          Create New Ministry
        </Button>
      </Grid>
      <Grid item xs={12}>
        <MasterTrackTable
          data={ministries}
          columns={columns}
          initialState={{
            sorting: [
              {
                id: "date_created",
                desc: true,
              },
            ],
          }}
        />
      </Grid>
    </Grid>
  );
};

export default SpecialHistorySettings;
