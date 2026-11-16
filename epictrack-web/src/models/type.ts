import { ListType } from "./code";

export type Type = {
  sort_order: number;
} & ListType;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- goes away with ServiceBase
export interface MasterBase {}
export interface RadioOptions {
  label: any;
  value: any;
}
