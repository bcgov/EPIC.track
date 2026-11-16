import { ListType } from "models/code";
import {
  Project,
  ProjectInput,
  ProjectRef,
  ProjectSummary,
} from "models/project";
import { Proponent } from "models/proponent";
import { SubType } from "models/subtype";

export interface ProjectFormOptions {
  types: ListType[];
  proponents: Proponent[];
  envRegions: ListType[];
  nrsRegions: ListType[];
}

/** Each source maps its own wire format to these frontend types. */
export interface ProjectsSource {
  get(id: number): Promise<Project>;
  getSummary(id: number): Promise<ProjectSummary>;
  list(): Promise<Project[]>;
  /** For dropdowns; `withWorks` keeps only projects that have works. */
  listOptions(filter?: { withWorks?: boolean }): Promise<ProjectRef[]>;
  create(input: ProjectInput): Promise<Project>;
  update(id: number, input: ProjectInput): Promise<Project>;
  checkExists(name: string, excludeId?: number): Promise<boolean>;
  suggestAbbreviation(name: string): Promise<string>;
  /** For filters; the form uses getFormOptions. */
  listTypes(): Promise<ListType[]>;
  getFormOptions(): Promise<ProjectFormOptions>;
  listSubTypes(typeId: number | string): Promise<SubType[]>;
}
