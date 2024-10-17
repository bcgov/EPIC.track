import { useEffect, useRef } from "react";
import { useOnScreen } from "../../hooks";

interface TriggerOnViewedProps {
  callbackFn: () => void;
}

const TriggerOnViewed = ({ callbackFn }: TriggerOnViewedProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  useEffect(() => {
    if (isVisible) {
      callbackFn();
    }
  }, [callbackFn, isVisible]);

  return <div style={{ width: "100%" }} ref={ref} />;
};

export default TriggerOnViewed;
