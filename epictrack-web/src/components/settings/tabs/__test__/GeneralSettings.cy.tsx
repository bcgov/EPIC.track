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
import { store } from "store";
import { userDetails } from "services/userService/userSlice";
import { ROLES } from "constants/application-constant";

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
  const mountGeneralSettings = (withManageUsers = false) => {
    store.dispatch(
      userDetails({
        sub: "123",
        groups: [],
        preferred_username: "tester",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        staffId: 1,
        phone: "",
        position: "",
        roles: withManageUsers ? [ROLES.MANAGE_USERS] : [],
      }),
    );

    cy.mount(
      <SnackbarProvider maxSnack={3}>
        <Router>
          <GeneraSettings />
        </Router>
      </SnackbarProvider>,
    );
    cy.wait(["@getAllStalenessSettings"]);
  };

  beforeEach(() => {
    setupIntercepts(endpoints);
    mountGeneralSettings();
  });

  it("should display the general settings", () => {
    cy.get("table")
      .contains(
        "tr",
        StalenessSettingTypeNames[StalenessSettingTypeEnum.ISSUES],
      )
      .should("be.visible");
    cy.get("table")
      .contains(
        "tr",
        StalenessSettingTypeNames[StalenessSettingTypeEnum.STATUS],
      )
      .should("be.visible");
  });

  it("shows guidance copy and sorts rows by configured order", () => {
    cy.contains("Set Up Your Status Warning Thresholds").should("exist");
    cy.contains("Green \u2192 Yellow (Warning)").should("exist");
    cy.contains("Yellow \u2192 Red (Stale)").should("exist");

    cy.get("tbody tr")
      .first()
      .should(
        "contain.text",
        StalenessSettingTypeNames[StalenessSettingTypeEnum.ISSUES],
      );
    cy.get("tbody tr")
      .eq(1)
      .should(
        "contain.text",
        StalenessSettingTypeNames[StalenessSettingTypeEnum.STATUS],
      );
  });

  it("disables edit action when user lacks manage-users permission", () => {
    cy.get("tbody tr").first().find("button").first().should("be.disabled");
  });

  it("enables edit action when user has manage-users permission", () => {
    mountGeneralSettings(true);

    cy.get("tbody tr").first().find("button").first().should("not.be.disabled");
  });

  it("shows validation error when threshold values are below one", () => {
    mountGeneralSettings(true);

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("button").first().click({ force: true });
      });

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get('input[type="number"]').eq(0).clear({ force: true }).type("0", {
          force: true,
        });
        cy.get('input[type="number"]').eq(1).clear({ force: true }).type("2", {
          force: true,
        });
        cy.get("button").last().click({ force: true });
      });

    cy.contains("Thresholds must be greater than 0.").should("exist");
    cy.get("@updateIssueStaleness.all").should("have.length", 0);
    cy.get("@updateStatusStaleness.all").should("have.length", 0);
  });

  it("shows validation error when stale threshold is not greater than warning", () => {
    mountGeneralSettings(true);

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("button").first().click({ force: true });
      });

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get('input[type="number"]').eq(0).clear({ force: true }).type("3", {
          force: true,
        });
        cy.get('input[type="number"]').eq(1).clear({ force: true }).type("3", {
          force: true,
        });
        cy.get("button").last().click({ force: true });
      });

    cy.contains(
      "Staleness threshold must be greater than warning threshold.",
    ).should("exist");
    cy.get("@updateIssueStaleness.all").should("have.length", 0);
  });

  it("saves issue thresholds through the issues endpoint", () => {
    mountGeneralSettings(true);

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("button").first().click({ force: true });
      });

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get('input[type="number"]').eq(0).clear({ force: true }).type("2", {
          force: true,
        });
        cy.get('input[type="number"]').eq(1).clear({ force: true }).type("5", {
          force: true,
        });
        cy.get("button").last().click({ force: true });
      });

    cy.wait("@updateIssueStaleness");
    cy.contains("Updated Issue thresholds.").should("exist");
  });

  it("saves status thresholds through the status endpoint", () => {
    mountGeneralSettings(true);

    cy.get("tbody tr")
      .eq(1)
      .within(() => {
        cy.get("button").first().click({ force: true });
      });

    cy.get("tbody tr")
      .eq(1)
      .within(() => {
        cy.get('input[type="number"]').eq(0).clear({ force: true }).type("4", {
          force: true,
        });
        cy.get('input[type="number"]').eq(1).clear({ force: true }).type("8", {
          force: true,
        });
        cy.get("button").last().click({ force: true });
      });

    cy.wait("@updateStatusStaleness");
    cy.contains("Updated Status thresholds.").should("exist");
  });
});
