export function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, body }) => {
    cy.intercept(method, url, {
      body: body,
      headers: {
        authorization: "Bearer your-mock-token",
      },
    });
  });
}
