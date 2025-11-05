import { faker } from "@faker-js/faker";

type WorkIssue = {
  expected_resolution_date: string;
  id: number;
  is_active: boolean;
  is_high_priority: boolean;
  is_resolved: boolean;
  latest_update: {
    approved_by: string;
    description: string;
    id: number;
    is_active: boolean;
    is_approved: boolean;
    posted_date: string;
    work_issue_id: number;
  };
  start_date: string;
  title: string;
  work_id: number;
};

type WorkItem = {
  actual_date: string | null;
  anticipated_date_label: string | null;
  anticipated_decision_date: string;
  decision_information: string | null;
  event_configuration_id: number;
  event_date: string;
  event_description: string | null;
  event_id: number;
  event_title: string;
  event_type: string;
  event_type_id: number;
  milestone_id: number;
  oldest_update: string | null;
  pecp_explanation: string | null;
  project_id: number;
  project_name: string;
  sl_no: number;
  status_date_updated: string | null;
  status_staleness: "LOW" | "MODERATE" | "CRITICAL";
  work_id: number;
  work_issues: WorkIssue[];
  work_report_title: string;
  work_short_description: string;
  work_status_text: string | null;
};

type Group = {
  group: string | number;
  items: WorkItem[];
};

type ReportData = {
  data: {
    "30": Group[];
    "60": Group[];
    "90": Group[];
  };
};

type ReportDataAS = {
  data: Group[];
};

function randomStatusStaleness(): "LOW" | "MODERATE" | "CRITICAL" {
  const options = ["LOW", "MODERATE", "CRITICAL"] as const;
  return faker.helpers.arrayElement(options);
}

function randomEventType() {
  const types = [
    { event_type: "decision_referral", event_type_id: 14 },
    { event_type: "review_meeting", event_type_id: 20 },
    { event_type: "final_assessment", event_type_id: 30 },
  ];
  return faker.helpers.arrayElement(types);
}

function createWorkIssue(workId: number): WorkIssue {
  const startDate = faker.date.past({ years: 1 });
  const postedDate = faker.date.between({ from: startDate, to: new Date() });
  return {
    expected_resolution_date: faker.date.future().toISOString(),
    id: faker.number.int(1000),
    is_active: true,
    is_high_priority: faker.datatype.boolean(),
    is_resolved: faker.datatype.boolean(),
    latest_update: {
      approved_by: `${faker.string.alphanumeric(5)}@example.com`,
      description: faker.lorem.paragraph(),
      id: faker.number.int(1000),
      is_active: true,
      is_approved: true,
      posted_date: postedDate.toISOString(),
      work_issue_id: faker.number.int(1000),
    },
    start_date: startDate.toISOString(),
    title: faker.lorem.words(3),
    work_id: workId,
  };
}

function createItem(workId: number, slNo: number): WorkItem {
  const eventType = randomEventType();
  const eventDate = faker.date.future();
  const statusDateUpdated = faker.date.between({
    from: new Date(),
    to: eventDate,
  });
  const numIssues = faker.number.int({ min: 0, max: 2 });
  const workIssues = Array.from({ length: numIssues }, () =>
    createWorkIssue(workId),
  );

  return {
    actual_date: faker.datatype.boolean()
      ? faker.date.past().toISOString()
      : null,
    anticipated_decision_date: eventDate.toISOString(),
    anticipated_date_label: faker.datatype.boolean()
      ? "Referral Date"
      : "Decision Date",
    decision_information: faker.datatype.boolean()
      ? faker.date.future().toISOString().slice(0, 10) + " Decision Info"
      : null,
    event_configuration_id: faker.number.int(50000),
    event_date: eventDate.toISOString(),
    event_description: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    event_id: faker.number.int(10000),
    event_title: faker.lorem.words(3),
    event_type: eventType.event_type,
    event_type_id: eventType.event_type_id,
    milestone_id: faker.number.int({ min: 1, max: 10 }),
    oldest_update: faker.datatype.boolean()
      ? faker.date.past().toISOString()
      : null,
    pecp_explanation: null,
    project_id: faker.number.int(500),
    project_name: faker.company.name(),
    sl_no: slNo,
    status_date_updated: statusDateUpdated.toISOString(),
    status_staleness: randomStatusStaleness(),
    work_id: workId,
    work_issues: workIssues,
    work_report_title: faker.lorem.words(4),
    work_short_description: faker.lorem.sentences(2),
    work_status_text: faker.datatype.boolean()
      ? faker.lorem.sentences(2)
      : null,
  };
}

function createGroup(groupId: number, numItems: number): Group {
  return {
    group: groupId,
    items: Array.from({ length: numItems }, (_, idx) =>
      createItem(groupId, idx + 1),
    ),
  };
}

export function generateMock306090ReportData(): ReportData {
  return {
    data: {
      "30": [
        createGroup(
          faker.number.int({ min: 100, max: 200 }),
          faker.number.int({ min: 1, max: 3 }),
        ),
      ],
      "60": [
        createGroup(
          faker.number.int({ min: 201, max: 300 }),
          faker.number.int({ min: 1, max: 3 }),
        ),
      ],
      "90": [
        createGroup(
          faker.number.int({ min: 301, max: 400 }),
          faker.number.int({ min: 1, max: 3 }),
        ),
      ],
    },
  };
}

function createASGroup(groupName: string, numItems: number): Group {
  const items = Array.from({ length: numItems }, (_, idx) =>
    createItem(idx + 1, idx + 1),
  );
  return { group: groupName, items };
}

export const AS_GROUP_HEADERS = [
  "EA Certificate Referrals",
  "EA Referrals & Decisions",
  "Proposed Projects",
];

export function generateMockASReportData(): ReportDataAS {
  return {
    data: AS_GROUP_HEADERS.map((groupName) =>
      createASGroup(groupName, faker.number.int({ min: 1, max: 4 })),
    ),
  };
}
