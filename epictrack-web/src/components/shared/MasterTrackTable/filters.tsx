import { MRT_FilterFn } from "material-react-table";

const searchFilter: MRT_FilterFn<any> = (row, id, filterValue) => {
  const value: string = (row.getValue(id) as string).toLowerCase();

  if (Array.isArray(filterValue)) {
    // If filterValue is an array, check if the value includes any of the selected options
    return filterValue.some((option) => value.includes(option.toLowerCase()));
  } else if (typeof filterValue === "string") {
    // If filterValue is a string, check if the value includes the filterValue
    return value.includes(filterValue.trim().toLowerCase());
  }

  // If filterValue is neither an array nor a string, return false
  return false;
};
/**
 * Never runs (the API filters), but a column still needs it: TanStack drops an empty filter value
 * when the filter function declares `autoRemove`, and the insights charts stay blank until the
 * table has registered its columns in the shared filter context. Ours has no `autoRemove`.
 */
const serverSideFilter: MRT_FilterFn<any> = () => true;

export { searchFilter, serverSideFilter };
