import { Box, Grid, LinearProgress } from "@mui/material";
import React, { useContext } from "react";
import Moment from "moment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ETAccordion from "../../shared/accordion/Accordion";
import { PhaseAccordionProps } from "./type";
import ETAccordionSummary from "../../shared/accordion/components/AccordionSummary";
import { ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";
import PhaseSummaryItem from "../components/PhaseSummaryItem";
import ETAccordionDetails from "../../shared/accordion/components/AccordionDetails";
import PhaseAccordionActions from "./PhaseAccordionActions";
import EventGrid from "./EventGrid";
import { WorkplanContext } from "../WorkPlanContext";

const PhaseAccordion = ({ phase, workId, ...rest }: PhaseAccordionProps) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const ctx = useContext(WorkplanContext);
  React.useEffect(
    () => setExpanded(phase.phase_id === ctx.selectedPhaseId),
    [phase, ctx.selectedPhaseId]
  );
  React.useEffect(() => {
    if (expanded) {
      ctx.setSelectedPhaseId(phase.phase_id);
    }
  }, [expanded]);
  const fromDate = React.useMemo(
    () =>
      Moment(phase.start_date).isSameOrAfter(Moment())
        ? Moment(phase.start_date)
        : Moment(),
    [phase]
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          mb: "16px",
        }}
      >
        <ETAccordion
          expanded={expanded}
          onChange={(e, expanded) => setExpanded(expanded)}
        >
          <ETAccordionSummary
            expanded={expanded}
            expandIcon={<ExpandMoreIcon />}
          >
            <Box
              sx={{
                display: "grid",
                gap: "1.5rem",
                alignItems: "center",
                padding: "1rem",
                width: "100%",
                gridTemplateAreas:
                  '"phase phase start end decision nextMilestone nextMilestone nextMilestone nextMilestone completed"',
              }}
            >
              <PhaseSummaryItem sx={{ gridArea: "phase" }} label="phase">
                <ETParagraph bold sx={{ color: `${Palette.neutral.dark}` }}>
                  {phase.phase}
                </ETParagraph>
              </PhaseSummaryItem>
              <PhaseSummaryItem label="start date" sx={{ gridArea: "start" }}>
                <ETParagraph bold sx={{ color: `${Palette.neutral.dark}` }}>
                  {Moment(phase.start_date).format("MMM. DD YYYY")}
                </ETParagraph>
              </PhaseSummaryItem>
              <PhaseSummaryItem label="days left" sx={{ gridArea: "end" }}>
                <ETParagraph bold sx={{ color: `${Palette.neutral.dark}` }}>
                  {Moment.duration(Moment(phase.end_date).diff(fromDate))
                    .asDays()
                    .toFixed(0)}
                </ETParagraph>
              </PhaseSummaryItem>
              <PhaseSummaryItem
                label="next milestone"
                sx={{ gridArea: "nextMilestone" }}
              >
                <ETParagraph bold sx={{ color: `${Palette.neutral.dark}` }}>
                  {phase.next_milestone}
                </ETParagraph>
              </PhaseSummaryItem>
              <PhaseSummaryItem
                label="milestone progress"
                sx={{ gridArea: "completed" }}
              >
                <LinearProgress
                  variant="determinate"
                  value={phase.milestone_progress}
                  sx={{ marginTop: "10px" }}
                />
              </PhaseSummaryItem>
            </Box>
          </ETAccordionSummary>
          <ETAccordionDetails expanded={expanded}>
            <Grid container xs={12}>
              <Grid item xs={12}>
                <PhaseAccordionActions workId={workId}></PhaseAccordionActions>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  mt: "0.5rem",
                }}
              >
                <EventGrid workId={workId}></EventGrid>
              </Grid>
            </Grid>
          </ETAccordionDetails>
        </ETAccordion>
      </Box>
    </>
  );
};

export default PhaseAccordion;
