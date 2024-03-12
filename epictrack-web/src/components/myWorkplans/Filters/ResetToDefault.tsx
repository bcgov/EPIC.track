import { useContext } from "react";
import {
  MyWorkplansContext,
  workplanDefaultFilters,
} from "../MyWorkPlanContext";
import { Link } from "@mui/material";
import { ETCaption1 } from "components/shared";

export const ResetToDefault = () => {
  const { setSearchOptions, searchOptions } = useContext(MyWorkplansContext);

  const resetFiltersToDefault = () => {
    setSearchOptions({ ...searchOptions, ...workplanDefaultFilters });
  };

  return (
    <ETCaption1
      sx={{ cursor: "pointer" }}
      component={Link}
      onClick={resetFiltersToDefault}
    >
      Reset
    </ETCaption1>
  );
};
