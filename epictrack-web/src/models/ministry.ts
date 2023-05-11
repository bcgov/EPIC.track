import { Staff } from "./staff";

export interface Ministry {
    id: number;
    abbreviation: string;
    combined: string;
    name: string;
    minister: Staff;
}