import React, { useState, useEffect, useContext } from "react";
import {
  Autocomplete,
  Box,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import { MyWorkplansContext } from "../MyWorkPlanContext";
import { projectsApi } from "api/projects";
import SearchIcon from "../../../assets/images/search.svg";
import { highlightText } from "../../../utils/MatchingTextHighlight";

const SEARCH_TEXT_THRESHOLD = 1;

interface NameFilterProps {
  searchOptions?: any;
  setSearchOptions?: React.Dispatch<React.SetStateAction<any>>;
}

export const NameFilter = ({
  searchOptions: propSearchOptions,
  setSearchOptions: propSetSearchOptions,
}: NameFilterProps) => {
  const context = useContext(MyWorkplansContext);
  const searchOptions = propSearchOptions ?? context.searchOptions;
  const setSearchOptions = propSetSearchOptions ?? context.setSearchOptions;

  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>(searchOptions.text);

  const handleSearchOptions = (searchText: string) => {
    setSearchOptions((prev) => ({
      ...prev,
      text: searchText as string,
    }));
  };

  // Fetch project names from the backend when searchText changes
  useEffect(() => {
    const fetchProjectNames = async () => {
      try {
        const projects = await projectsApi.listOptions({ withWorks: true });
        setOptions(projects.map((project) => project.name));
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
