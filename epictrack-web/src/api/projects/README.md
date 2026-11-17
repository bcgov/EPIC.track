# api/projects

The only frontend code that knows where project data comes from. Components call
`projectsApi` or `useProjectSummary` and get the frontend types in
`models/project.ts`; they never see a wire format.

Today every operation is served by the Track API (`sources/track.ts`). Projects
are moving to DEMI, and the browser will call DEMI directly.

## Layout

| File                                 | Purpose                                                      |
| ------------------------------------ | ------------------------------------------------------------ |
| `sources/types.ts`                   | `ProjectsSource`: every operation the screens need           |
| `sources/track.ts`                   | Track implementation: Track DTOs, mappers, write whitelist   |
| `projectsApi.ts`                     | Picks the source; the object components call                 |
| `queries.ts`                         | `useProjectSummary` (RTK Query cache) and `useUpdateProject` |
| `__test__/projectsSourceContract.ts` | Behaviour every source must pass                             |

## What is not here

Calls under `/projects` whose data Track owns stay on the Track client in
`services/projectService`, and will stay in Track after the move:

- `projects/:id/work-types`
- `projects/:id/first-nations` and `projects/:id/first-nation-available`
- `projects?with_works=true` (My Workplans name filter; moves to the works module)

Project special-field history (proponent and name history in the project form)
still goes through `services/specialFieldService`. Decide where it lives when
DEMI owns projects.

## Switching to DEMI

1. Set `VITE_DEMI_API_URL` (Helm value `app.demiApiUrl`). `demiClient` in
   `apiManager/clients.ts` then exists.
2. Add `sources/demi.ts` implementing `ProjectsSource` on `demiClient`, with
   DEMI DTOs mapped to the same frontend types.
3. Run the contract suite against it, with a `stubDemiWire` that fakes DEMI's
   API: `describeProjectsSource("DEMI", demiProjectsSource, stubDemiWire)`.
4. Select it in `projectsApi.ts`. To move one operation at a time:
   `{ ...trackProjectsSource, getSummary: demiProjectsSource.getSummary }`.

### What DEMI must provide

- **Browser access.** An endpoint that accepts the Keycloak token (realm
  `eao-epic`; roles under the `epictrack-web` client, or an added audience),
  with CORS for the Track web origin and the `Authorization` header. Track's
  backend uses APIM `/machine` with a subscription key, which can't go in a
  browser.
- **CSP.** `epictrack-web/nginx/nginx.conf` only allows
  `connect-src https://*.gov.bc.ca`. Add the DEMI host if it's outside that.
- **Stable IDs.** Works store `project_id`, today Track's project ID (also the
  ID Track pushes to DEMI). DEMI must keep it, or the DEMI source must map it.
- **Data.** Every `ProjectsSource` operation: summary and full project, list
  and dropdown options, create and update, the duplicate-name check,
  abbreviation suggestions, project types, and the form lookups (types,
  sub-types, proponents, ENV and NRS regions).
- **Summary fields.** `ProjectSummary` needs id, name, description,
  abbreviation, address, created_at, and the names of type, sub-type,
  proponent, ENV region and NRS region.

A starting point for the DEMI DTO is the record Track already pushes to DEMI:
`epictrack-api/tests/fixtures/demi_record_project.json`. It has no regions,
which `ProjectSummary` needs.

The Track backend also needs `{id, name}` for every project (work titles, work
lists, reports), so it will keep a local copy of DEMI projects. That is backend
work, separate from this module.
