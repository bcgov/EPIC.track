import { Children, FC, useEffect, useRef, useState } from "react";
import { Grid, Collapse, Link, Button } from "@mui/material";
import { ETParagraph, ETDescription } from "components/shared";
import ETAccordion from "components/shared/accordion/Accordion";
import ETAccordionDetails from "components/shared/accordion/components/AccordionDetails";
import ETAccordionSummary from "components/shared/accordion/components/AccordionSummary";
import Icons from "../icons/index";
import { IconProps } from "../icons/type";
import { Palette } from "styles/theme";
import { exportAccordionChartsToPdf } from "./utils";

const ExpandIcon: FC<IconProps> = Icons["ExpandIcon"];

interface InsightAccordionProps {
  tab?: string;
  title: string;
  children: React.ReactNode;
  showMoreContent?: React.ReactNode;
  showMoreLabel?: boolean;
  defaultExpanded?: boolean;
}

const InsightAccordion: React.FC<InsightAccordionProps> = ({
  tab = "",
  title,
  children,
  showMoreContent,
  showMoreLabel = false,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showMore, setShowMore] = useState(false);

  const chartsRef = useRef<HTMLDivElement>(null);

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
        <ETParagraph sx={{ paddingLeft: "4px" }}>{title}</ETParagraph>
      </ETAccordionSummary>
      <ETAccordionDetails sx={{ pt: "24px" }}>
        <Grid container spacing={2}>
          {showMoreLabel && (
            <Grid
              item
              xs={12}
              container
              justifyContent="flex-end"
              alignItems="center"
              style={{ paddingTop: 0 }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  exportAccordionChartsToPdf(
                    chartsRef.current!,
                    `${tab} ${title ?? "Insights"}`,
                  )
                }
                sx={{ m: "0.5rem", p: "0.275rem 0.5rem" }}
              >
                Export to PDF
              </Button>
              <ETDescription sx={{ p: "0.5rem" }}>
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
          <div
            ref={chartsRef}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            {Children.map(children, (child) => (
              <div style={{ flex: "1 1 auto", minWidth: 300 }}>{child}</div>
            ))}
          </div>
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
