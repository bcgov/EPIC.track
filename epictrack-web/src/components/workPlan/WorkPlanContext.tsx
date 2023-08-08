import React, { Dispatch, SetStateAction, createContext } from "react";

interface WorkplanContextProps {
  selectedPhaseId?: number;
  setSelectedPhaseId: Dispatch<SetStateAction<number | undefined>>;
}

export const WorkplanContext = createContext<WorkplanContextProps>({
  selectedPhaseId: undefined,
  setSelectedPhaseId: () => ({}),
});

export const WorkplanProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [selectedPhaseId, setSelectedPhaseId] = React.useState<
    number | undefined
  >();
  return (
    <WorkplanContext.Provider
      value={{
        selectedPhaseId,
        setSelectedPhaseId,
      }}
    >
      {children}
    </WorkplanContext.Provider>
  );
};
