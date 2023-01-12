export default class Config {
    static get CurrentConfiguration() {
        return {
            KEYCLOAK:{
                URL: process.env.KEYCLOAK_URL,
                REALAM: process.env.KEYCLOAK_REALM,
                CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
                USERNAME: process.env.KEYCLOAK_USERNAME,
                PASSWORD: process.env.KEYCLOAK_PASSWORD,
            },
            FORM_URL: process.env.FORM_URL,
            FORMSFLOW_API_URL: process.env.FORMSFLOW_API_URL,
            FORMSFLOW_WEB_URL: process.env.FORMSFLOW_WEB_URL,
            REPORTS_API_URL: process.env.REPORTS_API_URL
        }
    }
}