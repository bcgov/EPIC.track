import UserService from "services/userService";

export const prepareHeaders = (headers: Headers) => {
  headers.set("authorization", `Bearer ${UserService.getToken()}`);
  return headers;
};
