import { useEffect, useState } from "react";
import { Box, Grid, TextField } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ETFormLabel } from "../shared/index";
import { Staff } from "../../models/staff";
import staffService from "../../services/staffService/staffService";
import proponentService from "services/proponentService/proponentService";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import ControlledSwitch from "../shared/controlledInputComponents/ControlledSwitch";
import { defaultProponent, Proponent } from "models/proponent";
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

type ProponentFormProps = {
  proponent: Proponent | null;
  saveProponent: (data: any) => void;
  setDisableDialogSave: (disabled: boolean) => void;
};

export default function ProponentForm({
  proponent,
  saveProponent,
  setDisableDialogSave,
}: ProponentFormProps) {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isNameFieldLocked, setIsNameFieldLocked] = useState(false);

  const methods = useForm<Proponent>({
    resolver: yupResolver(schema),
    defaultValues: proponent || defaultProponent,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset(proponent ?? defaultProponent);
  }, [proponent, reset]);

  const getStaffs = async () => {
    const staffsResult = await staffService.getAll();
    if (staffsResult.status === 200) {
      setStaffs(sort(staffsResult.data as never, "full_name"));
    }
  };

  useEffect(() => {
    getStaffs();
  }, []);

  useEffect(() => {
    setDisableDialogSave(isNameFieldLocked);
  }, [isNameFieldLocked, setDisableDialogSave]);

  return (
    <FormProvider {...methods}>
      <Grid
        component="form"
        id="proponent-form"
        container
        spacing={2}
        onSubmit={handleSubmit(saveProponent)}
      >
        <ProponentNameSpecialField
          id={proponent?.id}
          onLockClick={() => setIsNameFieldLocked((prev) => !prev)}
          open={isNameFieldLocked}
          onSave={() => {}}
          title={proponent?.name || ""}
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
              defaultValue={proponent?.relationship_holder_id}
              options={staffs || []}
              getOptionValue={(o: Staff) => o?.id.toString()}
              getOptionLabel={(o: Staff) => o.full_name}
              {...register("relationship_holder_id")}
            />
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
  );
}
