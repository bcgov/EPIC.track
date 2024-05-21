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
export { searchFilter };
