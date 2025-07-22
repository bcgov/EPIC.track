import AccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material";

const ETAccordionDetails = styled(AccordionDetails)`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 1rem 1.5rem;
  width: 100%;
`;

export default ETAccordionDetails;
