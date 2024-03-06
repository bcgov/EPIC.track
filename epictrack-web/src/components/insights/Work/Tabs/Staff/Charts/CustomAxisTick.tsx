import React, { useEffect, useRef, useState } from "react";

const CustomAxisTick = (props: {
  x?: any;
  y?: any;
  payload?: any;
  width: any;
}) => {
  const { x, y, payload, width } = props;
  const textRef = useRef<SVGTextElement | null>(null); // Add type assertion to textRef
  const [text, setText] = useState(payload.value);

  useEffect(() => {
    if (textRef.current) {
      const { width: textWidth } = textRef.current.getBBox() as DOMRect; // Add type assertion to getBBox()
      if (textWidth > width) {
        setText(payload.value.substring(0, payload.value.length - 3) + "...");
      }
    }
  }, [width, payload.value]);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        fontSize="12"
        ref={textRef}
      >
        {text}
      </text>
    </g>
  );
};

export default CustomAxisTick;
