import { Button, Grid, Tooltip } from "@mui/material";
import React, { useMemo } from "react";
import { StaffWorkRole } from "../../../models/staff";
import workService from "../../../services/workService/workService";
import { WorkplanContext } from "../WorkPlanContext";
import { MRT_ColumnDef } from "material-react-table";
import { ETGridTitle, IButton } from "../../shared";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { showNotification } from "../../shared/notificationProvider";
import {
  ACTIVE_STATUS,
  COMMON_ERROR_MESSAGE,
  ROLES,
} from "../../../constants/application-constant";
import AddIcon from "@mui/icons-material/Add";
import { ETChip } from "../../shared/chip/ETChip";
import TrackDialog from "../../shared/TrackDialog";
import TeamForm from "./TeamForm";
import NoDataEver from "../../shared/NoDataEver";
import TableFilter from "../../shared/filterSelect/TableFilter";
import { useAppSelector } from "hooks";
import { Restricted, hasPermission } from "components/shared/restricted";
import { WorkStaffRole } from "models/role";
import { unEditableTeamMembers } from "./constants";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import Icons from "../../icons";
import { IconProps } from "components/icons/type";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const TeamList = () => {
  const [roles, setRoles] = React.useState<string[]>([]);
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [workStaffId, setWorkStaffId] = React.useState<number | undefined>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showTeamForm, setShowTeamForm] = React.useState<boolean>(false);
  const ctx = React.useContext(WorkplanContext);
  const staff = ctx.selectedStaff?.staff;
  const { email, roles: givenUserAuthRoles } = useAppSelector(
    (state) => state.user.userDetail
  );

  const teamMembers = useMemo(() => ctx.team, [ctx.team]);

  const userIsTeamMember = useMemo(
    () => teamMembers.some((member) => member.staff.email === email),
    [teamMembers, email]
  );
  const canEdit =
    userIsTeamMember ||
    hasPermission({ roles: givenUserAuthRoles, allowed: [ROLES.EDIT] });

  const canCreate = hasPermission({
    roles: givenUserAuthRoles,
    allowed: [ROLES.CREATE],
  });

  React.useEffect(() => {
    setLoading(ctx.loading);
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
            disabled={
              unEditableTeamMembers.includes(row.original.role.id) || !canEdit
            }
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
            <TableFilter
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
              <ETChip active label="Active" />
            )}
            {cell.getValue<string>() === ACTIVE_STATUS.INACTIVE && (
              <ETChip inactive label="Inactive" />
            )}
          </span>
        ),
      },
    ],
    [teamMembers, roles, statuses]
  );

  const onCancelHandler = () => {
    setShowTeamForm(false);
    ctx.setSelectedStaff(undefined);
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

  const onAddButtonClickHandler = () => {
    setShowTeamForm(true);
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
  return (
    <>
      {teamMembers.length > 0 && (
        <Grid container rowSpacing={1}>
          <Grid item xs={12}>
            <MasterTrackTable
              columns={columns}
              data={teamMembers}
              enableTopToolbar={true}
              state={{
                isLoading: loading,
                showGlobalFilter: true,
              }}
              tableName="team-listing"
              enableExport
              renderTopToolbarCustomActions={({ table }) => (
                <Grid container rowSpacing={1}>
                  <Grid item xs={6}>
                    <Restricted
                      allowed={[ROLES.CREATE]}
                      exception={userIsTeamMember}
                      errorProps={{
                        disabled: true,
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowTeamForm(true)}
                      >
                        Team Member
                      </Button>
                    </Restricted>
                  </Grid>
                </Grid>
              )}
            />
          </Grid>
        </Grid>
      )}
      {teamMembers.length === 0 && (
        <NoDataEver
          title="You don't have any Team Members yet"
          subTitle="Start adding your Team"
          addNewButtonText="Team Member"
          onAddNewClickHandler={() => onAddButtonClickHandler()}
          addButtonProps={{
            disabled: !canCreate,
          }}
        />
      )}
      <TrackDialog
        open={showTeamForm}
        dialogTitle={staff ? `${staff.full_name}` : "Add Team Member"}
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText={workStaffId ? "Save" : "Add"}
        formId="team-form"
        onCancel={() => onCancelHandler()}
        isActionsRequired
      >
        <TeamForm onSave={onSave} workStaffId={workStaffId} />
      </TrackDialog>
    </>
  );
};

export default TeamList;
