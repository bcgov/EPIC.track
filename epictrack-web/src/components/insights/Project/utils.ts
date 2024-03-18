import { Project } from "models/project";

export const getProjectsTypes = (projects: Project[]) => {
  const map: Map<number, Project["type"]> = new Map();
  projects.forEach((project) => {
    const key = project.type.id;
    if (!map.has(key)) {
      map.set(key, project.type);
    }
  });
  return Array.from(map.values()).sort((typeA, typeB) =>
    typeA.id > typeB.id ? 1 : -1
  );
};
