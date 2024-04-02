import React from "react";
import helpPageMap from "./HelpPageMap.json";
import { HelpMenuItem } from "./HelpMenuItem";

type HelpPageLink = {
  epicTrackPath: string;
  helpPage: string;
};

const SupportCenterMenuItem = () => {
  const handleClick = () => {
    const currentPath = window.location.pathname.split("?")[0]; // Get pathname without query params
    const currentPathSegments = currentPath.split("/"); // Split current path

    // Find the most resembling epicTrackPath and its corresponding helpPage
    const closestMatch = helpPageMap.help.links.reduce(
      (
        bestMatch: {
          link: HelpPageLink;
          matchCount: number;
        },
        link: HelpPageLink
      ) => {
        const linkSegments = link.epicTrackPath.split("/");

        // Check if the number of segments match (excluding potential trailing slash)
        if (linkSegments.length !== currentPathSegments.length) {
          return bestMatch;
        }

        // Compare segments considering path variables
        let matchCount = 0;
        for (let i = 0; i < linkSegments.length; i++) {
          const linkSegment = linkSegments[i];
          const currentSegment = currentPathSegments[i];

          if (
            linkSegment === currentSegment ||
            (linkSegment.startsWith("{") && linkSegment.endsWith("}"))
          ) {
            matchCount++;
          } else {
            break; // Mismatch, stop further comparison
          }
        }

        // Update best match if current link has more matching segments
        return matchCount > bestMatch.matchCount
          ? { link, matchCount }
          : bestMatch;
      },
      { link: { epicTrackPath: "", helpPage: "" }, matchCount: 0 } // Initial bestMatch
    );

    const helpPageUrl =
      closestMatch.link.helpPage || helpPageMap.help.default.helpPage;

    window.open(helpPageUrl, "_blank");
  };

  return <HelpMenuItem onClick={handleClick}>Support Center</HelpMenuItem>;
};

export default SupportCenterMenuItem;
