import { FC } from "react";
import { Button, Stack } from "@mui/material";
import { ETCaption2 } from "components/shared";
import { Palette } from "styles/theme";
import { IconProps } from "../../icons/type";
import Icons from "../../icons";

const ArrowDownward: FC<IconProps> = Icons["ArrowDownward"];

interface SortByProps {
  sortOrder: string;
  setSortOrder: (order: "asc" | "desc") => void;
  label?: string;
}

export const SortBy: FC<SortByProps> = ({
  sortOrder,
  setSortOrder,
  label = "Date Posted",
}) => {
  return (
    <Stack direction="row" spacing={0.5} alignItems={"center"}>
      <ETCaption2 color={Palette.neutral.dark}>Sort by: {label}</ETCaption2>
      <Button
        sx={{
          backgroundColor: "inherit",
          borderColor: "transparent",
          minWidth: "auto",
          padding: "0rem",
          maxHeight: "1.5rem",
        }}
        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      >
        <ArrowDownward
          sx={{
            transition: "transform 0.2s ease-in-out",
            transform: sortOrder === "asc" ? "rotate(-180deg)" : "rotate(0deg)",
            width: "1.275rem",
            height: "1.275rem",
          }}
        />
      </Button>
    </Stack>
  );
};
