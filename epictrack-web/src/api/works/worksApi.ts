import { WorksSource } from "./sources/types";
import { trackWorksSource } from "./sources/track";

// The one place the source is chosen (see README.md). To move one operation:
// { ...trackWorksSource, get: demiWorksSource.get }
const source: WorksSource = trackWorksSource;

/** A plain object so Cypress can stub its methods. */
export const worksApi: WorksSource = { ...source };
