import { Stack } from "@mui/material";
import { ETCaption2 } from "components/shared";
import { CustomSwitch } from "components/shared/CustomSwitch";
import { Palette } from "styles/theme";
import { useAppSelector } from "hooks";

type CalendarAssigneeToggleProps = {
  handleToggle: (checked: boolean) => void;
  isUsersItems: boolean;
  disabled?: boolean;
  label?: string;
};

const CalendarAssigneeToggle = ({
  isUsersItems,
  handleToggle,
  disabled,
  label,
}: CalendarAssigneeToggleProps) => {
  const user = useAppSelector((state) => state.user.userDetail);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <>
        <ETCaption2 bold color={Palette.neutral.dark}>
          {user?.firstName ?? "User"}'s
        </ETCaption2>
        <ETCaption2 color={Palette.neutral.dark}>{label ?? "Items"}</ETCaption2>
      </>
      <CustomSwitch
        color="primary"
        checked={isUsersItems}
        onChange={() => handleToggle(!isUsersItems)}
        disabled={disabled}
      />
    </Stack>
  );
};

export default CalendarAssigneeToggle;
