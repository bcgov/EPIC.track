import StatusContainer from "./StatusContainer";
import { StatusProvider } from "./StatusContext";

const Status = () => {
  return (
    <StatusProvider>
      <StatusContainer />
    </StatusProvider>
  );
};

export default Status;
