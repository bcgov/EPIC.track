import React, { createContext } from "react";

interface IssuesContextProps {
  showIssuesForm: boolean;
  setShowIssuesForm: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IssuesContainerRouteParams extends URLSearchParams {
  work_id: string;
}
export const IssuesContext = createContext<IssuesContextProps>({
  showIssuesForm: false,
  setShowIssuesForm: () => ({}),
});

export const IssuesProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [showIssuesForm, setShowIssuesForm] = React.useState(false);

  return (
    <IssuesContext.Provider
      value={{
        showIssuesForm,
        setShowIssuesForm,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
};
