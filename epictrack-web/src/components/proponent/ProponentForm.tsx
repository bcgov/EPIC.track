import React from "react";
import { TextField, Grid, Box, IconButton } from "@mui/material";
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
import { When, If, Then, Else } from "react-if";
import {
  SpecialFieldEntityEnum,
  SPECIAL_FIELDS,
} from "../../constants/application-constant";
import Icons from "../icons";
import { IconProps } from "../icons/type";
import { Palette } from "../../styles/theme";
import { SpecialFieldGrid } from "../shared/specialField";

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

const LockClosedIcon: React.FC<IconProps> = Icons["LockClosedIcon"];
const LockOpenIcon: React.FC<IconProps> = Icons["LockOpenIcon"];

export default function ProponentForm({ ...props }) {
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  const [disabled, setDisabled] = React.useState<boolean>();
  const ctx = React.useContext(MasterContext);
  const [specialField, setSpecialField] = React.useState<string>("");

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
              <When condition={disabled}>
                <If condition={specialField === SPECIAL_FIELDS.PROPONENT.NAME}>
                  <Then>
                    <IconButton onClick={() => setSpecialField("")}>
                      <LockOpenIcon fill={Palette.primary.accent.main} />
                    </IconButton>
                  </Then>
                  <Else>
                    <IconButton
                      onClick={() =>
                        setSpecialField(SPECIAL_FIELDS.PROPONENT.NAME)
                      }
                    >
                      <LockClosedIcon fill={Palette.primary.accent.main} />
                    </IconButton>
                  </Else>
                </If>
              </When>
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
            <Box sx={{ paddingTop: Boolean(specialField) ? "15px" : "11px" }}>
              <ControlledSelectV2
                disabled={Boolean(specialField)}
                placeholder="Select"
                defaultValue={(ctx.item as Proponent)?.relationship_holder_id}
                options={staffs || []}
                getOptionValue={(o: Staff) => o?.id.toString()}
                getOptionLabel={(o: Staff) => o.full_name}
                {...register("relationship_holder_id")}
              ></ControlledSelectV2>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <When condition={Boolean(specialField)}>
              <SpecialFieldGrid
                entity={SpecialFieldEntityEnum.PROPONENT}
                entity_id={(ctx.item as Proponent)?.id}
                fieldName={specialField}
                fieldLabel={
                  specialField === SPECIAL_FIELDS.PROPONENT.NAME
                    ? "Proponent Name"
                    : "Name"
                }
                fieldType={"text"}
                title={
                  specialField === SPECIAL_FIELDS.PROPONENT.NAME
                    ? "Proponet History"
                    : (ctx.item as Proponent)?.name
                }
                description={
                  <>
                    <When
                      condition={
                        specialField === SPECIAL_FIELDS.PROJECT.PROPONENT
                      }
                    >
                      Update the Proponent of this Project.{" "}
                      <a href="#">Click this link</a> for detailed instructions.
                    </When>
                    <When
                      condition={specialField === SPECIAL_FIELDS.PROJECT.NAME}
                    >
                      Update the legal name of the Project and the dates each
                      name was in legal use. <a href="#">Click this link</a> for
                      detailed instructions
                    </When>
                  </>
                }
                onSave={() => {
                  // TODO: Refresh form field value for the specific field?
                  // OR do we just call form save/submit handler
                  ctx.setId(props.proponentId);
                  ctx.getById(props.proponentId);
                }}
              />
            </When>
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
            <ControlledSwitch
              disabled={Boolean(specialField)}
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
