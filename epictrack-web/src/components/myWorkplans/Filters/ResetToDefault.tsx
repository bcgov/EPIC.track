import { useContext } from "react";
import { MyWorkplansContext, defaultSearchOptions } from "../MyWorkPlanContext";
import { Link } from "@mui/material";
import { ETCaption1 } from "components/shared";

export const ResetToDefault = () => {
  const { setSearchOptions } = useContext(MyWorkplansContext);

  const resetFiltersToDefault = () => {
    setSearchOptions(defaultSearchOptions);
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
