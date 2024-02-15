import { WorkType } from "./workType";

export interface WorkPlan {
  id: number;
  title: string;
  simple_title: string;
  is_active: boolean;
  work_type: WorkType;
  work_state: string;

  project: {
    name: string;
  };

  phase_info: {
    days_left: number;
    milestone_progress: number;
    next_milestone: string;
    total_number_of_days: number;
    work_phase: {
      name: string;
      phase: {
        color: string;
      };
    };
  }[];

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
