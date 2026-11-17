import { ProjectsSource } from "./sources/types";
import { trackProjectsSource } from "./sources/track";

// The one place the source is chosen (see README.md). To move one operation:
// { ...trackProjectsSource, getSummary: demiProjectsSource.getSummary }
const source: ProjectsSource = trackProjectsSource;

/** A plain object so Cypress can stub its methods. */
export const projectsApi: ProjectsSource = { ...source };
