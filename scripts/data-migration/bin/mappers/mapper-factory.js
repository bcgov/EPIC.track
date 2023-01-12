"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lookup_repository_1 = __importDefault(require("../infrastructure/lookup-repository"));
const default_mapper_1 = __importDefault(require("./default-mapper"));
const organization_mapper_1 = __importDefault(require("./organization-mapper"));
const project_mapper_1 = __importDefault(require("./project-mapper"));
const work_mapper_1 = __importDefault(require("./work-mapper"));
class MapperFactory {
    static create(formType, file, env) {
        const lookupRepository = new lookup_repository_1.default(env);
        switch (formType) {
            case 'organization': return new organization_mapper_1.default(file, lookupRepository);
            case 'work': return new work_mapper_1.default(file, lookupRepository);
            case 'project': return new project_mapper_1.default(file, lookupRepository);
            default: return new default_mapper_1.default();
        }
    }
}
exports.default = MapperFactory;
