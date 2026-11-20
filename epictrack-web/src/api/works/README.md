# api/works

The only frontend code that knows where work data comes from. Components call
`worksApi` and get the frontend types in `models/work.ts`; they never see a
wire format.

Today every operation is served by the Track API (`sources/track.ts`). Works
are moving to DEMI, and the browser will call DEMI directly. The layout and the
switch follow `api/projects` (see its README).

## Layout

| File                              | Purpose                                                    |
| --------------------------------- | ---------------------------------------------------------- |
| `sources/types.ts`                | `WorksSource`: every operation the screens need            |
| `sources/track.ts`                | Track implementation: Track DTOs, mappers, write whitelist |
| `worksApi.ts`                     | Picks the source; the object components call               |
| `__test__/worksSourceContract.ts` | Behaviour every source must pass                           |

A work's project details come from `useProjectSummary(work.project_id)` in
`api/projects`; a work only carries `project: {id, name}`.

## What is not here

Calls under `/works` that aren't part of the work record stay on the Track
client:

- phases, the work plan download and overage responsibilities, in
  `api/workPhases`
- the My Workplans dashboard (`works/dashboard`), which joins phase, status and
  staff data, in `api/workplans`
- events, tasks and templates
- the work team (`works/:id/staff-roles`) and works by staff
  (`works/by-staff/:id`), which reads the team
- first nations, resources and notes

The last three are still in `services/workService` and its siblings. Phases and
events may later be stored in DEMI too; their READMEs say how.

## Switching to DEMI

1. Set `VITE_DEMI_API_URL` (Helm value `app.demiApiUrl`).
2. Add `sources/demi.ts` implementing `WorksSource` on `demiClient`, with DEMI
   DTOs mapped to the same frontend types.
3. Run the contract suite against it:
   `describeWorksSource("DEMI", demiWorksSource, stubDemiWire)`.
4. Select it in `worksApi.ts`, one operation at a time if needed:
   `{ ...trackWorksSource, list: demiWorksSource.list }`.

### Who owns each field `Work` carries

`get` returns a full `Work`, and the work plan screens read fields DEMI may never
hold. A DEMI `get` must fetch those from Track and merge them, or DEMI must
carry them.

| Owner                                                                       | Fields                                                                                                                                                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| In today's DEMI push (`epictrack-api/tests/fixtures/demi_record_work.json`) | id, project_id, work_type, simple_title, ea_act, start_date, is_active, work_state, work_decision_date, anticipated_decision_date                                                                                  |
| Work fields not yet pushed                                                  | title, report_description, epic_description, ministry, federal_involvement, substitution_act, eao_team, responsible_epd, work_lead, decision_by, eac_decision_by, is_cac_recommended, is_high_priority, created_at |
| Track: phases and events                                                    | current_work_phase, is_completed, decision_date, anticipated_referral_date, start_date_locked                                                                                                                      |
| Track: notes                                                                | issue_notes, status_notes, first_nation_notes                                                                                                                                                                      |

### What DEMI must provide

The browser access, CSP and stable-ID requirements in the projects README apply
here too, plus:

- **Data.** Every `WorksSource` operation: the full work, the list rows, the
  filter options, create and update, and the duplicate-title check.
- **List rows.** `WorkListItem` needs id, title, is_active, work_state,
  `project {id, name}`, and the names of the EA act, work type, EAO team and
  current phase.
- **Titles.** Track builds `title` from the project name, work type and
  `simple_title`, and never accepts it on a save. DEMI must do the same, or the
  DEMI source must build it.
