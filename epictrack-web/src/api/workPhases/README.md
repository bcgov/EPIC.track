# api/workPhases

The only frontend code that knows the Track wire format for work phases. Screens
call `workPhasesApi` and get the types in `models/work.ts` (`WorkPhase`,
`WorkPhaseAdditionalInfo`, `TemplateStatus`) and
`models/phaseOverageResponsibilities.ts`.

Track's backend runs the date rules for work phases. The phase records may
later be stored in DEMI: reads can then move behind a source seam, as in
`api/projects`, while changes keep going through Track's API.

| File               | Purpose                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `dto.ts`           | Track response and request shapes                                                                                          |
| `mapper.ts`        | DTO to frontend type, field by field                                                                                       |
| `workPhasesApi.ts` | The calls: phases of a work, phase details, template status, the work plan download, phase codes, overage responsibilities |

Whether a phase's overage needs a responsibility comes from the backend as
`WorkPhase.requires_overage_responsibility`; screens read that field.

## When the phase rewrite lands

Change `dto.ts` and `mapper.ts` to the new responses, and keep the frontend
types where you can. A field the screens no longer get shows up as a typecheck
error in its readers once it leaves the type.

The works mapper (`api/works/sources/track.ts`) maps `Work.current_work_phase`
with `toWorkPhase`, so it follows any change here.

Events are in `api/events`; tasks and templates move in their own modules.
