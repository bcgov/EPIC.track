export type Icon = 
| "AllIcon"
| "DashboardIcon"
| "ReportIcon"
| "InsightIcon"
| "GearIcon"
| "PenIcon"
| "GridIcon";

export interface IconProps {
    className?: string;
    width?: string;
    height?: string;
    viewBox?: string;
    fill?: string; 
}