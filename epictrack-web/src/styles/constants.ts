import {
  typographyFontFamiliesBcSans,
  typographyFontWeightsBold,
  typographyFontWeightsRegular,
} from "./designTokens";

// Single source for the font stack. The token supplies its own quotes:
// "'BC Sans'". This previously used U+00B7 MIDDLE DOT characters instead of
// spaces as separators, which made the whole font-family declaration invalid,
// so the theme's font never applied.
export const MET_Header_Font_Family = `${typographyFontFamiliesBcSans}, "Noto Sans", Verdana, Arial, sans-serif`;
export const MET_Header_Font_Weight_Bold = typographyFontWeightsBold;
export const MET_Header_Font_Weight_Regular = typographyFontWeightsRegular;
