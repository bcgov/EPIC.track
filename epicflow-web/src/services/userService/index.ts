import { AppConfig } from '../../config';
import Keycloak from 'keycloak-js';
import { AnyAction, Dispatch } from 'redux';
import { userToken, userAuthentication } from './userSlice';
const KeycloakData: Keycloak = new Keycloak({
    clientId: AppConfig.keycloak.clientId,
    realm: AppConfig.keycloak.realm,
    url: AppConfig.keycloak.url
});

/**
* Initializes Keycloak instance.
*/
const initKeycloak = async (dispatch: Dispatch<AnyAction>) => {
    try {
        const authenticated = await KeycloakData.init({
            onLoad: 'login-required',
            pkceMethod: 'S256',
            checkLoginIframe: false,
        })
        if (!authenticated) {
            console.warn('not authenticated!');
            dispatch(userAuthentication(authenticated));
            return;
        }

        dispatch(userToken(KeycloakData.token));
        dispatch(userAuthentication(KeycloakData.authenticated ? true : false));
    } catch (err) {
        console.error(err);
        dispatch(userAuthentication(false));
    }
};
const getToken = () => KeycloakData.token || window.localStorage.getItem('authToken');
const doLogin = () => KeycloakData.login;
const UserService = {
    keycloakData: KeycloakData,
    initKeycloak,
    getToken,
    doLogin
};

export default UserService;


