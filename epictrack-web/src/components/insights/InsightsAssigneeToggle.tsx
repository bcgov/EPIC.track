import { Stack } from "@mui/material";
import { ETCaption2 } from "components/shared";
import { CustomSwitch } from "components/shared/CustomSwitch";
import { Palette } from "styles/theme";
import { useAppSelector } from "hooks";

type InsightsAssigneeToggleProps = {
  handleToggle: (checked: boolean) => void;
  isUserInsights: boolean;
  disabled?: boolean;
  label?: string;
};

const InsightsAssigneeToggle = ({
  isUserInsights,
  handleToggle,
  disabled,
  label,
}: InsightsAssigneeToggleProps) => {
  const user = useAppSelector((state) => state.user.userDetail);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <>
        <ETCaption2 bold color={Palette.neutral.dark}>
          {user?.firstName ?? "User"}'s
        </ETCaption2>
        <ETCaption2 color={Palette.neutral.dark}>
          {label ?? "Insights"}
        </ETCaption2>
      </>
      <CustomSwitch
        color="primary"
        checked={isUserInsights}
        onChange={() => handleToggle(!isUserInsights)}
        disabled={disabled}
      />
    </Stack>
  );
};

export default InsightsAssigneeToggle;
