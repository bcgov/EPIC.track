import React from "react";
import { TextField, Grid, FormHelperText } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TrackLabel } from "../shared/index";
import codeService from "../../services/codeService";
import ControlledCheckbox from "../shared/controlledInputComponents/ControlledCheckbox";
import { Staff } from "../../models/staff";
import { ListType } from "../../models/code";
import ControlledSelectV2 from "../shared/controlledInputComponents/ControlledSelectV2";
import { MasterContext } from "../shared/MasterContext";
import staffService from "../../services/staffService/staffService";

const schema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required("Email is required")
    .test({
      name: "checkDuplicateEmail",
      exclusive: true,
      message: "Staff with same email already exists",
      test: async (value, { parent }) => {
        if (value) {
          const result = await staffService.validateEmail(value, parent["id"]);
          return !(result.data as never)["exists"];
        }
        return true;
      },
    }),
  phone: yup
    .string()
    .matches(
      /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/,
      "Invalid phone number"
    )
    .required("Phone number is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  position_id: yup.string().required("Select position"),
});

export default function StaffForm({ ...props }) {
  const [positions, setPositions] = React.useState<ListType[]>([]);
  const ctx = React.useContext(MasterContext);
  React.useEffect(() => {
    ctx.setTitle("Staff");
  }, [ctx.title]);

  React.useEffect(() => {
    ctx.setFormId("staff-form");
  }, []);

  React.useEffect(() => {
    ctx.setId(props.staffId);
  }, [ctx.id]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: ctx.item as Staff,
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

  const getPositions = async () => {
    const positionResult = await codeService.getCodes("positions");
    if (positionResult.status === 200) {
      setPositions((positionResult.data as never)["codes"]);
    }
  };
  React.useEffect(() => {
    getPositions();
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
          id="staff-form"
          container
          spacing={2}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          {ctx.error && (
            <Grid item xs={12}>
              <FormHelperText
                error={true}
                className="MuiFormHelperText-sizeSmall"
              >
                {ctx.error}
              </FormHelperText>
            </Grid>
          )}
          <Grid item xs={6}>
            <TrackLabel>First Name</TrackLabel>
            <TextField
              fullWidth
              error={!!errors?.first_name?.message}
              helperText={errors?.first_name?.message?.toString()}
              {...register("first_name")}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Last Name</TrackLabel>
            <TextField
              fullWidth
              {...register("last_name")}
              error={!!errors?.last_name?.message}
              helperText={errors?.last_name?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Email</TrackLabel>
            <TextField
              fullWidth
              {...register("email")}
              error={!!errors?.email?.message}
              helperText={errors?.email?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Phone</TrackLabel>
            <TextField
              fullWidth
              {...register("phone")}
              error={!!errors?.phone?.message}
              helperText={errors?.phone?.message?.toString()}
            />
          </Grid>
          <Grid item xs={6}>
            <TrackLabel>Position</TrackLabel>
            <ControlledSelectV2
              helperText={errors?.position_id?.message?.toString()}
              getOptionValue={(o: ListType) => o.id.toString()}
              getOptionLabel={(o: ListType) => o.name}
              defaultValue={(ctx.item as Staff)?.position_id}
              options={positions}
              {...register("position_id")}
            />
          </Grid>
          <Grid item xs={6} sx={{ paddingTop: "30px !important" }}>
            <ControlledCheckbox
              defaultChecked={(ctx.item as Staff)?.is_active}
              {...register("is_active")}
            />
            <TrackLabel id="active">Active</TrackLabel>
          </Grid>

          {/* TODO: Keeping for reference. Delete after new modal is merged and working in test. */}
          {/* <Grid
            item
            xs={12}
            sx={{ display: "flex", gap: "0.5rem", justifyContent: "right" }}
          >
            <Button
              variant="outlined"
              type="reset"
              onClick={(event) => {
                ctx.onDialogClose(event, "");
              }}
            >
              Cancel
            </Button>
            <Button variant="outlined" type="submit">
              Submit
            </Button>
          </Grid> */}
        </Grid>
      </FormProvider>
    </>
  );
}
