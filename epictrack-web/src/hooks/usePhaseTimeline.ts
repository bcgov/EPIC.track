import { useMemo } from "react";
import { WorkPhaseAdditionalInfo } from "../models/work";

interface UsePhaseTimelineParams {
  workPhases: WorkPhaseAdditionalInfo[];
  currentWorkPhaseId?: number;
}

interface UsePhaseTimelineReturn {
  currentAndFuturePhases: WorkPhaseAdditionalInfo[];
  completedPhases: WorkPhaseAdditionalInfo[];
  overduePhases: WorkPhaseAdditionalInfo[];
  numberOfExtensionDaysRecommended: number;
}

export const usePhaseTimeline = ({
  workPhases,
  currentWorkPhaseId,
}: UsePhaseTimelineParams): UsePhaseTimelineReturn => {
  const currentAndFuturePhases: WorkPhaseAdditionalInfo[] = useMemo(
    () => workPhases.filter((p) => !p.work_phase.is_completed),
    [workPhases],
  );

  const completedPhases: WorkPhaseAdditionalInfo[] = useMemo(() => {
    const filtered = workPhases.filter((p) => p.work_phase.is_completed);
    return filtered;
  }, [workPhases]);

  const overduePhases: WorkPhaseAdditionalInfo[] = useMemo(() => {
    const filtered = workPhases.filter((p) => {
      return (
        p.work_phase.is_completed &&
        p.work_phase.legislated &&
        p.total_number_of_days - p.days_taken < 0
      );
    });
    return filtered;
  }, [workPhases]);

  const earlyPhases: WorkPhaseAdditionalInfo[] = useMemo(
    () =>
      workPhases.filter(
        (p) =>
          p.work_phase.is_completed &&
          p.work_phase.legislated &&
          p.total_number_of_days - p.days_taken > 0,
      ),
    [workPhases],
  );

  // Days overdue from completed legislated phases (excluding final phase)
  const totalDaysOverdue = useMemo(() => {
    return overduePhases.reduce(
      (sum, p) => sum + Math.abs(p.total_number_of_days - p.days_taken),
      0,
    );
  }, [overduePhases]);

  // Days early from completed legislated phases (excluding final phase)
  const totalDaysEarly = useMemo(() => {
    return earlyPhases.reduce(
      (sum, p) => sum + (p.total_number_of_days - p.days_taken),
      0,
    );
  }, [earlyPhases]);

  // Days difference between legislated final phase end and actual/anticipated end event
  const finalPhaseDaysDiff = useMemo(() => {
    const finalPhase = workPhases.find((phase) => phase.is_last_phase);
    if (!finalPhase) {
      return 0;
    }
    // Ignore if final phase has not yet started
    if (currentWorkPhaseId !== finalPhase?.work_phase.id) {
      return 0;
    }
    const endMilestone = finalPhase.end_milestone;
    const endMilestoneDate =
      endMilestone.actual_date || endMilestone.anticipated_date;

    // Calculate the phase's legislated end date
    const phaseStartDate = new Date(finalPhase.work_phase.start_date);
    const phaseEndDate = new Date(phaseStartDate);
    phaseEndDate.setDate(
      phaseEndDate.getDate() + finalPhase.total_number_of_days + 1,
    ); // +1 inclusive

    // Calculate difference between end event and phase legislated end
    const daysDiff = Math.ceil(
      (new Date(endMilestoneDate).getTime() - phaseEndDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // Phase will be over if daysDiff > 0
    // Else daysDiff <= 0 and phase is ontime or early
    return daysDiff;
  }, [currentWorkPhaseId, workPhases]);

  const numberOfExtensionDaysRecommended = useMemo(() => {
    const legislatedPhasesBalance = totalDaysOverdue - totalDaysEarly;
    return legislatedPhasesBalance + finalPhaseDaysDiff;
  }, [finalPhaseDaysDiff, totalDaysEarly, totalDaysOverdue]);

  return {
    currentAndFuturePhases,
    completedPhases,
    overduePhases,
    numberOfExtensionDaysRecommended,
  };
};
