# B.C. Design System alignment — deferred work

Companion to the TRACK-785 styling alignment. Everything here was found while
aligning EPIC.track with the B.C. Design System and deliberately left out of that
change, either because it needs a design decision, because the design system does
not publish an equivalent, or because it is a correctness issue rather than a
styling one.

Colour and type now resolve from `epictrack-web/src/styles/designTokens.ts`
(transcribed from `@bcgov/design-tokens` v5.0.0, upstream names preserved) and its
SCSS twin `_tokens.scss`. `Palette` and `BaseTheme` in `styles/theme.tsx` both read
from that file, so they can no longer disagree.

---

## 1. Needs design sign-off

### 1.1 The colour shift

Aligning on the design system moves several values. BC DS greys are warm-tinted
where EPIC.track's were cool.

| Role | Was | Now | Token |
|---|---|---|---|
| Primary | `#003366` | `#013366` | `surfaceColorPrimaryDefault` |
| Primary hover | `#38598A` | `#1e5189` | `surfaceColorPrimaryHover` |
| Primary pressed | `#00264D` | `#01264c` | `surfaceColorPrimaryPressed` |
| Link / icon accent | `#1A5A96` | `#255a90` | `typographyColorLink` |
| Focus / active border | `#0070E0` | `#2e5dd7` | `surfaceColorBorderActive` |
| Body text | `#494949` | `#474543` | `typographyColorSecondary` |
| Heading text | `#313132` | `#2d2d2d` | `typographyColorPrimary` |
| Muted text / border | `#858A8C` | `#898785` | `surfaceColorBorderMedium` |
| Input border, divider | `#C2C4C5`, `#DBDCDC` | `#d8d8d8` | `surfaceColorBorderDefault` |
| Light surface | `#F9F9FB` | `#faf9f8` | `surfaceColorBackgroundLightGray` |
| Hover / disabled surface | `#F2F2F2` | `#edebe9` | `surfaceColorFormsDisabled` |
| Gold / secondary | `#FCBA19` | `#f8bb47` | `supportBorderColorWarning` |
| Success | `#2E8540` | `#42814a` | `iconsColorSuccess` |
| Error | `#D8292F` | `#ce3e39` | `supportBorderColorDanger` |

Note the input border and the divider previously differed (`#C2C4C5` vs `#DBDCDC`)
and now both resolve to `surfaceColorBorderDefault`. That is what the design system
intends, but it does flatten one distinction the app used to make.

### 1.2 Headings are now bold

Every heading was `font-weight: 400`. The design system's headings are bold, so
`h1`–`h4` are now 700. Sizes are unchanged. Callers can still force a weight by
passing `bold={false}` to the `ET*` wrappers.

### 1.3 Heading line heights grew

`h1`, `h2` and `h3` had a `line-height` *smaller* than their `font-size`
(`2rem` text on a `1.5rem` line box), so headings clipped. They now use the design
system's paired line heights. Headings occupy noticeably more vertical space.

EPIC.track's `h1`–`h4` sizes turned out to be the design system's `h2`–`h5` sizes,
so each variant took its matching upstream line height:

| variant | size | lineHeight was | now |
|---|---|---|---|
| `h1` | 2rem | 1.5rem | 3rem |
| `h2` | 1.75rem | 1.4rem | 3rem |
| `h3` | 1.5rem | 1.3rem | 2.25rem |
| `h4` | 1.25rem | 1.6rem | 2.125rem |

`h2`'s arbitrary `letterSpacing: -1.12px` was dropped. Because upstream pairs both
`2rem` and `1.75rem` with a `3rem` line box, `h1` and `h2` now have identical line
heights.

**This is the highest-risk change for layout.** It already surfaced one regression:
the My Workplans card body is a fixed-height column `Grid`, and MUI `Grid`
containers wrap by default — so once the taller text exceeded the fixed height, the
overflow started a *second column* and "FEDERAL INVOLVEMENT"'s value rendered at the
top right. Fixed by adding `flexWrap: "nowrap"` and sizing the body to its real
content. Other fixed-height layouts should be checked against real data.

### 1.4 Disabled buttons

Disabled **contained** buttons were a solid mid-grey (`#858A8C`) with white text.
They now use the design system's `surfaceColorPrimaryDisabled` (`#edebe9`) with
`typographyColorDisabled` (`#9f9d9c`) text. That pairing is about 2.3:1 — WCAG
exempts disabled controls and it is what the design system specifies, but it is a
large visual change and reads much lighter than before.

Disabled **outlined** and **text** buttons changed too: their border and label move
from `#858A8C` to `surfaceColorBorderDefault` / `typographyColorDisabled`. This is
most visible wherever `shared/restricted` disables a button by role.

Separately, a real bug was fixed here rather than deferred: the variant branches in
`theme.tsx` were joined with `||` and the secondary branch was gated on colour but
*not* on variant, so `variant="outlined"` or `"text"` with `color="secondary"` picked
up the **contained**-secondary rules and skipped its own. A disabled
outlined-secondary button rendered as a filled grey block. The live path was
`ETNotification`, which renders
`<Button variant="outlined" color={action.color}>` from caller-supplied
`CustomAction.color: any`.

### 1.5 `StatusBadge` recoloured to match `ETChip`

`myUpdates/StatusBadge.tsx` used blue for "Active" while `shared/chip/ETChip.tsx`
used green for the same concept. `StatusBadge` now uses `ETChip`'s green/grey pair.

### 1.6 `ComingSoon.tsx` red block

`routes/ComingSoon.tsx` renders `<PaintBrushIcon sx={{ backgroundColor: ... }} />`
— a red block behind the icon that looks unintentional. Kept, as the error token,
pending confirmation. Marked with a `ponytail:` comment in the file.

---

## 2. Values the design system does not publish

These live in the `EPIC.track additions` section of `designTokens.ts`, prefixed
`track` so an upstream diff does not flag them as drift.

### 2.1 Status text colours

The design system publishes only a border and a surface per status. Its border
colours do not reach AA on their own tints at body sizes, and the app relies on
tinted text (green text on a green chip). EPIC.track's existing values were kept:

- `trackSupportTextColorSuccess` `#236430`
- `trackSupportTextColorWarning` `#674901`
- `trackSupportTextColorDanger` `#a31e22`

**Ask design for an official text-on-tint colour per status**, then delete these.

### 2.2 Other locals

- `trackIconsColorSuccessLight` `#70cd83`, `trackIconsColorDangerLight` `#e57074` —
  lighter status fills for in-progress icons and history timelines.
- `trackSurfaceColorWarningHover` `#fdd166` — hover fill for the gold surfaces
  (side nav, environment banner).
- `trackSurfaceColorRowSelected` `#d6ebff` — selected table row and the
  in-progress work-state pill.
- `trackTypographyFontSizeCaption` `0.8125rem` / `trackTypographyLineHeightCaption`
  — see 3.1.

---

## 3. Typography

### 3.1 `caption` has no design system size

`caption` renders at `0.8125rem` (13px). The design system's `label` is `0.75rem`.
The size was preserved to keep this change to line heights and weights, so it sits
outside the token scale with a 1.5× line height.

### 3.2 `ETCaption1` / `2` / `3` are misnamed

The rendered ladder is 13px → 14px → 12px, so "caption 2" is *larger* than
"caption 1". The sizes are unchanged and now come from tokens rather than mixed
`px`/`em` literals, but the names still lie. Renaming touches every call site and
is follow-up.

All three stay on the `caption` variant deliberately: MUI maps `caption` to a
`<span>` and `body2` to a `<p>`, so moving `ETCaption2` onto `body2` for its
`0.875rem` size would have silently turned an inline element into a block one.
`ETDescription` and `ETPreviewText` *did* move to `body2` — both were already
`body1`, which maps to `<p>` too, so the element is unchanged there.

### 3.3 `body { font-size: 1.25em }`

`styles/App.scss` sets the body base size to `1.25em` (20px) with
`letter-spacing: -0.32px`. MUI's `rem`-based scale keys off the 16px html root and
is unaffected, but this is the base size for all non-MUI text and every `em` value
in the app. Moving it to `1rem` per the design system has a blast radius outside
MUI and was left alone.

---

## 4. Domain palettes, deliberately untouched

The design system does not govern data-encoding colours.

| Where | What |
|---|---|
| `components/calendar/constants.ts` | `WORK_LEGEND_COLOURS` (59 hex values, inconsistent casing) and `LEGEND_COLOURS` (3) |
| `components/calendar/Legends/utils.ts` | hand-rolled `darkenHex()` shade function |
| `components/insights/utils.ts` | `COLORS` (10) and `BAR_COLOR` |
| `components/shared/richTextEditor/index.tsx` | `COLOR_OPTIONS` (10 author-facing text colours) plus two `#000000` defaults |
| API | `phase.color` — work and phase bar colours arrive from the server |
| `src/assets/images/*.svg` | logo artwork |
| `**/__test__/*.cy.tsx` | fixtures |

Two items inside these are worth fixing on their own:

- **`getChartColor()` returns a random colour past index 9.**
  `insights/utils.ts` falls back to
  `"#" + Math.floor(Math.random() * 16777215).toString(16)`, so a chart with more
  than 10 series gets a different colour on every render, and the expression can
  emit a 5-digit (invalid) hex. Needs a real extended palette.
- **`WORK_LEGEND_COLOURS` casing** is mixed (`#F5CACB` next to `#d29f9c`), which
  defeats any de-duplication by value.

`components/insights/utils.ts` also passes `backgroundColor: "white"` to
`htmlToImage.toPng` — an image-encoder option, not CSS, so it was left as-is.

---

## 5. Shadows are not tokenised

Ten `rgba(0, 0, 0, …)` box-shadows remain:

`gantt/Chart.tsx` (×2), `gantt/TaskList.tsx` (×2), `gantt/TimeScale.tsx`,
`layout/Header/EnvironmentBanner.tsx` (×2), `shared/userMenu/UserMenu.tsx`,
`myWorkplans/Card/Staff/RenderSurplus.tsx`,
`reports/eaReferral/AnticipatedEAOSchedule.tsx`.

Only `surfaceShadowSmall` was transcribed, and these shadows are
geometry-specific: the gantt uses one-sided shadows (`3px 0px 3px -3px`) to
separate its frozen column, and the popovers use a much larger spread
(`0px 12px 24px`). Forcing them all onto one small token would be a visual
regression. **Transcribe the upstream medium and large shadow tokens, then map
these.**

---

## 6. Chart axis labels

`WorkByNation` had `YAxis width={100}` while nation names run to 52 characters.
Recharts wraps tick labels to the axis width, so those wrapped to four or five
lines inside a 30px row and collided. Fixed with a single-line truncating tick
(`NationTick`) at `width={180}`, with the full name in an SVG `<title>`.

The sibling charts share the fragility and were left alone because they are not
currently misrendering: `WorkByStaff` and `WorkByLead` use `width={45}` for person
names, `MedianPhaseOverage` uses `width={120}`. If those start wrapping,
`NationTick` is the pattern to lift.

`MAX_TICK_CHARS` in that component is a character estimate
(`0.55 × font-size` average advance), not real text measurement. Precise
measurement needs canvas metrics per label.

---

## 7. Accessibility follow-ups

### 7.1 `NavOpenButton` is not a button

`layout/SideNav/NavOpenButton.tsx` is a clickable `styled(Box)` — no `button`
element, no `role`, no keyboard focus. It needs a semantics fix, not a styling one,
so the focus ring added everywhere else cannot reach it.

### 7.2 `ETFormLabel` and `htmlFor`

`ETFormLabel` previously forwarded only `required` and `children`, dropping
`htmlFor`, so labels were not programmatically associated with their inputs. It now
forwards everything, but **no call site passes `htmlFor` yet** — threading it
through is follow-up.

### 7.3 `MuiFormLabel.defaultProps.focused = false`

Set globally in `theme.tsx`, which suppresses the focus-linked label colour. Left
in place as deliberate, but worth revisiting alongside the new focus ring.

---

## 8. Correctness issues found but not fixed

- **`ControlledCheckbox` default value** is
  `defaultValues?.[name] || ""` — an empty string as a boolean default.
- **`ControlledRadioGroup`** keeps its own `selectedVal` state alongside
  react-hook-form and compares with `Number(selectedVal)`, so string-valued
  options never highlight. Its `FormControlLabel`s also have no `key`.
- **`ETGridTitle`** ignores its `color` and `sx` props (`sx` is replaced by a fresh
  object). The disabled branch was fixed to keep its tooltip and ellipsis, but the
  dead props remain.
- **`HeaderProps`** in `shared/index.tsx` declares both `sx?: any` and a
  `[prop: string]: unknown` index signature, which defeats prop type checking on
  every `ET*` wrapper. `ETHeading4` and `ETParagraph` read their tooltip title from
  an undeclared `rest.tooltip` prop only reachable through that signature.
- **`gantt/gantt.scss`** is imported nowhere and contains
  `border-bottom: 2px solid red`. Dead file, safe to delete.
- **`StatusCardBody` and `IssueCard`** use the same fixed-height column `Grid`
  pattern that broke the workplan card, but with `overflowY: "auto"`. Neither is
  currently misrendering; worth a look if My Updates shows anything odd.

---

## 9. Tooling gaps

- **`npm test` is a no-op.** Vitest runs with `--passWithNoTests` and there are no
  `*.test.*` / `*.spec.*` files. The real suite is `npm run cypress`
  (173 specs, 518 tests).
- **`npm run cypress` hardcodes `--browser chrome`,** which fails on a machine that
  only has Chromium (`Can't run because you've entered an invalid browser name`).
- **There is no typecheck script, and `tsc` cannot parse the project's own
  tsconfig.** TypeScript is pinned to 4.9.5 via `overrides`, but `tsconfig.json`
  sets `"moduleResolution": "bundler"`, which 4.9 does not support:
  `error TS6046: Argument for '--moduleResolution' option must be: 'node',
  'classic', 'node16', 'nodenext'`. Typechecking this alignment required a
  TypeScript 5.x binary. Either unpin TypeScript or change `moduleResolution`, then
  add a `typecheck` script. On TypeScript 5.6 the tree has **106 pre-existing
  errors** (moment typings, react-select prop types, cypress testing-library
  types, insights context fixtures) — unrelated to styling, but they mean the gate
  cannot simply be switched on.
- **`npm run lint` only runs Prettier.** `eslint.config.js` exists but uses the
  legacy `module.exports = { overrides: [...] }` shape under the ESLint 9 flat
  config filename on ESLint 8.57, is referenced by no script or CI step, and its
  `quotes: ["error", "single"]` rule contradicts the Prettier double quotes used
  throughout.
- **CI runs neither typecheck nor tests.** `.github/workflows/web.ci.yml` runs
  `npm run lint` and `npm run build` only.

---

## 10. Grep guards

These should stay at their stated values.

```bash
cd epictrack-web/src

# No U+00B7 MIDDLE DOT in font stacks (the bug that made the theme font invalid).
rg -lP '\x{00B7}' .                      # expect: no matches

# Hex literals outside the token files, domain palettes and tests.
rg -o --no-filename '#[0-9a-fA-F]{3,8}\b' -g '!*.svg' . | wc -l   # 141, was 206

# The ET* wrappers must not restate the font family; the theme carries it.
rg -c 'fontFamily' components/shared/index.tsx                    # expect: no matches

# The dead CSS variable is gone.
rg -c 'var\(--neutral-background-dark' .                          # expect: no matches

# MUI's default error red and recharts' default bar purple no longer leak in.
rg -c 'd32f2f' .                                                  # expect: no matches
rg -c '8884d8' .                                                  # expect: no matches
```

All 141 surviving hex literals are accounted for, and none are in application
styling code:

| Count | Where | Why |
|---|---|---|
| 62 | `components/calendar/constants.ts` | work/phase legend palette |
| 35 | `styles/designTokens.ts` | the token definitions themselves |
| 12 | `shared/richTextEditor/index.tsx` | author-facing colour picker |
| 11 | `components/insights/utils.ts` | chart palette |
| 4 | `styles/_tokens.scss` | SCSS token twin |
| 17 | `**/__test__/*.cy.*` | test fixtures |

---

## 11. Manual verification still outstanding

The acceptance criterion "tested at supported screen sizes" has not been met. The
app needs Keycloak and the API to render past the login gate, so this needs a human
pass at `xs`/`sm`/`md`/`lg` on:

- a workplan list — row hover, selected row, keyboard focus ring
- a form with a triggered validation error — text field, select, multi-select,
  checkbox, date picker
- a `TrackDialog`, and tab-through of the side nav and a button row
- an `ETChip` row next to a `StatusBadge`
- a notification / `WarningBox`, and one of the three report screens with a raw
  MUI `<Alert>`
- the calendar, an insights chart page, and the rich text editor

Given 1.3, fixed-height layouts deserve the closest look.
