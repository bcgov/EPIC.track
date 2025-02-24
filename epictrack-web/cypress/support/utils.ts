import { Method } from 'cypress/types/net-stubbing';

export interface Endpoint {
  name: string;
  method: Method;
  url: string;
  response?: object;
}

export function setupIntercepts(endpoints: Endpoint[]) {
  endpoints.forEach(({ name, method, url, response}) => {
    // Add CORS headers specifically for OPTIONS requests
    if (method === "OPTIONS") {
      cy.intercept(method, url, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // Allow all domains
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Specify allowed methods
            "Access-Control-Allow-Headers": "Content-Type, Authorization", // Specify allowed headers
          },
          body: null,
        }).as(name);
    } else {
      // Regular API response handling
      cy.intercept(method, url, response ?? {}).as(name);
    }
  });
}
