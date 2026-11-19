# src/api

The only frontend code that knows the backend's wire formats. Screens import a
domain (`api/events`, `api/works`, ...) and get plain data in the frontend types
under `src/models`, or an `ApiError`.

## A domain folder

| File             | Purpose                                                      |
| ---------------- | ------------------------------------------------------------ |
| `dto.ts`         | Response and request shapes, as the backend sends them       |
| `mapper.ts`      | DTO to frontend type; write whitelists                       |
| `<domain>Api.ts` | The plain object screens call (plain so Cypress can stub it) |
| `rules.ts`       | Every decision that depends on a backend ID                  |
| `ids.ts`         | Backend database IDs; only `src/api` and specs import them   |
| `index.ts`       | What screens may use: the api object, rules and public types |

Projects and works are moving to DEMI, so their folders pick a source instead of
calling a client directly; see `projects/README.md` and `works/README.md`. Work
phases and events may follow, with Track still running their date rules; see
`workPhases/README.md` and `events/README.md`.

## What may import what

ESLint enforces these as errors (`eslint.config.js`):

- Outside `src/api`, import a domain through its index (`api/events`), never a
  file inside it. DTOs, mappers and `ids.ts` stay internal.
- Only `src/api`, `src/services` and `apiManager` use the HTTP client
  (`apiManager`, except `apiError`) or `constants/api-endpoint`.
- `src/api` and `src/models` never import from `components`.

Insights are exempt: they move to Centre and are deleted from Track then.

## Adding a domain

Add the folder with the files above, export the api object from `index.ts`,
and add a `__test__/trackApi.cy.ts` that checks the mapped results and the exact
requests (paths, params, bodies) against real response fixtures.
