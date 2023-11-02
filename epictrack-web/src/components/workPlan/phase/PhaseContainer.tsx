import { useContext, useEffect, useState } from "react";
import PhaseAccordion from "./PhaseAccordion";
import { Box, FormControlLabel, Grid } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";
import { ETCaption1, ETHeading4 } from "../../shared";
import { CustomSwitch } from "../../shared/CustomSwitch";
import { Palette } from "../../../styles/theme";
import { WorkPhase } from "../../../models/work";
import { When } from "react-if";

const PhaseContainer = () => {
  const ctx = useContext(WorkplanContext);
  const [showCompletedPhases, setShowCompletedPhases] =
    useState<boolean>(false);
  const [allPhases, setAllPhases] = useState<WorkPhase[]>([]);

  useEffect(() => {
    if (
      ctx.work?.current_phase_id &&
      ctx.workPhases.length > 0 &&
      !ctx.selectedWorkPhase
    ) {
      const phase = ctx.workPhases.find(
        (workPhase) => workPhase.phase.id === ctx.work?.current_phase_id
      );
      ctx.setSelectedWorkPhase(phase);
    }
  }, [ctx.workPhases, ctx.work]);

  useEffect(() => {
    let filteredPhases = ctx.workPhases;
    if (showCompletedPhases) {
      filteredPhases = ctx.workPhases.filter((p) => p.is_completed);
    }
    setAllPhases(filteredPhases);
  }, [showCompletedPhases, ctx.workPhases]);
  console.log(showCompletedPhases);
  if (ctx.workPhases.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <ETHeading4>This work has no phases to be displayed</ETHeading4>
      </Box>
    );
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <FormControlLabel
          sx={{
            ml: "2px",
          }}
          control={
            <CustomSwitch
              onChange={(e, checked) => setShowCompletedPhases(checked)}
              sx={{
                marginRight: "8px",
                color: Palette.neutral.dark,
              }}
              defaultChecked={false}
            />
          }
          label="Completed Phases"
        />
      </Grid>
      <When condition={!showCompletedPhases}>
        <Grid item xs={12}>
          <ETCaption1
            sx={{
              color: Palette.neutral.dark,
            }}
          >
            CURRENT AND FUTURE PHASES
          </ETCaption1>
        </Grid>
      </When>
      {allPhases.map((phase) => (
        <Grid item xs={12}>
          <PhaseAccordion
            key={`phase-accordion-${phase.phase.id}`}
            phase={phase}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default PhaseContainer;
