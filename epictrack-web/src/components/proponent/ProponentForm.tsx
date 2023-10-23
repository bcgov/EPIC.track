import React from "react";
import { TextField, Grid, Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import { Staff } from "../../models/staff";
import { Proponent } from "../../models/proponent";
import staffService from "../../services/staffService/staffService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import { MasterContext } from "../shared/MasterContext";
import proponentService from "../../services/proponentService/proponentService";
import ControlledSwitch from "../shared/controlledInputComponents/ControlledSwitch";
import LockClosed from "../../assets/images/lock-closed.svg";

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .test({
      name: "checkDuplicateProponent",
      exclusive: true,
      message:
        "Proponent/Certificate holder with the given name already exists",
      test: async (value, { parent }) => {
        if (value) {
          const validateProponentResult =
            await proponentService.checkProponentExists(value, parent["id"]);
          return !(validateProponentResult.data as any)["exists"] as boolean;
        }
        return true;
      },
    }),
});

export default function ProponentForm({ ...props }) {
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const [disabled, setDisabled] = React.useState<boolean>();
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setFormId("proponent-form");
    reset({ is_active: true });
  }, []);
  React.useEffect(() => {
    const name = (ctx?.item as Proponent)?.name;
    setDisabled(props.proponentId ? true : false);
    ctx.setTitle(name || "Create Proponent");
  }, [ctx.title, ctx.item]);

  React.useEffect(() => {
    ctx.setId(props.proponentId);
  }, [ctx.id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: ctx.item as Proponent,
    mode: "onBlur",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  React.useEffect(() => {
    reset(ctx.item);
  }, [ctx.item]);

  const getStaffs = async () => {
    const staffsResult = await staffService.getAll();
    if (staffsResult.status === 200) {
      setStaffs(staffsResult.data as never);
    }
  };
  React.useEffect(() => {
    getStaffs();
  }, []);
  const onSubmitHandler = async (data: any) => {
    ctx.onSave(data, () => {
      reset();
    });
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          component={"form"}
          id="proponent-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "3px",
              }}
            >
              <ETFormLabel required>Name</ETFormLabel>
              <ETFormLabel>
                <Box
                  sx={{
                    opacity: disabled ? "100" : "0",
                    cursor: "pointer",
                  }}
                  component="img"
                  src={LockClosed}
                  alt="Lock"
                />
              </ETFormLabel>
            </Box>
            <Box sx={{ paddingTop: "4px" }}>
              <TextField
                variant="outlined"
                disabled={disabled}
                placeholder="Proponent Name"
                fullWidth
                error={!!errors?.name?.message}
                helperText={errors?.name?.message?.toString()}
                {...register("name")}
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <ETFormLabel>Relationship Holder</ETFormLabel>
            <Box sx={{ paddingTop: "4px" }}>
              <ControlledSelectV2
                placeholder="Select"
                defaultValue={(ctx.item as Proponent)?.relationship_holder_id}
                options={staffs || []}
                getOptionValue={(o: Staff) => o?.id.toString()}
                getOptionLabel={(o: Staff) => o.full_name}
                {...register("relationship_holder_id")}
              ></ControlledSelectV2>
            </Box>
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
            <ControlledSwitch
              sx={{ paddingLeft: "0px", marginRight: "10px" }}
              defaultChecked={(ctx.item as Proponent)?.is_active}
              {...register("is_active")}
            />
            <ETFormLabel id="active">Active</ETFormLabel>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
