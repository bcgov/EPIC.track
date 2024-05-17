import { WorkPhase } from "./work";
import { WorkType } from "./workType";

export type PhaseInfo = {
  days_left: number;
  milestone_progress: number;
  next_milestone: string;
  total_number_of_days: number;
  work_phase: {
    name: string;
    id: number;
    phase: {
      color: string;
    };
    start_date: string;
    end_date: string;
  };
};
export interface WorkPlan {
  id: number;
  title: string;
  simple_title: string;
  is_active: boolean;
  current_work_phase_id: number;
  work_type: WorkType;
  work_state: string;

  project: {
    name: string;
  };

  phase_info: PhaseInfo[];

  federal_involvement: {
    name: string;
  };

  eao_team: {
    name: string;
  };

  staff_info: [
    {
      staff: {
        first_name: string;
        last_name: string;
        full_name: string;
      };
      role: {
        name: string;
      };
    }
  ];

  status_info: {
    posted_date: string;
    description: string;
  };
}
