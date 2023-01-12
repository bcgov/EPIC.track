import LookupRepository from "../infrastructure/lookup-repository";
import DefaultMapper from "./default-mapper";
import MapperBase from "./mapper-base";
import OrganizationMapper from "./organization-mapper";
import ProjectMapper from "./project-mapper";
import WorkMapper from "./work-mapper";

export default  class MapperFactory {
    static create(formType: string, file: string, env: string): MapperBase {
        const lookupRepository = new LookupRepository(env);
        switch(formType){
            case 'organization': return new OrganizationMapper(file, lookupRepository);
            case 'work': return new WorkMapper(file, lookupRepository);
            case 'project': return new ProjectMapper(file, lookupRepository);
            default: return new DefaultMapper();
        }
        
    }
}