import { Link } from "@mui/material";
import React, { useState } from "react";

interface ReadMoreTextProps {
  children: string | null | undefined;
  maxLength?: number;
  defaultExpanded?: boolean;
}

const ReadMoreText: React.FC<ReadMoreTextProps> = ({
  children,
  maxLength = 100,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  if (!children) return null;

  const displayText = isExpanded ? children : children.slice(0, maxLength);

  return (
    <>
      {displayText}
      {!isExpanded && children.length > maxLength && (
        <Link onClick={toggleExpansion} sx={{ cursor: "pointer" }}>
          {" "}
          Read More
        </Link>
      )}
      {isExpanded && children.length > maxLength && (
        <Link onClick={toggleExpansion} sx={{ cursor: "pointer" }}>
          {" "}
          Read Less
        </Link>
      )}
    </>
  );
};

export default ReadMoreText;
