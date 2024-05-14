import { Work } from "./work";

export interface Task {
  name: string;
  start_at: number;
  number_of_days: number;
  template_id: number;
  tips: string;
}

export interface MyTask {
  id: number;
  work: Work;
  title: string;
  notes: string;
}
