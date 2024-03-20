import { Type } from "./type";
import { SubType } from "./subtype";
import { Region } from "./region";
import { Proponent } from "./proponent";

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
  proponent: Proponent;
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

export const defaultProject = {
  is_active: true,
  description:
    "[Proponent name] proposes to develop the [project name], a [project type] located approximately [distance] kilometers [N/E/S/W] from [known near population centre/known near landmark/start and end locations of project]. The proposed project is anticipated to [produce/store/etc] approximately [storage capacity/production yield/etc.] per year of [product]. It would include [describe major project components].",
};
