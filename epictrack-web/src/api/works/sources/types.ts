import { Work, WorkInput, WorkListItem, WorkOption } from "models/work";

/** Each source maps its own wire format to these frontend types. */
export interface WorksSource {
  get(id: number): Promise<Work>;
  list(): Promise<WorkListItem[]>;
  /** For filters. */
  listOptions(): Promise<WorkOption[]>;
  create(input: WorkInput): Promise<Work>;
  update(id: number, input: WorkInput): Promise<Work>;
  checkExists(title: string, excludeId?: number): Promise<boolean>;
}
