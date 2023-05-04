import { Staff } from "./staff";

export interface Proponent {
    id: number,
    is_active: boolean,
    name: string,
    relationship_holder_id?: number,
    relationship_holder?: Staff
}