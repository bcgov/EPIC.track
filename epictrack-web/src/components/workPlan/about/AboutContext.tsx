import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";
import { createContext } from "react";
import { WORKPLAN_TAB } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AboutContextProps {}

export const AboutContext = createContext<AboutContextProps>({});

export const AboutProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  useRouterLocationStateForHelpPage(() => WORKPLAN_TAB.ABOUT.label, []);
  return <AboutContext.Provider value={{}}>{children}</AboutContext.Provider>;
};
