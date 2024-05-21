import React from "react";
import { Grid } from "@mui/material";
import { GanttItem } from "components/gantt/types";
import { ETCaption2 } from "components/shared";
import moment from "moment";
import { Palette } from "styles/theme";

export const FuturePhase = ({ task }: { task: GanttItem }) => {
  const taskSpan = moment(task.end).diff(moment(task.start), "days") + 1;
  return (
    <Grid container alignItems={"flex-start"} textAlign={"left"}>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: Palette.neutral.bg.light,
          borderBottom: `1px solid ${Palette.neutral.bg.dark}`,
          padding: "16px",
        }}
        justifyContent={"center"}
      >
        <ETCaption2 bold>{task.rowName}</ETCaption2>
      </Grid>
      <Grid
        item
        container
        alignItems="flex-start"
        justifyContent={"center"}
        spacing={2}
        sx={{
          padding: "16px",
        }}
      >
        <Grid item xs={12}>
          <ETCaption2
            sx={{
              flex: 1,
              width: "100%",
            }}
            bold
          >
            {task.name}
          </ETCaption2>
        </Grid>
        <Grid
          item
          xs={12}
          container
          alignItems="flex-start"
          spacing={1}
          sx={{ color: Palette.neutral.accent.light }}
        >
          <Grid item xs={12} container alignItems="flex-start">
            <Grid item xs={6}>
              <ETCaption2>Phase Start:</ETCaption2>
            </Grid>
            <Grid item xs={6}>
              <ETCaption2>{task.start.toDateString()}</ETCaption2>
            </Grid>
          </Grid>
          <Grid item xs={12} container alignItems="flex-start">
            <Grid item xs={6}>
              <ETCaption2>Phase End:</ETCaption2>
            </Grid>
            <Grid item xs={6}>
              <ETCaption2>{task.end.toDateString()}</ETCaption2>
            </Grid>
          </Grid>

          <Grid item xs={12} container alignItems="flex-start">
            <Grid item xs={6}>
              <ETCaption2>Days:</ETCaption2>
            </Grid>
            <Grid item xs={6}>
              <ETCaption2>{taskSpan}</ETCaption2>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
