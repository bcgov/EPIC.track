export function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, body }) => {
    const response: any = { body };

    cy.intercept(method, url, response);
  });
}
