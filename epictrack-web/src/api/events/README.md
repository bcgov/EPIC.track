# api/events

The only frontend code that knows the Track wire format for milestones (events)
and their templates. Screens call `eventsApi` and get the types in
`models/event.ts` and `models/eventConfiguration.ts`.

Events stay in Track after projects and works move to DEMI.

| File           | Purpose                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `dto.ts`       | Track response and request shapes                                                                  |
| `mapper.ts`    | DTO to frontend type, field by field; the 16-field write whitelist                                 |
| `eventsApi.ts` | Milestones, the milestone calendar, and the event form's configurations, outcomes and act sections |
| `rules.ts`     | Every decision that depends on an event's category, type, position or visibility                   |
| `ids.ts`       | The backend category and type IDs; only this module and specs import them                          |

Screens never compare IDs themselves: they call a rule such as `isExtension`,
`eventInputs` or `isPushRequired`. The calendar filters use frontend keys
(`"decision"`, `"task"`), which `mapper.ts` turns into the backend's
`event_types[]` params.

## When the event rewrite lands

Change `dto.ts` and `mapper.ts` to the new responses, and keep the frontend
types where you can. A field the screens no longer get shows up as a typecheck
error in its readers once it leaves the type.

If categories, types or template positions change, update `ids.ts` and
`rules.ts`. `__test__/rules.cy.ts` lists today's result for every rule, so it
shows which decisions the change moves.

Task events and the task calendar are still in `services/taskEventService`.
