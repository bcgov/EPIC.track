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

  return (
    <div data-cy="load-more-trigger" style={{ width: "100%" }} ref={ref} />
  );
};

export default TriggerOnViewed;
