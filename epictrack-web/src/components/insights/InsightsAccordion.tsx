import { Grid, Collapse, Link } from "@mui/material";
import { ETParagraph, ETDescription } from "components/shared";
import ETAccordion from "components/shared/accordion/Accordion";
import ETAccordionDetails from "components/shared/accordion/components/AccordionDetails";
import ETAccordionSummary from "components/shared/accordion/components/AccordionSummary";
import { FC, useEffect, useState } from "react";
import Icons from "../icons/index";
import { IconProps } from "../icons/type";
import { Palette } from "styles/theme";

const ExpandIcon: FC<IconProps> = Icons["ExpandIcon"];

interface InsightAccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  showMoreContent?: React.ReactNode;
  showMoreLabel?: boolean;
  defaultExpanded?: boolean;
}

const InsightAccordion: React.FC<InsightAccordionProps> = ({
  title,
  children,
  showMoreContent,
  showMoreLabel = false,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    setShowMore(false);
  }, [expanded]);

  return (
    <ETAccordion
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      sx={{
        border: `1px solid ${Palette.neutral.main}`,
        borderLeft: `1px solid ${Palette.neutral.main}`,
      }}
    >
      <ETAccordionSummary
        expanded={expanded}
        expandIcon={
          <ExpandIcon
            className=""
            style={{
              borderRadius: "4px",
              padding: "2px",
              width: "20px",
              height: "20px",
            }}
          />
        }
      >
        <ETParagraph>{title}</ETParagraph>
      </ETAccordionSummary>
      <ETAccordionDetails sx={{ pt: "24px" }}>
        <Grid container spacing={2}>
          {showMoreLabel && (
            <Grid item xs={12} container justifyContent="flex-end">
              <ETDescription>
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMore((prev) => !prev);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  {showMore ? "Show Less" : "Show More"}
                </Link>
              </ETDescription>
            </Grid>
          )}
          {children}
          {showMoreContent && (
            <Grid item xs={12}>
              <Collapse in={showMore}>{showMoreContent}</Collapse>
            </Grid>
          )}
        </Grid>
      </ETAccordionDetails>
    </ETAccordion>
  );
};

export default InsightAccordion;
