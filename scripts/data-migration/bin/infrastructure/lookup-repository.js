"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sheetnames_const_1 = __importDefault(require("./sheetnames-const"));
const readXlsxFromFile = require('read-excel-file/node');
class LookupRepository {
    constructor(env) {
        this.sheetConfig = [];
        this.excelRows = {};
        this.masterSchema = {
            'Id': { prop: 'id' },
            'Name': { prop: 'name' }
        };
        this.file = `./templates/LookUps_${env.toLowerCase()}.xlsx`;
        this.initSheetConfig();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                for (const config of self.sheetConfig) {
                    yield readXlsxFromFile(self.file, { sheet: config.sheet, schema: config.schema }).then(({ rows, errors }) => {
                        if (errors && errors.length > 0) {
                            reject(errors);
                        }
                        self.excelRows = Object.assign(Object.assign({}, self.excelRows), { [config.sheet]: rows });
                    });
                }
                resolve(self.excelRows);
            }));
        });
    }
    getDataBySheet(sheetName) {
        return this.excelRows[sheetName];
    }
    initSheetConfig() {
        this.sheetConfig = [{
                sheet: sheetnames_const_1.default.POSITIONS,
                schema: this.masterSchema
            }, {
                sheet: sheetnames_const_1.default.STAFFS,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'First Name': { prop: 'firstname' }, 'Last Name': { prop: 'lastname' }, 'Phone': { prop: 'phone' }, 'Email': { prop: 'email' }, 'Position': { prop: 'position' } })
            }, {
                sheet: sheetnames_const_1.default.INDIGENOUS_NATIONS,
                schema: this.masterSchema
            }, {
                sheet: sheetnames_const_1.default.INDIGENOUS_CATEGORY,
                schema: this.masterSchema
            }, {
                sheet: sheetnames_const_1.default.ROLES,
                schema: this.masterSchema
            }, {
                sheet: sheetnames_const_1.default.EAACTS,
                schema: this.masterSchema
            }, {
                sheet: sheetnames_const_1.default.WORK_TYPES,
                schema: this.masterSchema
            }, {
                sheet: sheetnames_const_1.default.PROJECTS,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'Description': { prop: 'description' }, 'Location': { prop: 'location' }, 'Address': { prop: 'address' }, 'Proponent Name': { prop: 'proponent_name' }, 'Sub Type Name': { prop: 'sub_type_name' } })
            }, {
                sheet: sheetnames_const_1.default.MINISTRIES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'Abbreviation': { prop: 'abbreviation' } })
            }, {
                sheet: sheetnames_const_1.default.FEDERAL_INVOLVEMENTS,
                schema: this.masterSchema
            }, {
                sheet: sheetnames_const_1.default.PHASES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'Duration': { prop: 'duration' }, 'Legislated': { prop: 'legislated' }, 'Work_type': { prop: 'work_type' }, 'Ea Act': { prop: 'ea_act' } })
            }, {
                sheet: sheetnames_const_1.default.MILESTONES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'Start At': { prop: 'start_at' }, 'Duration': { prop: 'duration' }, 'Kind': { prop: 'kind' }, 'Auto': { prop: 'auto' }, 'Milestone Type': { prop: 'milestone_type' }, 'Phase Name': { prop: 'phase_name' } })
            }, {
                sheet: sheetnames_const_1.default.TEAMS,
                schema: Object.assign({}, this.masterSchema)
            }, {
                sheet: sheetnames_const_1.default.OUTCOMES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'Milestone': { prop: 'milestone' }, 'Terminates Work': { prop: 'terminates_work' } })
            }, {
                sheet: sheetnames_const_1.default.REGIONS,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'Entity': { prop: 'entity' } })
            }, {
                sheet: sheetnames_const_1.default.TYPES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'Short Name': { prop: 'short_name' } })
            }, {
                sheet: sheetnames_const_1.default.SUBTYPES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'Short Name': { prop: 'short_name' }, 'Type': { prop: 'type' } })
            }, {
                sheet: sheetnames_const_1.default.PROPONETS,
                schema: Object.assign({}, this.masterSchema)
            }];
    }
}
exports.default = LookupRepository;
