import { Type } from "./type";
import { SubType } from "./subtype";
import { Region } from "./region";

export interface Project {
  id: number;
  name: string;
  sub_type: SubType;
  sub_type_id?: number;
  type_id?: number;
  type: Type;
  is_active: boolean;
  description: string;
  region_id_env: number;
  region_id_flnro: number;
  proponent_id: number;
  ea_certificate: string;
  abbreviation: string;
  epic_guid: string;
  latitude: string;
  longitude: string;
  capital_investment: number;
  address: string;
  is_project_closed: boolean;
  region_env: Region;
  region_flnro: Region;
  fte_positions_construction: number;
  fte_positions_operation: number;
}
