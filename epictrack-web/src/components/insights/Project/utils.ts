import { Project } from "models/project";

export const getProjectsSubtypes = (projects: Project[]) => {
  const map: Map<number, Project["sub_type"]> = new Map();
  projects.forEach((project) => {
    const key = project.sub_type.id;
    if (!map.has(key)) {
      map.set(key, project.sub_type);
    }
  });
  return Array.from(map.values()).sort((subtypeA, subtypeB) =>
    subtypeA.id > subtypeB.id ? 1 : -1
  );
};
