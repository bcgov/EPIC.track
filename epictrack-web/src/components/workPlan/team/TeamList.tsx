import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { MRT_ColumnDef } from "material-react-table";
import { StaffWorkRole } from "../../../models/staff";
import { WorkplanContext } from "../WorkPlanContext";
import { ETGridTitle } from "../../shared";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { showNotification } from "../../shared/notificationProvider";
import { ETChip } from "../../shared/chip/ETChip";
import TrackDialog from "../../shared/TrackDialog";
import NoDataEver from "../../shared/NoDataEver";
import {
  ACTIVE_STATUS,
  COMMON_ERROR_MESSAGE,
  ROLES,
} from "../../../constants/application-constant";
import { workService } from "../../../services/workService/workService";
import TeamForm from "./TeamForm";
import { useAppSelector } from "hooks";
import { Restricted, hasPermission } from "components/shared/restricted";
import { unEditableTeamMembers } from "./constants";
import { getStatusFilter } from "components/shared/filterSelect/utils";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";

const TeamList = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [workStaffId, setWorkStaffId] = useState<number | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [showTeamForm, setShowTeamForm] = useState<boolean>(false);
  const ctx = useContext(WorkplanContext);
  const staff = ctx.selectedStaff?.staff;
  const { roles: givenUserAuthRoles } = useAppSelector(
    (state) => state.user.userDetail,
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);

  const teamMembers = useMemo(() => ctx.team, [ctx.team]);

  const userIsActiveTeamMember = ctx.isActiveTeamMember;

  const canEdit =
    userIsActiveTeamMember ||
    hasPermission({ roles: givenUserAuthRoles, allowed: [ROLES.EDIT] });

  const canCreate = hasPermission({
    roles: givenUserAuthRoles,
    allowed: [ROLES.CREATE],
  });

  useEffect(() => {
    setLoading(ctx.loading);
  }, [ctx.loading]);

  useEffect(() => {
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

  const columns = useMemo<MRT_ColumnDef<StaffWorkRole>[]>(
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
        filterFn: "multiSelectFilter",
        filterSelectOptions: roles,
        filterVariant: "multi-select",
        header: "Role",
        size: 150,
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
        Filter: getStatusFilter<StaffWorkRole>,
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
    [canEdit, roles, statuses],
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
        Number(ctx.work?.id),
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
                columnFilters: columnFilters,
              }}
              onColumnFiltersChange={setColumnFilters}
              enableExport
              renderTopToolbarCustomActions={({ table }) => (
                <Grid container rowSpacing={1}>
                  <Grid item xs={6}>
                    <Restricted
                      allowed={[ROLES.CREATE]}
                      exception={userIsActiveTeamMember}
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
