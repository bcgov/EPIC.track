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
  eac_signed?: string | null;
  eac_expires?: string | null;
  created_at: string;
}

export interface ProjectRef {
  id: number;
  name: string;
}

/** The details a work plan shows. */
export interface ProjectSummary extends ProjectRef {
  description: string;
  abbreviation: string;
  address: string;
  created_at: string;
  type: { name: string };
  sub_type: { name: string };
  proponent: { name: string };
  region_env: { name: string };
  region_flnro: { name: string };
}

export interface ProjectInput {
  name?: string;
  latitude?: string | number;
  longitude?: string | number;
  capital_investment?: string | number | null;
  epic_guid?: string | null;
  ea_certificate?: string | null;
  abbreviation?: string | null;
  description?: string;
  address?: string;
  proponent_id?: string | number;
  type_id?: string | number;
  sub_type_id?: string | number;
  region_id_env?: string | number;
  region_id_flnro?: string | number;
  fte_positions_construction?: string | number | null;
  fte_positions_operation?: string | number | null;
  eac_signed?: string | Date | null;
  eac_expires?: string | Date | null;
  is_active?: boolean;
  is_project_closed?: boolean;
}

export const defaultProject = {
  is_active: true,
  description:
    "[Proponent name] proposes to (develop/expand/modify/change) the [project name], a [project type] located approximately [distance] kilometers (N/E/S/W) from [known near population centre/known near landmark/start and end of project/between locations X and Y]. The proposed project is anticipated to (produce/store/modify/expand/change/increase etc.) approximately [storage capacity/production yield/etc.] per year of [product]. It would include [describe major project components/nature of the project].",
};
