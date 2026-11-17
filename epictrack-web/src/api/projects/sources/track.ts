import { trackClient } from "apiManager/clients";
import { ListType } from "models/code";
import {
  Project,
  ProjectInput,
  ProjectRef,
  ProjectSummary,
} from "models/project";
import { Proponent } from "models/proponent";
import { Region } from "models/region";
import { SubType } from "models/subtype";
import { Type } from "models/type";
import { ProjectsSource } from "./types";

interface TrackNamedDto {
  id: number;
  name: string;
}

/** ProjectResponseSchema. */
export interface TrackProjectDto {
  id: number;
  name: string;
  description: string;
  abbreviation: string;
  address: string;
  created_at: string;
  is_active: boolean;
  is_project_closed: boolean;
  latitude: string;
  longitude: string;
  epic_guid: string;
  ea_certificate: string;
  capital_investment: number;
  fte_positions_construction: number;
  fte_positions_operation: number;
  eac_signed: string | null;
  eac_expires: string | null;
  type_id?: number;
  sub_type_id?: number;
  proponent_id: number;
  region_id_env: number;
  region_id_flnro: number;
  type: Type;
  sub_type: SubType;
  proponent: Proponent;
  region_env: Region;
  region_flnro: Region;
}

// ProjectBodyParameterSchema's fields; anything else is dropped.
const WRITABLE_FIELDS = [
  "name",
  "latitude",
  "longitude",
  "capital_investment",
  "epic_guid",
  "ea_certificate",
  "abbreviation",
  "description",
  "address",
  "proponent_id",
  "type_id",
  "sub_type_id",
  "region_id_env",
  "region_id_flnro",
  "fte_positions_construction",
  "fte_positions_operation",
  "eac_signed",
  "eac_expires",
  "is_active",
  "is_project_closed",
] as const satisfies readonly (keyof ProjectInput)[];

export type TrackProjectWriteDto = Partial<
  Record<(typeof WRITABLE_FIELDS)[number], unknown>
>;

const toIsoDate = (value: string | Date) =>
  new Date(value).toISOString().split("T")[0];

const named = (value?: { name?: string } | null) => ({
  name: value?.name ?? "",
});

export const toProject = (dto: TrackProjectDto): Project => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  abbreviation: dto.abbreviation,
  address: dto.address,
  created_at: dto.created_at,
  is_active: dto.is_active,
  is_project_closed: dto.is_project_closed,
  latitude: dto.latitude,
  longitude: dto.longitude,
  epic_guid: dto.epic_guid,
  ea_certificate: dto.ea_certificate,
  capital_investment: dto.capital_investment,
  fte_positions_construction: dto.fte_positions_construction,
  fte_positions_operation: dto.fte_positions_operation,
  eac_signed: dto.eac_signed,
  eac_expires: dto.eac_expires,
  type_id: dto.type_id,
  sub_type_id: dto.sub_type_id,
  proponent_id: dto.proponent_id,
  region_id_env: dto.region_id_env,
  region_id_flnro: dto.region_id_flnro,
  type: dto.type,
  sub_type: dto.sub_type,
  proponent: dto.proponent,
  region_env: dto.region_env,
  region_flnro: dto.region_flnro,
});

export const toProjectSummary = (dto: TrackProjectDto): ProjectSummary => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  abbreviation: dto.abbreviation,
  address: dto.address,
  created_at: dto.created_at,
  type: named(dto.type),
  sub_type: named(dto.sub_type),
  proponent: named(dto.proponent),
  region_env: named(dto.region_env),
  region_flnro: named(dto.region_flnro),
});

export const toProjectRef = (dto: TrackNamedDto): ProjectRef => ({
  id: dto.id,
  name: dto.name,
});

export const toProjectWriteDto = (
  input: ProjectInput,
): TrackProjectWriteDto => {
  const dto: TrackProjectWriteDto = {};
  WRITABLE_FIELDS.forEach((field) => {
    if (input[field] !== undefined) dto[field] = input[field];
  });
  if (input.eac_signed) dto.eac_signed = toIsoDate(input.eac_signed);
  if (input.eac_expires) dto.eac_expires = toIsoDate(input.eac_expires);
  return dto;
};

export const trackProjectsSource: ProjectsSource = {
  get: async (id) =>
    toProject(await trackClient.get<TrackProjectDto>(`projects/${id}`)),

  getSummary: async (id) =>
    toProjectSummary(await trackClient.get<TrackProjectDto>(`projects/${id}`)),

  list: async () =>
    (await trackClient.get<TrackProjectDto[]>("projects")).map(toProject),

  listOptions: async (filter) =>
    (
      await trackClient.get<TrackNamedDto[]>("projects", {
        params: {
          return_type: "list_type",
          with_works: filter?.withWorks || undefined,
        },
      })
    ).map(toProjectRef),

  create: async (input) =>
    toProject(
      await trackClient.post<TrackProjectDto>(
        "projects",
        toProjectWriteDto(input),
      ),
    ),

  update: async (id, input) =>
    toProject(
      await trackClient.put<TrackProjectDto>(
        `projects/${id}`,
        toProjectWriteDto(input),
      ),
    ),

  checkExists: async (name, excludeId) => {
    const result = await trackClient.get<{ exists: boolean }>(
      "projects/exists",
      { params: { name, project_id: excludeId || undefined } },
    );
    return result.exists;
  },

  suggestAbbreviation: (name) =>
    trackClient.post<string>("projects/abbreviation", { name }),

  listTypes: () => trackClient.get<ListType[]>("project-types"),

  getFormOptions: async () => {
    const [types, proponents, envRegions, nrsRegions] = await Promise.all([
      trackClient.get<ListType[]>("types"),
      trackClient.get<Proponent[]>("proponents"),
      trackClient.get<ListType[]>("regions", { params: { type: "ENV" } }),
      trackClient.get<ListType[]>("regions", { params: { type: "FLNR" } }),
    ]);
    return { types, proponents, envRegions, nrsRegions };
  },

  listSubTypes: (typeId) =>
    trackClient.get<SubType[]>("sub-types", { params: { type_id: typeId } }),
};
