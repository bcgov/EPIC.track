import React, { useState, useEffect } from "react";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { workService } from "services/workService/workService";

interface Work {
  id: number;
  name: string;
}

interface WorkNameFilterProps {
  searchOptions: any;
  setSearchOptions: React.Dispatch<React.SetStateAction<any>>;
}

export const WorkNameFilter = ({
  searchOptions,
  setSearchOptions,
}: WorkNameFilterProps) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<Work[]>([]);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await workService.getAll();
        const works: Work[] = response.data
          .map((w: any) => ({
            id: w.id,
            name: w.title,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setOptions(works);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  return (
    <Autocomplete
      multiple
      disabled={loading}
      options={options}
      getOptionLabel={(option) => option.name}
      value={options.filter((w) => searchOptions.work_ids?.includes(w.id))}
      onChange={(_, selected) => {
        setSearchOptions((prev: any) => ({
          ...prev,
          work_ids: selected.map((w) => w.id),
        }));
      }}
      disableClearable
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Search for Works"
        />
      )}
      renderOption={(props, option) => <li {...props}>{option.name}</li>}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => (
          <Chip label={option.name} size="small" {...getTagProps({ index })} />
        ))
      }
    />
  );
};
