import { createContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MyWorkplanContextProps {}

export const MyWorkplansContext = createContext<MyWorkplanContextProps>({});

export const MyWorkplansProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <MyWorkplansContext.Provider value={{}}>
      {children}
    </MyWorkplansContext.Provider>
  );
};
