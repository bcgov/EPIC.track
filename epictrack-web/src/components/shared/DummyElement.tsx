import { useEffect, useRef } from "react";
import { useOnScreen } from "../../hooks";

interface DummyElementProps {
  callbackFn: () => void;
}

const DummyElement = ({ callbackFn }: DummyElementProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  useEffect(() => {
    if (isVisible) {
      callbackFn();
    }
  }, [callbackFn, isVisible]);

  return <div style={{ width: "100%" }} ref={ref} />;
};

export default DummyElement;
