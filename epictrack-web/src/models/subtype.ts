import { ListType } from "./code";
import { Type } from "./type";

export interface SubType extends ListType{
    type: Type;
}