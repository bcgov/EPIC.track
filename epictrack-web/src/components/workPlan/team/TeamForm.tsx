import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormControlLabel, Grid, TextField } from "@mui/material";
import { ETFormLabel } from "../../shared";
import ControlledSelectV2 from "../../shared/controlledInputComponents/ControlledSelectV2";
import { Staff, StaffWorkRole } from "../../../models/staff";
import { ListType } from "../../../models/code";
import { showNotification } from "../../shared/notificationProvider";
import staffService from "../../../services/staffService/staffService";
import { sort } from "../../../utils";
import workService from "../../../services/workService/workService";
import ControlledSwitch from "../../shared/controlledInputComponents/ControlledSwitch";
import { WorkplanContext } from "../WorkPlanContext";
import { getErrorMessage } from "../../../utils/axiosUtils";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import roleService from "services/roleService";
import { unEditableTeamMembers } from "./constants";

interface TeamFormProps {
  workStaffId?: number;
  onSave: () => void;
}

const schema = yup.object().shape({
  role_id: yup.string().required("Please select the role"),
  staff_id: yup
    .string()
    .required("Please select the staff")
    .test({
      name: "checkDuplicateStaffWorkAssociation",
      exclusive: true,
      message: "Selected Staff-Work Association already exists",
      test: async (value, { parent }) => {
        if (value && parent["role_id"]) {
          const validateWorkStaff = await workService.checkWorkStaffExists(
            parent["work_id"],
            Number(value),
            parent["role_id"],
            parent["id"]
          );
          return !(validateWorkStaff.data as any)["exists"] as boolean;
        }
        return true;
      },
    }),
});

const TeamForm = ({ onSave, workStaffId }: TeamFormProps) => {
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [roles, setRoles] = React.useState<ListType[]>([]);
  const emailRef = React.useRef(null);
  const phoneRef = React.useRef(null);
  const ctx = React.useContext(WorkplanContext);
  const staffWorkRole = ctx.selectedStaff;

  React.useEffect(() => {
    getAllStaff();
    getAllRoles();
  }, []);

  React.useEffect(() => {
    reset({
      ...staffWorkRole,
      work_id: ctx.work?.id,
      is_active: true,
    });
  }, [ctx.work?.id]);

  React.useEffect(() => {
    if (workStaffId) {
      getTeamMember();
    }
  }, [workStaffId]);

  React.useEffect(() => {
    if (staffWorkRole) {
      reset(staffWorkRole);
    }
  }, [staffWorkRole]);

  const getTeamMember = async () => {
    try {
      const result = await workService.getWorkTeamMember(Number(workStaffId));
      if (result.status === 200) {
        const staff = result.data as StaffWorkRole;
        ctx.setSelectedStaff(staff);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getAllStaff = async () => {
    try {
      const result = await staffService.getAll(true);
      if (result.status === 200) {
        const staff = result.data as Staff[];
        setStaff(sort(staff, "full_name"));
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getAllRoles = async () => {
    try {
      const result = await roleService.getAll();
      if (result.status === 200) {
        const roles = result.data as ListType[];
        const filteredRoles = roles.filter(
          (role) => !unEditableTeamMembers.includes(role.id)
        );
        setRoles(sort(filteredRoles, "name"));
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: staffWorkRole,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const saveTeamMember = (data: StaffWorkRole) => {
    if (workStaffId) {
      return workService.updateWorkStaff(data, Number(workStaffId));
    }
    return workService.createWorkStaff(data, Number(ctx.work?.id));
  };

  const onSubmitHandler = async (data: StaffWorkRole) => {
    try {
      await saveTeamMember(data);
      showNotification("Team details saved", {
        type: "success",
      });
      if (onSave) {
        onSave();
      }
    } catch (error: any) {
      const message = getErrorMessage(error);
      showNotification(message, {
        type: "error",
      });
    }
  };

  const onStaffChangeHandler = (staffId: number) => {
    const selectedStaff = staff.filter((p) => p.id === Number(staffId))[0];
    (emailRef?.current as any)["value"] = selectedStaff
      ? selectedStaff.email
      : "";
    (phoneRef?.current as any)["value"] = selectedStaff
      ? selectedStaff.phone
      : "";
  };
  return (
    <FormProvider {...methods}>
      <Grid
        component={"form"}
        id="team-form"
        spacing={2}
        container
        sx={{
          width: "100%",
        }}
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Grid item xs={12}>
          <ETFormLabel required>Name</ETFormLabel>
          <ControlledSelectV2
            placeholder="Search for a Name"
            helperText={errors?.staff_id?.message?.toString()}
            defaultValue={staffWorkRole?.staff_id}
            options={staff || []}
            disabled={!!workStaffId}
            getOptionValue={(o: Staff) => o?.id?.toString()}
            getOptionLabel={(o: Staff) => o?.full_name}
            {...register("staff_id")}
            onHandleChange={(staffId: number) => onStaffChangeHandler(staffId)}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Email</ETFormLabel>
          <TextField
            fullWidth
            disabled
            placeholder="Email"
            inputRef={emailRef}
            {...register("staff.email")}
            defaultValue={staffWorkRole?.staff?.email}
          />
        </Grid>
        <Grid item xs={6}>
          <ETFormLabel>Phone</ETFormLabel>
          <TextField
            fullWidth
            disabled
            placeholder="Phone"
            inputRef={phoneRef}
            {...register("staff.phone")}
            defaultValue={staffWorkRole?.staff?.phone}
          />
        </Grid>
        <Grid item xs={12}>
          <ETFormLabel required>Role</ETFormLabel>
          <ControlledSelectV2
            placeholder="Select a Role"
            helperText={errors?.role_id?.message?.toString()}
            defaultValue={staffWorkRole?.role_id}
            options={roles || []}
            getOptionValue={(o: ListType) => o?.id?.toString()}
            getOptionLabel={(o: ListType) => o.name}
            {...register("role_id")}
          ></ControlledSelectV2>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<ControlledSwitch name="is_active" />}
            label="Active"
          />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default TeamForm;
