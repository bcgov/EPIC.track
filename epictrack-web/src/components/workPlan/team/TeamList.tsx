import { Button, Grid } from "@mui/material";
import React from "react";
import { Staff, StaffWorkRole } from "../../../models/staff";
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
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import TrackDialog from "../../shared/TrackDialog";
import TeamForm from "./TeamForm";

const TeamList = () => {
  const [teamMembers, setTeamMembers] = React.useState<StaffWorkRole[]>([]);
  const [roles, setRoles] = React.useState<string[]>([]);
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [workStaffId, setWorkStaffId] = React.useState<number | undefined>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showTeamForm, setShowTeamForm] = React.useState<boolean>(false);
  const ctx = React.useContext(WorkplanContext);

  React.useEffect(() => {
    getWorkTeamMembers();
  }, []);

  React.useEffect(() => {
    if (teamMembers) {
      const roles = teamMembers
        .map((p) => p.role?.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
      setRoles(roles);

      const statuses = teamMembers
        .map((p) => p.status)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
      setStatuses(statuses);
    }
  }, [teamMembers]);

  const columns = React.useMemo<MRT_ColumnDef<StaffWorkRole>[]>(
    () => [
      {
        accessorKey: "staff.full_name",
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
        accessorFn: (row: StaffWorkRole) => row.role?.name,
        header: "Role",
        size: 150,
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <FilterSelect
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterSelectOptions: roles,
        filterFn: "multiSelectFilter",
      },
      {
        accessorKey: "staff.email",
        header: "Email",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
      },
      {
        accessorKey: "staff.phone",
        header: "Phone",
        size: 150,
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
      },
      {
        accessorKey: "status",
        header: "Active",
        size: 100,
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <FilterSelect
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
    [teamMembers]
  );

  const onCancelHandler = () => {
    setShowTeamForm(false);
    setWorkStaffId(undefined);
  };

  const onRowClick = (event: any, row: StaffWorkRole) => {
    event.preventDefault();
    setWorkStaffId(row.id);
    setShowTeamForm(true);
  };

  const onSave = () => {
    setShowTeamForm(false);
    setWorkStaffId(undefined);
    getWorkTeamMembers();
  };

  const getWorkTeamMembers = async () => {
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
        setTeamMembers(team);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
    setLoading(false);
  };
  return (
    <Grid container rowSpacing={1}>
      <Grid item xs={12}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowTeamForm(true)}
        >
          Team Member
        </Button>
      </Grid>
      <Grid item xs={12}>
        <MasterTrackTable
          columns={columns}
          data={teamMembers}
          enableTopToolbar={false}
          state={{
            isLoading: loading,
            showGlobalFilter: true,
          }}
        />
      </Grid>
      <TrackDialog
        open={showTeamForm}
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
    </Grid>
  );
};

export default TeamList;
