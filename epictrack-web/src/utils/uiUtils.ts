import { StalenessEnum } from "constants/application-constant";
import { Palette } from "styles/theme";

const staleLevel = (staleness: string) => {
  if (staleness === StalenessEnum.CRITICAL) {
    return {
      background: Palette.error.main,
    };
  } else if (staleness === StalenessEnum.WARN) {
    return {
      background: Palette.secondary.main,
    };
  } else {
    return {
      background: Palette.success.main,
    };
  }
};

export { staleLevel };
