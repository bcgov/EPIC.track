import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import PhaseAccordion from "./PhaseAccordion";
import { Box, FormControl, FormControlLabel, Grid } from "@mui/material";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { WorkplanContext } from "../WorkPlanContext";
import { ETCaption1, ETHeading4 } from "../../shared";
import { CustomSwitch } from "../../shared/CustomSwitch";
import { Palette } from "../../../styles/theme";
import { WorkPhaseAdditionalInfo } from "../../../models/work";
import { When } from "react-if";
import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";
import TrackSelect from "components/shared/TrackSelect";
import { OptionType } from "components/shared/filterSelect/type";
import WarningBox from "components/shared/warningBox";

const CalendarIcon: FC<IconProps> = Icons["CalendarIcon"];

const dateStyleOptions = [
  { value: "ACTUAL", label: "Actual" },
  { value: "ACTUAL_AND_ANTICIPATED", label: "Actual + Anticipated" },
];

const PhaseContainer = () => {
  const ctx = useContext(WorkplanContext);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(
    ctx.selectedWorkPhase?.work_phase.id ?? null
  );
  const [showCompletedPhases, setShowCompletedPhases] = useState<boolean>(true);
  const [showCompletedActual, setShowCompletedActual] = useState<boolean>(true);
  const [showCompletedAnticipated, setShowCompletedAnticipated] =
    useState<boolean>(false);

  const currentAndFuturePhases: WorkPhaseAdditionalInfo[] = useMemo(
    () => ctx.workPhases.filter((p) => !p.work_phase.is_completed),
    [ctx.workPhases]
  );
  const completedPhases: WorkPhaseAdditionalInfo[] = useMemo(
    () => ctx.workPhases.filter((p) => p.work_phase.is_completed),
    [ctx.workPhases]
  );

  const overduePhases: WorkPhaseAdditionalInfo[] = useMemo(
    () =>
      ctx.workPhases.filter(
        (p) =>
          p.work_phase.is_completed &&
          p.work_phase.legislated &&
          p.total_number_of_days - p.days_taken < 0
      ),
    [ctx.workPhases]
  );

  const handleExpand = (phaseId: number) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  useEffect(() => {
    if (
      ctx.work?.current_work_phase_id &&
      ctx.workPhases.length > 0 &&
      !ctx.selectedWorkPhase
    ) {
      const phase = ctx.workPhases.find(
        (workPhase) =>
          workPhase.work_phase.id === ctx.work?.current_work_phase_id
      );
      ctx.setSelectedWorkPhase(phase);
      setExpandedPhase(phase?.work_phase.id ?? null);
    }
  }, [ctx]);

  useEffect(() => {
    if (ctx.selectedWorkPhase) {
      setExpandedPhase(ctx.selectedWorkPhase.work_phase.id);
    }
  }, [ctx.selectedWorkPhase]);

  const callback = useCallback(() => {
    return ctx.work?.work_type?.name ?? undefined;
  }, [ctx.work?.work_type?.name]);

  useRouterLocationStateForHelpPage(callback);

  const formatDateStyleOptionLabel = (
    option: any,
    { context }: { context: "menu" | "value" }
  ) => {
    return (
      <ETCaption1
        sx={{ textTransform: "uppercase" }}
        color={Palette.neutral.dark}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {context === "value" && <CalendarIcon />}
          {context === "value"
            ? `Phase Date View: ${option.label}`
            : option.label}
        </Box>
      </ETCaption1>
    );
  };

  if (ctx.workPhases.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <ETHeading4>This work has no phases to be displayed</ETHeading4>
      </Box>
    );
  }

  return (
    <Grid container spacing={1}>
      <When condition={completedPhases.length > 0}>
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
                defaultChecked={showCompletedPhases}
              />
            }
            label={
              <ETCaption1
                sx={{
                  color: Palette.neutral.dark,
                }}
              >
                COMPLETED PHASES
              </ETCaption1>
            }
          />
          <></>
          {showCompletedPhases && (
            <FormControl sx={{ minWidth: 220 }}>
              <TrackSelect
                options={dateStyleOptions}
                value={
                  showCompletedAnticipated
                    ? dateStyleOptions.find(
                        (option) => option.value === "ACTUAL_AND_ANTICIPATED"
                      )
                    : dateStyleOptions[0]
                }
                onChange={(selectedOption) => {
                  const option = selectedOption as OptionType;
                  if (option.value === "ACTUAL") {
                    setShowCompletedActual(true);
                    setShowCompletedAnticipated(false);
                  } else {
                    setShowCompletedActual(true);
                    setShowCompletedAnticipated(true);
                  }
                }}
                isClearable={false}
                isSearchable={false}
                formatOptionLabel={formatDateStyleOptionLabel}
              />
            </FormControl>
          )}
        </Grid>
      </When>
      <When condition={showCompletedPhases}>
        {completedPhases.map((phase) => (
          <Grid item xs={12} key={`completed-phase-${phase.work_phase.id}`}>
            <PhaseAccordion
              key={`phase-accordion-${phase.work_phase.id}`}
              expanded={expandedPhase === phase.work_phase.id}
              onExpandHandler={() => handleExpand(phase.work_phase.id)}
              phase={phase}
              showAnticipated={showCompletedAnticipated}
              showActual={showCompletedActual}
            />
          </Grid>
        ))}
      </When>
      <When condition={currentAndFuturePhases.length > 0}>
        <Grid item xs={12}>
          <ETCaption1
            sx={{
              color: Palette.neutral.dark,
            }}
          >
            CURRENT + FUTURE PHASES
          </ETCaption1>
        </Grid>
      </When>
      {currentAndFuturePhases.map((phase) => (
        <Grid item xs={12} key={`current-phase-${phase.work_phase.id}`}>
          <PhaseAccordion
            key={`phase-accordion-${phase.work_phase.id}`}
            expanded={expandedPhase === phase.work_phase.id}
            onExpandHandler={() => handleExpand(phase.work_phase.id)}
            phase={phase}
            showAnticipated={true}
            showActual={false}
          />
        </Grid>
      ))}
      {!!overduePhases.length && (
        <WarningBox
          title={`You've exceeded the legislated timeline in phase${
            overduePhases.length > 1 ? "s" : ""
          }: ${overduePhases.map((p) => p.work_phase.name).join(", ")}.`}
          subTitle={
            <>
              You must add an <b>Extension Milestone</b> of{" "}
              <b>
                {Math.abs(
                  overduePhases.reduce(
                    (sum, p) => sum + (p.total_number_of_days - p.days_taken),
                    0
                  )
                )}{" "}
                days
              </b>{" "}
              to complete this Work.
            </>
          }
          isTitleBold={true}
        />
      )}
    </Grid>
  );
};

export default PhaseContainer;
