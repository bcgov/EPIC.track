import { Button, Grid } from "@mui/material";
import React from "react";
import { StaffWorkRole } from "../../../models/staff";
import workService from "../../../services/workService/workService";
import { WorkplanContext } from "../WorkPlanContext";
import { MRT_ColumnDef } from "material-react-table";
import { ETGridTitle } from "../../shared";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { showNotification } from "../../shared/notificationProvider";
import {
  ACTIVE_STATUS,
  COMMON_ERROR_MESSAGE,
} from "../../../constants/application-constant";
import AddIcon from "@mui/icons-material/Add";
import { ActiveChip, InactiveChip } from "../../shared/chip/ETChip";
import TrackDialog from "../../shared/TrackDialog";
import TeamForm from "../team/TeamForm";
import NoDataEver from "../../shared/NoDataEver";
import TableFilter from "../../shared/filterSelect/TableFilter";
import { FirstNation } from "../../../models/firstNation";

const FirstNationList = () => {
  const [roles, setRoles] = React.useState<string[]>([]);
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [workStaffId, setWorkStaffId] = React.useState<number | undefined>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showNationForm, setShowNationForm] = React.useState<boolean>(false);
  const ctx = React.useContext(WorkplanContext);
  const firstNations = React.useMemo(
    () => ctx.firstNations.map((firstNation) => firstNation.indigenous_nation),
    [ctx.firstNations]
  );

  React.useEffect(() => {
    setLoading(ctx.loading);
  }, []);

  const columns = React.useMemo<MRT_ColumnDef<FirstNation>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        size: 250,
        Cell: ({ cell, row }) => (
          <ETGridTitle
            to="#"
            enableEllipsis
            onClick={(event: any) => onRowClick(event, row.original)}
            enableTooltip={true}
            tooltip={cell.getValue<string>()}
          >
            {cell.getValue<string>()}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
      },
      {
        accessorFn: (row: FirstNation) => row.name,
        header: "Role",
        size: 150,
        filterVariant: "multi-select",
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
        filterFn: "multiSelectFilter",
        filterSelectOptions: roles,
      },
      {
        accessorKey: "name",
        header: "Email",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
      },
      {
        accessorKey: "name",
        header: "Phone",
        size: 150,
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
      },
      {
        accessorKey: "is_active",
        header: "Active",
        size: 100,
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="statusFilter"
            />
          );
        },
        filterSelectOptions: statuses,
        filterFn: "multiSelectFilter",
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<string>() === ACTIVE_STATUS.ACTIVE && (
              <ActiveChip label="Active" color="primary" />
            )}
            {cell.getValue<string>() === ACTIVE_STATUS.INACTIVE && (
              <InactiveChip label="Inactive" color="error" />
            )}
          </span>
        ),
      },
    ],
    [firstNations, roles, statuses]
  );

  const onCancelHandler = () => {
    setShowNationForm(false);
    setWorkStaffId(undefined);
  };

  const onRowClick = (event: any, row: FirstNation) => {
    event.preventDefault();
    setWorkStaffId(row.id);
    setShowNationForm(true);
  };

  const onSave = () => {
    setShowNationForm(false);
    setWorkStaffId(undefined);
    getWorkTeamMembers();
  };

  const onAddButtonClickHandler = () => {
    setShowNationForm(true);
  };

  const getWorkTeamMembers = async () => {
    setLoading(true);
    try {
      const teamResult = await workService.getWorkTeamMembers(
        Number(ctx.work?.id)
      );
      if (teamResult.status === 200) {
        const team = (teamResult.data as StaffWorkRole[]).map((p) => {
          return {
            ...p,
            status: p.is_active ? ACTIVE_STATUS.ACTIVE : ACTIVE_STATUS.INACTIVE,
          };
        });
        ctx.setTeam(team);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
    setLoading(false);
  };
  console.log(firstNations);
  return (
    <>
      {firstNations.length > 0 && (
        <Grid container rowSpacing={1}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowNationForm(true)}
            >
              Team Member
            </Button>
          </Grid>
          <Grid item xs={12}>
            <MasterTrackTable
              columns={columns}
              data={firstNations}
              enableTopToolbar={false}
              state={{
                isLoading: loading,
                showGlobalFilter: true,
              }}
            />
          </Grid>
        </Grid>
      )}
      {/* TODO: ADD FUNCTIONALITY TO ADD & IMPORT BUTTONS */}
      {firstNations.length === 0 && (
        <NoDataEver
          title="You don't have any First Nations yet"
          subTitle="Add Nations or Import them from existing Works"
          addNewButtonText="Add Nation"
          isImportRequired
          onAddNewClickHandler={() => onAddButtonClickHandler()}
          importButtonText="Import Nations"
        />
      )}
      <TrackDialog
        open={showNationForm}
        dialogTitle="Add Team Member"
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText="Add"
        formId="team-form"
        onCancel={() => onCancelHandler()}
        isActionsRequired
      >
        <TeamForm onSave={onSave} workStaffId={workStaffId} />
      </TrackDialog>
    </>
  );
};

export default FirstNationList;
