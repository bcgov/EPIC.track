import React, { useRef } from "react";
import { TextField } from "@mui/material";
import debounce from "lodash/debounce";
import {
  MyWorkplansContext,
  WorkPlanSearchOptions,
} from "../MyWorkPlanContext";

export const NameFilter = () => {
  const [searchText, setSearchText] = React.useState<string>("");

  const { setSearchOptions } = React.useContext(MyWorkplansContext);
  const handleSearchOptions = (searchText: string) => {
    setSearchOptions(
      (prev: WorkPlanSearchOptions) =>
        ({
          ...prev,
          text: searchText,
        } as WorkPlanSearchOptions)
    );
  };

  const debouncedSetSearchOptions = useRef(
    debounce((searchText: string) => {
      handleSearchOptions(searchText);
    }, 1000)
  ).current;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    debouncedSetSearchOptions(event.target.value);
  };

  return (
    <TextField
      name="searchText"
      placeholder="Search for a Project"
      variant="outlined"
      fullWidth
      value={searchText}
      onChange={handleChange}
    />
  );
};
