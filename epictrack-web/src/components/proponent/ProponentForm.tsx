import React from "react";
import { TextField, Grid, Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import { Staff } from "../../models/staff";
import { Proponent, defaultProponent } from "../../models/proponent";
import staffService from "../../services/staffService/staffService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import { MasterContext } from "../shared/MasterContext";
import proponentService from "../../services/proponentService/proponentService";
import ControlledSwitch from "../shared/controlledInputComponents/ControlledSwitch";
import { ProponentNameSpecialField } from "./ProponentNameSpecialField";
import { sort } from "utils";

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
  const [isNameFieldLocked, setIsNameFieldLocked] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    ctx.setFormId("proponent-form");
  }, []);
  React.useEffect(() => {
    const name = (ctx?.item as Proponent)?.name;
    setDisabled(props.proponentId ? true : false);
    ctx.setTitle(name || "Create Proponent");
  }, [ctx.title, ctx.item]);

  React.useEffect(() => {
    ctx.setId(props.proponentId);
  }, [ctx.id]);

  const proponent = ctx?.item as Proponent;

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
    reset(ctx.item ?? defaultProponent);
  }, [ctx.item]);

  const getStaffs = async () => {
    const staffsResult = await staffService.getAll();
    if (staffsResult.status === 200) {
      const data = sort(staffsResult.data as never, "full_name");
      setStaffs(data);
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

  React.useEffect(() => {
    ctx.setDialogProps({
      saveButtonProps: {
        disabled: isNameFieldLocked,
      },
    });
  }, [isNameFieldLocked]);

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
          <ProponentNameSpecialField
            id={proponent?.id}
            onLockClick={() => setIsNameFieldLocked((prev) => !prev)}
            open={isNameFieldLocked}
            onSave={() => {
              ctx.getById(proponent?.id.toString());
            }}
            title={proponent?.name}
          >
            <TextField
              variant="outlined"
              disabled={proponent?.name !== undefined}
              placeholder="Proponent Name"
              fullWidth
              error={!!errors?.name?.message}
              helperText={errors?.name?.message?.toString()}
              {...register("name")}
            />
          </ProponentNameSpecialField>
          <Grid item xs={6}>
            <ETFormLabel>Relationship Holder</ETFormLabel>
            <Box>
              <ControlledSelectV2
                disabled={Boolean(isNameFieldLocked)}
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
              disabled={Boolean(isNameFieldLocked)}
              sx={{ paddingLeft: "0px", marginRight: "10px" }}
              name="is_active"
            />
            <ETFormLabel id="active">Active</ETFormLabel>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
