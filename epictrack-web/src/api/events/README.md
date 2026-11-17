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

## When the event rewrite lands

Change `dto.ts` and `mapper.ts` to the new responses, and keep the frontend
types where you can. A field the screens no longer get shows up as a typecheck
error in its readers once it leaves the type.

The rules that compare backend IDs (event categories and types) still live in
the components. They move here as `rules.ts` next.

Task events and the task calendar are still in `services/taskEventService`.
