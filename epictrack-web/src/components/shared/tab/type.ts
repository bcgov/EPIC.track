import { SxProps, TabTypeMap } from "@mui/material";

type ETTabProps = {
    sx?: SxProps;
    identifier?: string,
    label: string | React.ReactNode;
    value?: any;
    [x: string]: unknown;
};

export default ETTabProps;