import { createContext, useCallback } from "react";
import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";
import { WORKPLAN_TAB } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AboutContextProps {}

export const AboutContext = createContext<AboutContextProps>({});

export const AboutProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const aboutLabelCallback = useCallback(() => WORKPLAN_TAB.ABOUT.label, []);

  useRouterLocationStateForHelpPage(aboutLabelCallback);
  return <AboutContext.Provider value={{}}>{children}</AboutContext.Provider>;
};
