import { Staff } from "./staff";
import { Work } from "./work";
import { EventsGridModel } from "./event";
export interface Task {
  name: string;
  start_at: number;
  number_of_days: number;
  template_id: number;
  tips: string;
}

export interface MyTask extends EventsGridModel {
  id: number;
  work: Work;
  notes: string;
  start_date: string;
  end_date: string;
  assigned: string;
  work_phase_id: number;
  responsibilities: Responsibility[];
}

export interface Responsibility {
  id: number;
  is_active: boolean;
  responsibility_id: number;
  task_event_id: number;
}
