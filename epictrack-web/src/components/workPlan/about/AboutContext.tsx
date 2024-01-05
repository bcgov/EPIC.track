import React from "react";
import { createContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AboutContextProps {}

export const AboutContext = createContext<AboutContextProps>({});

export const AboutProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  return <AboutContext.Provider value={{}}>{children}</AboutContext.Provider>;
};
