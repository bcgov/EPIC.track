import { ListType } from "./code";

export type Type = {
  sort_order: number;
} & ListType;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- legacy marker that list-management models and services still use
export interface MasterBase {}
export interface RadioOptions {
  label: any;
  value: any;
}
