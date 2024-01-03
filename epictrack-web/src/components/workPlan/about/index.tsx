import React from "react";
import AboutContainer from "./AboutContainer";
import { AboutProvider } from "./AboutContext";

const Status = () => {
  return (
    <AboutProvider>
      <AboutContainer />
    </AboutProvider>
  );
};

export default Status;
