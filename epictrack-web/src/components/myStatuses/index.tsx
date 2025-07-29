import { MyStatusesProvider } from "./MyStatusContext";
import StatusContainer from "./MyStatusContainer";

const MyStatuses = () => {
  return (
    <MyStatusesProvider>
      <StatusContainer />
    </MyStatusesProvider>
  );
};

export default MyStatuses;
