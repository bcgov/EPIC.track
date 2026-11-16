import AxiosErrorHandler from "components/axiosErrorHandler/AxiosErrorHandler";
import { AppConfig } from "config";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { ApiError, isApiError } from "../apiError";
import { setTokenProvider } from "../auth";
import { buildApiClients } from "../clients";
import http from "../http-request-handler";

const apis = {
  track: { baseUrl: "/track-test/" },
  demi: { baseUrl: "/demi-test/" },
};

// Yields the rejection error; fails if the request succeeds.
const rejection = (request: Promise<unknown>) =>
  request.then(
    () => {
      throw new Error("expected the request to fail");
    },
    (error) => error as ApiError,
  );

describe("API clients", () => {
  afterEach(() => setTokenProvider(() => undefined));

  it("creates a DEMI client only when its URL is set", () => {
    const withoutDemi = buildApiClients({ ...apis, demi: { baseUrl: "" } });
    expect(withoutDemi.demi).to.equal(undefined);
    expect(withoutDemi.all).to.have.length(1);

    const withDemi = buildApiClients(apis);
    expect(withDemi.demi?.name).to.equal("demi");
    expect(withDemi.all).to.have.length(2);
    // A shared instance would get AxiosErrorHandler's interceptors twice.
    expect(withDemi.demi?.raw).not.to.equal(withDemi.track.raw);
  });

  it("sends requests to the client's base URL with the bearer token", () => {
    setTokenProvider(() => "test-token");
    const { demi } = buildApiClients(apis);
    cy.intercept("GET", "**/demi-test/projects/1", {
      body: { id: 1, name: "Mine" },
    }).as("demi");

    cy.then(() => demi!.get("projects/1")).should("deep.equal", {
      id: 1,
      name: "Mine",
    });
    cy.wait("@demi")
      .its("request.headers.authorization")
      .should("equal", "Bearer test-token");
  });

  it("sends no Authorization header without a token", () => {
    const { track } = buildApiClients(apis);
    cy.intercept("GET", "**/track-test/anonymous", { body: {} }).as("anon");

    cy.then(() => track.get("anonymous"));
    cy.wait("@anon")
      .its("request.headers")
      .should("not.have.property", "authorization");
  });

  it("keeps the legacy helpers authenticated", () => {
    setTokenProvider(() => "legacy-token");
    cy.intercept("GET", `${AppConfig.apiUrl}legacy-check`, { body: [] }).as(
      "legacy",
    );

    cy.then(() => http.GetRequest("legacy-check"))
      .its("status")
      .should("eq", 200);
    cy.wait("@legacy")
      .its("request.headers.authorization")
      .should("equal", "Bearer legacy-token");
  });

  const errorCases = [
    {
      status: 422,
      body: { message: "Event is locked", code: "UnprocessableEventError" },
      message: "Event is locked",
      code: "UnprocessableEventError",
    },
    {
      status: 400,
      body: { message: { message: "Nested message", code: "NestedCode" } },
      message: "Nested message",
      code: "NestedCode",
    },
    {
      status: 500,
      body: "Internal server error",
      message: COMMON_ERROR_MESSAGE,
      code: undefined,
    },
    { status: 404, body: {}, message: COMMON_ERROR_MESSAGE, code: undefined },
  ];

  errorCases.forEach(({ status, body, message, code }) => {
    it(`rejects a ${status} response with an ApiError`, () => {
      const { track } = buildApiClients(apis);
      cy.intercept("GET", "**/track-test/fails", { statusCode: status, body });

      cy.then(() => rejection(track.get("fails"))).then((error) => {
        expect(isApiError(error)).to.equal(true);
        expect(error.client).to.equal("track");
        expect(error.status).to.equal(status);
        expect(error.code).to.equal(code);
        expect(error.message).to.equal(message);
        expect(error.isNetwork).to.equal(false);
      });
    });
  });

  it("rejects a network failure even though AxiosErrorHandler resolves it", () => {
    const { track } = buildApiClients(apis);
    cy.mount(
      <AxiosErrorHandler clients={[track]}>
        <div>child</div>
      </AxiosErrorHandler>,
    );
    cy.intercept("GET", "**/track-test/offline", { forceNetworkError: true });

    cy.then(() => rejection(track.get("offline"))).then((error) => {
      expect(isApiError(error)).to.equal(true);
      expect(error.isNetwork).to.equal(true);
      expect(error.status).to.equal(undefined);
      expect(error.message).to.equal(COMMON_ERROR_MESSAGE);
    });
  });

  it("shows the rate-limit notice for a 429 from the DEMI client", () => {
    const { track, demi } = buildApiClients(apis);
    cy.mount(
      <AxiosErrorHandler clients={[track, demi!]}>
        <div>child</div>
      </AxiosErrorHandler>,
    );
    cy.intercept("GET", "**/demi-test/busy", {
      statusCode: 429,
      headers: { "retry-after": "7" },
      body: {},
    });

    cy.then(() => rejection(demi!.get("busy")))
      .its("status")
      .should("eq", 429);
    cy.contains("Too many requests. Please try again in 7 seconds.");
  });
});
