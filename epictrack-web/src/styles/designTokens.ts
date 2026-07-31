/**
 * Design tokens for EPIC.track.
 *
 * The first section is transcribed from the B.C. Design System
 * (`@bcgov/design-tokens` v5.0.0) and kept local so values can be tuned without
 * waiting on an upstream release. Names match the upstream token names, so
 * anything in that section can be diffed against the published set.
 *
 * The second section holds values EPIC.track needs that the design system does
 * not publish. They are prefixed `track` so an upstream diff does not flag them
 * as drift.
 *
 * Adding a colour? Put it here, not in a component. `Palette` and `BaseTheme` in
 * `theme.tsx` both resolve from this file, so the two can no longer disagree.
 *
 * The SCSS half is `_tokens.scss` - change both together.
 */

/* ========================================================================== */
/* B.C. Design System                                                          */
/* ========================================================================== */

/* -------------------------------------------------------------------------- */
/* Brand / surfaces                                                            */
/* -------------------------------------------------------------------------- */

export const surfaceColorPrimaryDefault = "#013366";
export const surfaceColorPrimaryHover = "#1e5189";
export const surfaceColorPrimaryPressed = "#01264c";
export const surfaceColorPrimaryDisabled = "#edebe9";

export const surfaceColorBackgroundWhite = "#ffffff";
export const surfaceColorBackgroundLightGray = "#faf9f8";
export const surfaceColorBackgroundLightBlue = "#f1f8fe";

export const surfaceColorBorderDefault = "#d8d8d8";
export const surfaceColorBorderMedium = "#898785";
export const surfaceColorBorderDark = "#353433";
export const surfaceColorBorderActive = "#2e5dd7";

export const surfaceColorFormsDisabled = "#edebe9";

export const surfaceShadowSmall =
  "0 0.6000000238418579px 1.7999999523162842px 0 #0000001a, 0 3.200000047683716px 7.199999809265137px 0 #00000021";

/* -------------------------------------------------------------------------- */
/* Status colours                                                              */
/*                                                                             */
/* Drive the status chips, work-state pills, notifications, warning boxes and   */
/* the status icons. Change a value here and every one of those follows.        */
/* -------------------------------------------------------------------------- */

// --- Success / active -------------------------------------------------------
export const supportBorderColorSuccess = "#839537";
export const supportSurfaceColorSuccess = "#eef5dc";
export const iconsColorSuccess = "#42814a";

// --- Warning / high priority ------------------------------------------------
export const supportBorderColorWarning = "#f8bb47";
export const supportSurfaceColorWarning = "#fef1d8";

// --- Danger / error ---------------------------------------------------------
export const supportBorderColorDanger = "#ce3e39";
export const supportSurfaceColorDanger = "#f4e1e2";

/* -------------------------------------------------------------------------- */
/* Typography                                                                  */
/* -------------------------------------------------------------------------- */

// Quoted deliberately: this is dropped straight into a font-family stack.
export const typographyFontFamiliesBcSans = "'BC Sans'";

export const typographyFontWeightsRegular = 400;
export const typographyFontWeightsBold = 700;

export const typographyColorPrimary = "#2d2d2d";
export const typographyColorSecondary = "#474543";
export const typographyColorPrimaryInvert = "#ffffff";
export const typographyColorDisabled = "#9f9d9c";
export const typographyColorPlaceholder = "#9f9d9c";
export const typographyColorLink = "#255a90";
export const typographyColorDanger = "#ce3e39";

export const typographyFontSizeLabel = "0.75rem";
export const typographyFontSizeSmallBody = "0.875rem";
export const typographyFontSizeBody = "1rem";
export const typographyFontSizeLargeBody = "1.125rem";
export const typographyFontSizeH5 = "1.25rem";
export const typographyFontSizeH4 = "1.5rem";
export const typographyFontSizeH3 = "1.75rem";
export const typographyFontSizeH2 = "2rem";
export const typographyFontSizeH1 = "2.25rem";

// Line heights paired with the sizes above, from the upstream composite type
// tokens.
export const typographyLineHeightH1 = "3.375rem";
export const typographyLineHeightH2 = "3rem";
export const typographyLineHeightH3 = "3rem";
export const typographyLineHeightH4 = "2.25rem";
export const typographyLineHeightH5 = "2.125rem";
export const typographyLineHeightLargeBody = "1.913rem";
export const typographyLineHeightBody = "1.688rem";
export const typographyLineHeightSmallBody = "1.313rem";
export const typographyLineHeightLabel = "1.125rem";

/* -------------------------------------------------------------------------- */
/* Layout                                                                      */
/* -------------------------------------------------------------------------- */

export const layoutBorderRadiusMedium = "4px";
export const layoutBorderRadiusLarge = "6px";

/* ========================================================================== */
/* EPIC.track additions                                                        */
/*                                                                             */
/* Not published by the design system. Each one is here because EPIC.track has  */
/* a surface the B.C. Design System has no token for; see                       */
/* docs/bc-design-system-followups.md.                                         */
/* ========================================================================== */

/**
 * Text and icon colours that sit on the status tints above.
 *
 * The design system publishes only a border and a surface per status, and its
 * border colours do not reach AA on their own tints at body sizes. These are
 * EPIC.track's existing values, which do, kept until design supplies an
 * official pairing.
 */
export const trackSupportTextColorSuccess = "#236430";
export const trackSupportTextColorWarning = "#674901";
export const trackSupportTextColorDanger = "#a31e22";

/** Lighter status fills, used for in-progress icons and history timelines. */
export const trackIconsColorSuccessLight = "#70cd83";
export const trackIconsColorDangerLight = "#e57074";

/** Hover fill for the gold/secondary surfaces (side nav, environment banner). */
export const trackSurfaceColorWarningHover = "#fdd166";

/** Selected table row and the "in progress" work-state pill. */
export const trackSurfaceColorRowSelected = "#d6ebff";

/** Heading size EPIC.track keeps that has no design system equivalent. */
export const trackTypographyFontSizeCaption = "0.8125rem";
export const trackTypographyLineHeightCaption = "1.219rem";
