import { Box, LinearProgress, Skeleton } from "@mui/material";
import React from "react";
import Moment from "moment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ETAccordion from "../../shared/accordion/Accordion";
import { PhaseAccordionProps } from "../type";
import workService from "../../../services/workService/workService";
import { WorkPhaseSkeleton } from "../../../models/work";
import ETAccordionSummary from "../../shared/accordion/components/AccordionSummary";
import { ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";
import PhaseSummaryItem from "./PhaseSummaryItem";
import PhaseAccordionDetails from "./PhaseAccordionDetails";

const PhaseAccordion = ({
  workId,
  currentPhase,
  ...rest
}: PhaseAccordionProps) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedPhase, setSelectedPhase] = React.useState<number>(0);
  const [phases, setPhases] = React.useState<WorkPhaseSkeleton[]>([]);

  React.useEffect(() => {
    getWorkById();
  }, [workId]);

  React.useEffect(() => {
    if (currentPhase) setSelectedPhase(currentPhase);
  }, [currentPhase]);

  const getWorkById = React.useCallback(async () => {
    if (workId) {
      setLoading(true);
      const work = await workService.getWorkPhases(String(workId));
      setPhases(work.data as WorkPhaseSkeleton[]);
      console.log(work.data);
      setLoading(false);
    }
  }, [workId]);

  const handleExpand =
    (phaseId: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setSelectedPhase(isExpanded ? phaseId : 0);
    };

  return (
    <>
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {phases?.map((phase: WorkPhaseSkeleton) => {
            const fromDate = Moment(phase.start_date).isSameOrAfter(Moment())
              ? Moment(phase.start_date)
              : Moment();
            return (
              <ETAccordion
                activePane={selectedPhase}
                loading={loading}
                handleExpand={() => handleExpand(phase.phase_id)}
                phaseId={phase.phase_id}
              >
                <ETAccordionSummary expandIcon={<ExpandMoreIcon />}>
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
                      <ETParagraph
                        bold
                        sx={{ color: `${Palette.neutral.dark}` }}
                      >
                        {phase.phase}
                      </ETParagraph>
                    </PhaseSummaryItem>
                    <PhaseSummaryItem
                      label="start date"
                      sx={{ gridArea: "start" }}
                    >
                      <ETParagraph
                        bold
                        sx={{ color: `${Palette.neutral.dark}` }}
                      >
                        {Moment(phase.start_date).format("MMM. DD YYYY")}
                      </ETParagraph>
                    </PhaseSummaryItem>
                    <PhaseSummaryItem
                      label="days left"
                      sx={{ gridArea: "end" }}
                    >
                      <ETParagraph
                        bold
                        sx={{ color: `${Palette.neutral.dark}` }}
                      >
                        {Moment.duration(Moment(phase.end_date).diff(fromDate))
                          .asDays()
                          .toFixed(0)}
                      </ETParagraph>
                    </PhaseSummaryItem>
                    <PhaseSummaryItem
                      label="next milestone"
                      sx={{ gridArea: "nextMilestone" }}
                    >
                      <ETParagraph
                        bold
                        sx={{ color: `${Palette.neutral.dark}` }}
                      >
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
                <PhaseAccordionDetails />
              </ETAccordion>
            );
          })}
        </Box>
      )}
    </>
  );
};

export default PhaseAccordion;
