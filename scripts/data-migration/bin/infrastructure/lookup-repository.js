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
            'id': { prop: 'id' },
            'name': { prop: 'name' }
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
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'phone': { prop: 'phone' }, 'email': { prop: 'email' }, 'position': { prop: 'position' } })
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
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'description': { prop: 'description' }, 'location': { prop: 'location' }, 'address': { prop: 'address' }, 'proponent_name': { prop: 'proponent_name' }, 'sub_sector_name': { prop: 'sub_sector_name' } })
            }, {
                sheet: sheetnames_const_1.default.MINISTRIES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'abbreviation': { prop: 'abbreviation' } })
            }, {
                sheet: sheetnames_const_1.default.FEDERAL_INVOLVEMENTS,
                schema: this.masterSchema
            }, {
                sheet: sheetnames_const_1.default.PHASES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'duration': { prop: 'duration' }, 'legislated': { prop: 'legislated' }, 'work_type': { prop: 'work_type' }, 'ea_act': { prop: 'ea_act' } })
            }, {
                sheet: sheetnames_const_1.default.MILESTONES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'start_at': { prop: 'start_at' }, 'duration': { prop: 'duration' }, 'kind': { prop: 'kind' }, 'auto': { prop: 'auto' }, 'milestone_type': { prop: 'milestone_type' }, 'phase_name': { prop: 'phase_name' } })
            }, {
                sheet: sheetnames_const_1.default.TEAMS,
                schema: Object.assign({}, this.masterSchema)
            }, {
                sheet: sheetnames_const_1.default.OUTCOMES,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'milestone': { prop: 'milestone' }, 'terminates_work': { prop: 'terminates_work' } })
            }, {
                sheet: sheetnames_const_1.default.REGIONS,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'entity': { prop: 'entity' } })
            }, {
                sheet: sheetnames_const_1.default.SECTORS,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'short_name': { prop: 'short_name' } })
            }, {
                sheet: sheetnames_const_1.default.SUBSECTORS,
                schema: Object.assign(Object.assign({}, this.masterSchema), { 'short_name': { prop: 'short_name' }, 'sector': { prop: 'sector' } })
            }, {
                sheet: sheetnames_const_1.default.PROPONETS,
                schema: Object.assign({}, this.masterSchema)
            }];
    }
}
exports.default = LookupRepository;
