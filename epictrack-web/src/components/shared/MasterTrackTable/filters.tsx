import { MRT_FilterFn } from "material-react-table";

const searchFilter: MRT_FilterFn<any> = (row, id, filterValue: string) => {
  const value: string = (row.getValue(id) as string).toLowerCase();
  return value.includes(filterValue.trim().toLowerCase());
};

export { searchFilter };
