import LookupRepository from "../infrastructure/lookup-repository";
import DefaultMapper from "./default-mapper";
import IndigenousNationMapper from "./indigenous-nation-mapper";
import MapperBase from "./mapper-base";
import ProponentMapper from "./proponent-mapper";
import ProjectMapper from "./project-mapper";
import StaffMapper from "./staff-mapper";
import WorkMapper from "./work-mapper";

export default  class MapperFactory {
    static create(formType: string, file: string, env: string): MapperBase {
        const lookupRepository = new LookupRepository(env);
        switch(formType){
            case 'proponent': return new ProponentMapper(file, lookupRepository);
            case 'work': return new WorkMapper(file, lookupRepository);
            case 'project': return new ProjectMapper(file, lookupRepository);
            case 'staff': return new StaffMapper(file, lookupRepository);
            case 'indigenousnation': return new IndigenousNationMapper(file, lookupRepository);
            default: return new DefaultMapper();
        }
        
    }
}