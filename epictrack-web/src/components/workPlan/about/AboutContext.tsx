import { createContext } from "react";
import React from "react";
import { useSearchParams } from "../../../hooks/SearchParams";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AboutContextProps {}

interface StatusContainerRouteParams extends URLSearchParams {
  work_id: string;
}

export const AboutContext = createContext<AboutContextProps>({});

export const AboutProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const query = useSearchParams<StatusContainerRouteParams>();
  const workId = React.useMemo(() => query.get("work_id"), [query]);

  return <AboutContext.Provider value={{}}>{children}</AboutContext.Provider>;
};
