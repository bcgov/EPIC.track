import React, { useState, useEffect, useContext } from "react";
import {
  Autocomplete,
  Box,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  MyWorkplansContext,
  WorkPlanSearchOptions,
} from "../MyWorkPlanContext";
import projectService from "../../../services/projectService/projectService";
import { PROJECT_RETURN_TYPE } from "../../../services/projectService/constants";
import { ListType } from "../../../models/code";
import SearchIcon from "../../../assets/images/search.svg";
import { highlightText } from "../../../utils/MatchingTextHighlight";

const SEARCH_TEXT_THRESHOLD = 1;
export const NameFilter = () => {
  const { setSearchOptions, searchOptions } = useContext(MyWorkplansContext);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>(searchOptions.text);

  const handleSearchOptions = (searchText: string) => {
    setSearchOptions(
      (prev: WorkPlanSearchOptions) =>
        ({
          ...prev,
          text: searchText,
        } as WorkPlanSearchOptions)
    );
  };

  // Fetch project names from the backend when searchText changes
  useEffect(() => {
    const fetchProjectNames = async () => {
      // Replace this with your actual backend API call
      try {
        const with_works = true;
        const response = (await projectService.getAll(
          PROJECT_RETURN_TYPE.LIST_TYPE,
          with_works
        )) as { data: ListType[] };

        const projectNames = response.data.map((project) => project.name);
        setOptions(projectNames);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProjectNames();
  }, []);

  return (
    <Autocomplete
      freeSolo
      options={searchText.length >= SEARCH_TEXT_THRESHOLD ? options : []}
      defaultValue={searchOptions.text}
      onInputChange={(_, newValue) => {
        setSearchText(newValue ?? "");
      }}
      onChange={(_, newValue) => {
        handleSearchOptions(newValue ?? "");
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Search for a Project"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ marginLeft: "0.5em" }}>
                <Box
                  component="img"
                  src={SearchIcon}
                  alt="Search"
                  width="16px"
                />
              </InputAdornment>
            ),
          }}
        />
      )}
      fullWidth
      clearOnBlur
      noOptionsText=""
      renderOption={(props, option, state) => (
        <MenuItem {...props}>
          {highlightText(option, state.inputValue)}
        </MenuItem>
      )}
      disabled={loading}
    />
  );
};
