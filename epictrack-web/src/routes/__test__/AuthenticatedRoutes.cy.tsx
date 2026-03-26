import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthenticatedRoutes from "routes/AuthenticatedRoutes";

const makeStore = (userState: any) => {
  const state = {
    user: {
      isAuthorized: true,
      authentication: {
        authenticated: true,
      },
      userDetail: {},
      ...userState,
    },
    uiState: {},
    loadingState: {},
  };

  return configureStore({
    reducer: () => state,
    preloadedState: state,
  });
};

describe("AuthenticatedRoutes", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("redirects authenticated but unauthorized users to /unauthorized", () => {
    const store = makeStore({
      isAuthorized: false,
      authentication: { authenticated: true },
    });

    cy.mount(
      <MemoryRouter initialEntries={["/any"]}>
        <Routes>
          <Route path="*" element={<AuthenticatedRoutes />} />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        </Routes>
      </MemoryRouter>,
      { reduxStore: store },
    );

    cy.contains("Unauthorized Page").should("exist");
  });

  it("redirects to session redirectUrl and clears it", () => {
    cy.window().then((win) => {
      cy.spy(win.sessionStorage, "removeItem").as("removeItem");
      win.sessionStorage.setItem("redirectUrl", "/redirect-target");
    });

    const store = makeStore({
      isAuthorized: true,
      authentication: { authenticated: true },
    });

    cy.mount(
      <MemoryRouter initialEntries={["/any"]}>
        <Routes>
          <Route path="*" element={<AuthenticatedRoutes />} />
          <Route path="/redirect-target" element={<div>Redirect Target</div>} />
        </Routes>
      </MemoryRouter>,
      { reduxStore: store },
    );

    cy.contains("Redirect Target").should("exist");
    cy.get("@removeItem").should("have.been.calledWith", "redirectUrl");
  });
});
