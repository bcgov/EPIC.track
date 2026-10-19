import { useContext } from "react";
import {
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { ETCaption2 } from "components/shared";
import { Palette } from "styles/theme";
import { MyWorkplansContext } from "../MyWorkPlanContext";

const SORT_KEYS = [
  {
    value: "start_date",
    label: "Start Date",
    orders: [
      { value: "desc", label: "Newest first" },
      { value: "asc", label: "Oldest first" },
    ],
  },
  {
    value: "name",
    label: "Alphabetical",
    orders: [
      { value: "asc", label: "A to Z" },
      { value: "desc", label: "Z to A" },
    ],
  },
];

// Both groups live in one Select, so values are prefixed to tell them apart
const KEY_PREFIX = "key:";
const ORDER_PREFIX = "order:";

const renderOption = (value: string, label: string, checked: boolean) => (
  <MenuItem key={value} value={value}>
    <ListItemIcon>{checked && <CheckIcon fontSize="small" />}</ListItemIcon>
    <ListItemText>{label}</ListItemText>
  </MenuItem>
);

export const SortByFilter = () => {
  const { sortKey, setSortKey, sortOrder, setSortOrder } =
    useContext(MyWorkplansContext);

  const currentKey =
    SORT_KEYS.find((key) => key.value === sortKey) ?? SORT_KEYS[0];

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    if (value.startsWith(ORDER_PREFIX)) {
      setSortOrder(value.slice(ORDER_PREFIX.length));
      return;
    }
    const newKey = SORT_KEYS.find(
      (key) => key.value === value.slice(KEY_PREFIX.length),
    );
    if (!newKey || newKey.value === sortKey) return;
    setSortKey(newKey.value);
    setSortOrder(newKey.orders[0].value);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <ETCaption2 color={Palette.neutral.dark} sx={{ whiteSpace: "nowrap" }}>
        Sort by:
      </ETCaption2>
      <Select
        size="small"
        sx={{ width: "10rem" }}
        value={`${KEY_PREFIX}${currentKey.value}`}
        renderValue={() => currentKey.label}
        onChange={handleChange}
        inputProps={{ "aria-label": "Sort by" }}
        data-cy="sort-by-select"
      >
        <ListSubheader>Sort by</ListSubheader>
        {SORT_KEYS.map((key) =>
          renderOption(
            `${KEY_PREFIX}${key.value}`,
            key.label,
            key.value === currentKey.value,
          ),
        )}
        <ListSubheader>Order</ListSubheader>
        {currentKey.orders.map((order) =>
          renderOption(
            `${ORDER_PREFIX}${order.value}`,
            order.label,
            order.value === sortOrder,
          ),
        )}
      </Select>
    </Stack>
  );
};
