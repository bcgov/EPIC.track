import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiError } from "apiManager/apiError";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { getErrorMessage } from "utils/axiosUtils";

const axiosErrorWith = (data: unknown) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    data,
    status: 400,
    statusText: "Bad Request",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  });

describe("getErrorMessage", () => {
  it("returns an ApiError's message", () => {
    const error = new ApiError({ client: "track", message: "Event is locked" });
    cy.wrap(getErrorMessage(error)).should("eq", "Event is locked");
  });

  [
    { body: { message: "Plain message" }, expected: "Plain message" },
    {
      body: { message: { message: "Nested message" } },
      expected: "Nested message",
    },
    { body: {}, expected: COMMON_ERROR_MESSAGE },
    { body: "Internal server error", expected: COMMON_ERROR_MESSAGE },
    { body: null, expected: COMMON_ERROR_MESSAGE },
  ].forEach(({ body, expected }) => {
    it(`reads ${JSON.stringify(body)} from an axios error body`, () => {
      cy.wrap(getErrorMessage(axiosErrorWith(body))).should("eq", expected);
    });
  });

  it("falls back for axios errors with no response and for other errors", () => {
    cy.wrap(getErrorMessage(new AxiosError("Network Error"))).should(
      "eq",
      COMMON_ERROR_MESSAGE,
    );
    cy.wrap(getErrorMessage(new Error("boom"))).should(
      "eq",
      COMMON_ERROR_MESSAGE,
    );
  });
});
