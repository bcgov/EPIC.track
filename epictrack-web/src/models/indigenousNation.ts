import { ListType } from "./code";
import { Staff } from "./staff";

export interface IndigenousNation extends ListType {
    is_active: boolean,
    relationship_holder_id?: number,
    relationship_holder?: Staff
}