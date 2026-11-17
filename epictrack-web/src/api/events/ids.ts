// Backend database IDs. Only api/events and specs import these; screens use rules.ts.

export enum EventCategory {
  MILESTONE = 1,
  EXTENSION = 2,
  SUSPENSION = 3,
  DECISION = 4,
  PCP = 5,
  CALENDAR = 6,
  FINANCE = 7,
  SPECIAL_EXTENSION = 8,
}

export enum EventType {
  OPEN_HOUSE = 23,
  VIRTUAL_OPEN_HOUSE = 24,
  TIME_LIMIT_SUSPENSION = 12,
  TIME_LIMIT_RESUMPTION = 38,
  SUBMISSION = 9,
}
