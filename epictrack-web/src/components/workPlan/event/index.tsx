import { EventProvider } from "./EventContext";
import EventList from "./EventList";

const Event = () => {
  return (
    <EventProvider>
      <EventList />
    </EventProvider>
  );
};

export default Event;
