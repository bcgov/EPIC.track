import { useContext, useMemo } from "react";
import { WorkplanContext, WorkplanContextProps } from "./WorkPlanContext";

export const useWorkplanSelector = <T>(
  selector: (context: WorkplanContextProps) => T,
): T => {
  const context = useContext(WorkplanContext);

  if (!context) {
    console.error("useWorkplanSelector must be used within a WorkplanProvider");
  }
  return useMemo(() => selector(context), [context, selector]);
};
