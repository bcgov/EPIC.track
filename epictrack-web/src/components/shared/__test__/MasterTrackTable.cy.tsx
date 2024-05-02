import React from "react";
import MasterTrackTable from "../MasterTrackTable";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { Box, Button } from "@mui/material";
import {
  mockStaffs,
  createMockMasterContext,
  generateMockProject,
  testTableFiltering,
} from "../../../../cypress/support/common";
import { setupIntercepts } from "../../../../cypress/support/utils";
import { defaultFirstNation } from "models/firstNation";
import { MasterContext } from "components/shared/MasterContext";
import { ETGridTitle } from "..";
import TableFilter from "../filterSelect/TableFilter";
import { MRT_ColumnDef } from "material-react-table";
import { FirstNation } from "models/firstNation";
import { MemoryRouter as Router } from "react-router-dom";
import { Project } from "models/project";
import { AppConfig } from "config";

// Mock reducer
declare global {
  interface Window {
    store: any; // replace 'any' with the type of your Redux store if you have one
  }
}

const endpoints = [
  {
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
  },
  {
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}pip-org-types`,
  },
  { method: "OPTIONS", url: `${AppConfig.apiUrl}first_nations` },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    response: { body: { data: mockStaffs } },
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}pip-org-types`,
    response: { body: [] },
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}first_nations`,
    response: { body: [] },
  },
];

const project1 = generateMockProject();
const project2 = generateMockProject();
const projects = [project1, project2];

describe("MasterTrackTable", () => {
  beforeEach(() => {
    if (window.Cypress) {
      // expose the store to the Cypress window object when running Cypress tests
      window.store = store;
    }
    const onEdit = cy.stub();
    const searchFilter = cy.stub();

    const columns: MRT_ColumnDef<Project>[] = [
      {
        accessorKey: "name",
        header: "Project Name",
        Cell: ({ cell, row, renderedCellValue }) => (
          <ETGridTitle
            to={"#"}
            onClick={() => onEdit(row.original.id)}
            enableTooltip={true}
            tooltip={cell.getValue<string>()}
          >
            {renderedCellValue}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
    ];

    setupIntercepts(endpoints);

    cy.mount(
      <Router>
        <MasterContext.Provider
          value={createMockMasterContext(projects, projects)}
        >
          <MasterTrackTable
            columns={columns}
            data={projects}
            initialState={{
              sorting: [
                {
                  id: "name",
                  desc: false,
                },
              ],
            }}
            state={{
              isLoading: false,
              showGlobalFilter: true,
            }}
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "right",
                }}
              >
                <Button>Render Top Toolbar</Button>
              </Box>
            )}
          />
        </MasterContext.Provider>
      </Router>
    );
  });

  it("renders correctly", () => {
    // Check if the "Create First Nation" button is present
    cy.get("button").contains("Render Top Toolbar").should("be.visible");
  });

  it("should display the project list", () => {
    // Select the table container
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("be.visible");
  });

  // Add more tests as needed
});
