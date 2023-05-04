import { Staff } from "./staff";

export interface IndigenousNation {
    id: number,
    is_active: boolean,
    name: string,
    responsible_epd_id?: number,
    responsible_epd?: Staff
}