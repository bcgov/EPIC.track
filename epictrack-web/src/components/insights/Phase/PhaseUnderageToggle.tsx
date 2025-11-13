import { Stack } from "@mui/material";
import { ETCaption2 } from "components/shared";
import { CustomSwitch } from "components/shared/CustomSwitch";
import { Palette } from "styles/theme";

type PhaseInsightUnderageProps = {
  handleToggle: (checked: boolean) => void;
  checked: boolean;
};

const PhaseInsightUnderageToggle = ({
  handleToggle,
  checked,
}: PhaseInsightUnderageProps) => {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <>
        <ETCaption2 bold color={Palette.neutral.dark}>
          VIEW UNDERAGE INSIGHTS
        </ETCaption2>
      </>
      <CustomSwitch
        color="primary"
        checked={checked}
        onChange={() => handleToggle(!checked)}
      />
    </Stack>
  );
};

export default PhaseInsightUnderageToggle;
