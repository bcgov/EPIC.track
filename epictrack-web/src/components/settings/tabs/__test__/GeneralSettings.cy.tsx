import { MemoryRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { AppConfig } from "config";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";
import GeneraSettings from "../GeneralSettings";
import {
  StalenessSettings,
  StalenessSettingTypeEnum,
  StalenessSettingTypeNames,
} from "models/settings";

export const mockStatusStalenessSettings: StalenessSettings = {
  id: 1,
  staleness_type: StalenessSettingTypeEnum.STATUS,
  warning_length: 3,
  staleness_length: 4,
  sort_order: 2,
};

export const mockIssueStalenessSettings: StalenessSettings = {
  id: 2,
  staleness_type: StalenessSettingTypeEnum.ISSUES,
  warning_length: 1,
  staleness_length: 2,
  sort_order: 1,
};

export const mockStalenssSettings: StalenessSettings[] = [
  mockStatusStalenessSettings,
  mockIssueStalenessSettings,
];

const endpoints: Endpoint[] = [
  {
    name: "getAllStalenessSettingsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staleness-settings`,
  },
  {
    name: "getAllStalenessSettings",
    method: "GET",
    url: `${AppConfig.apiUrl}staleness-settings`,
    response: mockStalenssSettings,
  },
  {
    name: "updateIssueStaleness",
    method: "PUT",
    url: `${AppConfig.apiUrl}staleness-settings/ISSUES`,
  },
  {
    name: "updateStatusStaleness",
    method: "PUT",
    url: `${AppConfig.apiUrl}staleness-settings/STATUS`,
  },
];

describe("GeneralSettings", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <SnackbarProvider maxSnack={3}>
        <Router>
          <GeneraSettings />
        </Router>
      </SnackbarProvider>
    );
    cy.wait(["@getAllStalenessSettings"]);
  });

  it("should display the general settings", () => {
    cy.get("table")
      .contains(
        "tr",
        StalenessSettingTypeNames[StalenessSettingTypeEnum.ISSUES]
      )
      .should("be.visible");
    cy.get("table")
      .contains(
        "tr",
        StalenessSettingTypeNames[StalenessSettingTypeEnum.STATUS]
      )
      .should("be.visible");
  });
});
