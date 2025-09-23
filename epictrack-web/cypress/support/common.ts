import { Staff } from "models/staff";
import { faker } from "@faker-js/faker";
import { Project } from "models/project";
import { Type } from "models/type";
import { CalendarEvent, EventPosition, EventsGridModel, EventTemplateVisibility } from "models/event";
import { EVENT_TYPE } from "components/workPlan/phase/type";
import dayjs from "dayjs";
import { EVENT_STATUS } from "models/taskEvent";
import { WorkplanContextProps } from "components/workPlan/WorkPlanContext";

export const mockStaffs: Staff[] = [
  {
    id: 1,
    full_name: "John Doe",
    first_name: "John",
    last_name: "", // Add the missing property
    phone: "(123) 456-7890",
    email: "email@example.com",
    is_active: true,
    position_id: 2 /* add more missing properties here */,
    position: { name: "IPE", id: 1, sort_order: 0 },
    idir_user_id: ""
  },
  {
    id: 2,
    full_name: "Test Doe",
    first_name: "", // Add the missing property
    last_name: "", // Add the missing property
    phone: "(111) 111-1111",
    email: "example@example.com",
    is_active: false,
    position_id: 2 /* add more missing properties here */,
    position: { name: "Position1", id: 2, sort_order: 1 },
    idir_user_id: ""
  },
  {
    id: 3,
    full_name: "Test Test",
    first_name: "", // Add the missing property
    last_name: "", // Add the missing property
    phone: "(999) 999-9999",
    email: "test.test@example.com",
    is_active: true,
    position_id: 1,
    position: { name: "IPE", id: 1, sort_order: 0 },
    idir_user_id: ""
  },
  // Add more mock Staff objects as needed
];

export const generateMockEvent = (overrides?: Partial<EventsGridModel>): EventsGridModel => {
  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();

  const start = faker.date.between(startOfMonth, endOfMonth);
  // Ensure end date is same or after start, max 5 days later
  const end = faker.date.between(start, dayjs(start).add(5, "day").toDate());

  return {
    id: faker.datatype.number(),
    name: faker.lorem.words(3),
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    event_configuration_id: faker.datatype.number(),
    event_configuration: { 
      id: faker.datatype.number(),
      name: faker.lorem.words(3),
      event_category_id: faker.datatype.number(),
      event_type_id: faker.datatype.number(),
      multiple_days: false,
      event_position: EventPosition.INTERMEDIATE,
      visibilty_mode: EventTemplateVisibility.MANDATORY,
      work_phase_id: faker.datatype.number(),
    },
    is_active: true,
    type: faker.helpers.arrayElement([EVENT_TYPE.TASK, EVENT_TYPE.MILESTONE]),
    is_complete: faker.datatype.boolean(),
    long_description: faker.lorem.paragraph(),
    number_of_days: faker.datatype.number({ min: 1, max: 5 }),
    outcome_id: faker.datatype.uuid(),
    short_description: faker.lorem.words(2),
    assignees: [],
    responsibility: faker.name.jobTitle(),
    notes: faker.lorem.sentence(),
    status: EVENT_STATUS.INPROGRESS,
    visibility: EventTemplateVisibility.MANDATORY,
    phase_name: faker.lorem.words(3),
    ...overrides,
  };
};

export const mockEventsGrid: CalendarEvent[] = [
  {
    event: generateMockEvent({
      type: EVENT_TYPE.TASK,
      phase_name: "Phase A",
    }),
    phase_name: "Phase A",
    phase_id: faker.datatype.number(),
    work_name: faker.commerce.productName(),
    work_id: faker.datatype.number(),
  },
  {
    event: generateMockEvent({
      type: EVENT_TYPE.MILESTONE,
      phase_name: "Phase B",
    }),
    phase_name: "Phase B",
    phase_id: faker.datatype.number(),
    work_name: faker.commerce.productName(),
    work_id: faker.datatype.number(),
  },
];

export const mockCalendarEvents =
[
  {
    "event": {
      "id": 1,
      "name": "Kickoff Meeting",
      "anticipated_date": "2025-09-15T09:00:00Z",
      "actual_date": "2025-09-15T10:00:00Z",
    },
    "phase_name": "Initiation",
    "phase_id": 11,
    "work_name": "Project Alpha",
    "work_id": 101
  },
  {
    "event": {
      "id": 2,
      "name": "Draft Report Due",
      "anticipated_date": "2025-09-20T00:00:00Z",
      "actual_date": "2025-09-20T23:59:59Z",
    },
    "phase_name": "Reporting",
    "phase_id": 12,
    "work_name": "Project Beta",
    "work_id": 102
  }
]


export function createMockMasterContext(defaultItem: any, _data?: any) {
  return {
    item: defaultItem,
    setFormId: cy.stub(),
    setTitle: cy.stub(),
    setId: cy.stub(),
    onSave: cy.stub(),
    title: "Data",
    data: [..._data],
    loading: false,
    setItem: cy.stub(),
    setShowDeleteDialog: cy.stub(),
    setShowModalForm: cy.stub(),
    getData: cy.stub(),
    setService: cy.stub(),
    setForm: cy.stub(),
    onDialogClose: cy.stub(),
    setFormStyle: cy.stub(),
    getById: cy.stub(),
    setDialogProps: cy.stub(),
  };
}

export function testTableFiltering(
  tableHeaderName: string,
  propertyToTest: string
) {
  cy.contains("div", tableHeaderName)
    .closest(".MuiTableCell-root")
    .then(($tableCell) => {
      // Within the table cell, find the div that includes 'the property to test' in its class name
      cy.wrap($tableCell)
        .find("input:first")
        .click({ force: true })
        .type(`${propertyToTest}{enter}`, { force: true }); // Type into the input field and press Enter
    });
}

export const generateMockProject = (() => {
  let projectCounter = 0;
  return (): Project => {
    projectCounter += 1;
    return {
      id: faker.datatype.number() + projectCounter,
      name: `${faker.commerce.productName()} ${projectCounter}`,
      sub_type: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.commerce.productMaterial()} ${projectCounter}`,
        type: { sort_order: faker.datatype.number() } as Type,
      },
      type: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.commerce.product()} ${projectCounter}`,
        sort_order: faker.datatype.number(),
      },
      is_active: faker.datatype.boolean(),
      description: `${faker.lorem.paragraph()} ${projectCounter}`,
      region_id_env: faker.datatype.number() + projectCounter,
      region_id_flnro: faker.datatype.number() + projectCounter,
      proponent_id: faker.datatype.number() + projectCounter,
      proponent: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.company.name()} ${projectCounter}`,
        is_active: false,
      },
      ea_certificate: `${faker.system.fileName()} ${projectCounter}`,
      abbreviation: `${faker.lorem.word()} ${projectCounter}`,
      epic_guid: `${faker.datatype.uuid()} ${projectCounter}`,
      latitude: `${faker.address.latitude().toString()} ${projectCounter}`,
      longitude: `${faker.address.longitude().toString()} ${projectCounter}`,
      capital_investment: faker.datatype.number() + projectCounter,
      address: `${faker.address.streetAddress()} ${projectCounter}`,
      is_project_closed: faker.datatype.boolean(),
      region_env: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.address.state()} ${projectCounter}`,
        entity: "",
      },
      region_flnro: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.address.state()} ${projectCounter}`,
        entity: "",
      },
      fte_positions_construction: faker.datatype.number() + projectCounter,
      fte_positions_operation: faker.datatype.number() + projectCounter,
    };
  };
})();

export type CypressStubFunction =
  | Cypress.Agent<sinon.SinonStub>
  | (() => void)
  | undefined;

 
export const makeWorkplanContextStub = (
    overrides: Partial<WorkplanContextProps> = {}
  ): WorkplanContextProps => ({
    firstNations: [],
    getWorkById: cy.stub().resolves(),
    getWorkStatuses: cy.stub().resolves(),
    getWorkPhases: cy.stub().resolves(),
    issues: [],
    loadData: cy.stub().resolves(),
    loading: false,
    loadIssues: cy.stub().resolves(),
    isActiveTeamMember: true,
    issueStalenessSetting: undefined,
    selectedStaff: undefined,
    selectedWorkPhase: undefined,
    setFirstNations: cy.stub(),
    setIssues: cy.stub(),
    setSelectedStaff: cy.stub(),
    setSelectedWorkPhase: cy.stub(),
    setStatuses: cy.stub(),
    setTeam: cy.stub(),
    setWork: cy.stub(),
    setWorkPhases: cy.stub(),
    statuses: [],
    statusStalenessSetting: undefined,
    team: [],
    work: undefined,
    workPhases: [],
    ...overrides,
  });