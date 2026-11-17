# api/tasks and api/taskTemplates

The only frontend code that knows the Track wire format for task events and
task templates. Screens call `tasksApi` and `taskTemplatesApi` and get the
types in `models/taskEvent.ts`, `models/task.ts` and `models/template.ts`.

Tasks and templates stay in Track after projects and works move to DEMI.

| File                              | Purpose                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tasks/dto.ts`, `tasks/mapper.ts` | Task event shapes, the mappers, and the 9-field write whitelist                                |
| `tasks/tasksApi.ts`               | A phase's tasks, one task, saves, bulk update and delete, My Tasks, the task calendar, imports |
| `taskTemplates/*`                 | Templates, their tasks, upload, activation and delete                                          |

## Things to keep when the rewrite lands

- The bulk delete's query (`task_ids`, `work_id`) is checked strictly by the
  backend: it rejects any other param.
- The task sheet import and the template upload post a plain object as
  multipart; axios builds the form data from it.
- The task form's selects hold ids as strings, so `TaskEvent.assignee_ids` and
  `responsibility_ids` are strings.
