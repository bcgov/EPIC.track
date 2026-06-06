import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import AuthGate from "routes/AuthGate";

const makeStore = (roles: string[]) => {
  const state = {
    user: {
      bearerToken: "",
      authentication: {
        authenticated: true,
        loading: false,
      },
      isAuthorized: true,
      userDetail: {
        sub: "",
        groups: [],
        preferred_username: "",
        firstName: "",
        lastName: "",
        email: "",
        staffId: 1,
        phone: "",
        position: "",
        roles,
      },
    },
    uiState: {},
    loadingState: {},
  };

  return configureStore({
    reducer: () => state,
    preloadedState: state,
  });
};

const UnauthorizedState = () => {
  const location = useLocation();

  return (
    <>
      <div>Unauthorized Page</div>
      <div>From: {(location.state as any)?.from?.pathname ?? "none"}</div>
    </>
  );
};

describe("AuthGate", () => {
  it("renders protected route when user has allowed role", () => {
    const store = makeStore(["edit"]);

    cy.mount(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<AuthGate allowed={["edit"]} />}>
            <Route path="/protected" element={<div>Protected Page</div>} />
          </Route>
          <Route path="/unauthorized" element={<UnauthorizedState />} />
        </Routes>
      </MemoryRouter>,
      { reduxStore: store },
    );

    cy.contains("Protected Page").should("exist");
    cy.contains("Unauthorized Page").should("not.exist");
  });

  it("redirects to unauthorized and preserves from location when role is missing", () => {
    const store = makeStore([]);

    cy.mount(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<AuthGate allowed={["edit"]} />}>
            <Route path="/protected" element={<div>Protected Page</div>} />
          </Route>
          <Route path="/unauthorized" element={<UnauthorizedState />} />
        </Routes>
      </MemoryRouter>,
      { reduxStore: store },
    );

    cy.contains("Unauthorized Page").should("exist");
    cy.contains("From: /protected").should("exist");
    cy.contains("Protected Page").should("not.exist");
  });
});
