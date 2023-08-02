import React from "react";
import PhaseAccordion from "./PhaseAccordion";

const PhaseContainer = ({ ...props }) => {
  return (
    <PhaseAccordion
      workId={props.workId}
      currentPhase={props.currentPhase}
    ></PhaseAccordion>
  );
};

export default PhaseContainer;
