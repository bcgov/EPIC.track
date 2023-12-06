import { POSITION_ENUM } from "./position";
import { Staff } from "./staff";
import { WorkType } from "./workType";

export interface WorkPlan {
  id: number;
  title: string;
  is_active: boolean;
  work_type: WorkType;
  work_state: string;

  phase_info: {
    days_left: number;
    milestone_progress: number;
    next_milestone: string;
    total_number_of_days: number;
    work_phase: {
      name: string;
    };
  };

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
