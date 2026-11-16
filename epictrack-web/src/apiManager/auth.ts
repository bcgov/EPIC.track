// userService registers its token here; importing it directly would be an import cycle.
export type TokenProvider = () => string | undefined;

let tokenProvider: TokenProvider = () => undefined;

export const setTokenProvider = (provider: TokenProvider) => {
  tokenProvider = provider;
};

export const getAccessToken: TokenProvider = () => tokenProvider();
