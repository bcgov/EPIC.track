import React from "react";
import helpPageMap from "./HelpPageMap.json";
import { HelpMenuItem } from "./HelpMenuItem";
import { useLocation } from "react-router-dom";

type HelpPageLink = {
  epicTrackPath: string;
  helpPage: string;
  tags?: string[];
};

const SupportCenterMenuItem = () => {
  const location = useLocation();

  const findLinksWithMatchingPaths = () => {
    const currentPath = location.pathname;
    const matchingLinks = helpPageMap.help.links.filter(
      (helpPageLink: HelpPageLink) => {
        if (helpPageLink.epicTrackPath === currentPath) {
          return true;
        }

        const helpPagePathSegments = helpPageLink.epicTrackPath.split("/");
        const currentPathSegments = currentPath.split("/");

        if (helpPagePathSegments.length !== currentPathSegments.length) {
          return false;
        }

        const currentPathWithoutPathVariables = currentPathSegments
          .map((segment, index) => {
            // Check if the segment is a path variable e.g. ~somePath/:id/
            if (segment.startsWith(":")) {
              return helpPagePathSegments[index];
            }
            return segment;
          })
          .join("/");

        return currentPathWithoutPathVariables === helpPageLink.epicTrackPath;
      }
    );
    return matchingLinks;
  };

  const findLinkWithTagsOrAny = (matchingLinks: HelpPageLink[]) => {
    const helpPageTags = location.state?.helpPageTags || [];
    console.log("helpPageTags", helpPageTags);
    console.log("matchingLinks", matchingLinks);
    if (helpPageTags.length === 0) {
      return matchingLinks[0];
    }

    return matchingLinks.find((link: HelpPageLink) => {
      return helpPageTags.every((tag: string) => {
        const formattedTag = tag.toLocaleLowerCase().replace(" ", "");
        return link.tags?.includes(formattedTag);
      });
    });
  };
  const handleClick = () => {
    const matchingLinks = findLinksWithMatchingPaths();
    const matchingLink = findLinkWithTagsOrAny(matchingLinks);

    window.open(
      matchingLink?.helpPage ?? helpPageMap.help.default.helpPage,
      "_blank"
    );
  };

  return <HelpMenuItem onClick={handleClick}>Support Center</HelpMenuItem>;
};

export default SupportCenterMenuItem;
