import React from "react";
import helpPageMap from "./HelpPageMap.json";
import { HelpMenuItem } from "./HelpMenuItem";
import { useLocation } from "react-router-dom";

type HelpPageLink = {
  epicTrackPath: string;
  helpPage: string;
};

const SupportCenterMenuItem = () => {
  const location = useLocation();
  const handleClick = () => {
    const currentTab = (location.state?.tab || "")
      .replace(/\s/g, "")
      .toLowerCase(); // Get tab from location state, remove spaces, and make it lowercase
    const currentPath = currentTab
      ? `${location.pathname}#${currentTab}`
      : location.pathname; // Get pathname without query params
    const currentPathSegments = currentPath.split("/"); // Split current path

    console.log(currentPath);

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

        // Check for exact match
        if (link.epicTrackPath === currentPath) {
          return { link, matchCount: linkSegments.length }; // Exact match
        }

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

    console.log(closestMatch);

    const helpPageUrl =
      closestMatch.link.helpPage || helpPageMap.help.default.helpPage;

    window.open(helpPageUrl, "_blank");
  };

  return <HelpMenuItem onClick={handleClick}>Support Center</HelpMenuItem>;
};

export default SupportCenterMenuItem;
