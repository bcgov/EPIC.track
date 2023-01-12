import Sheetnames from "./sheetnames-const";

const readXlsxFromFile = require('read-excel-file/node');
export default class LookupRepository {
    private file: string;
    private sheetConfig: any[] = [];
    private excelRows: any = {};
    private masterSchema: any = {
        'id': { prop: 'id' },
        'name': { prop: 'name' }
    };
    constructor(env: string) {
        this.file = `./templates/LookUps_${env.toLowerCase()}.xlsx`;
        this.initSheetConfig();
    }
    async init() {
        const self = this;
        return new Promise(async (resolve, reject)=>{
            for(const config of self.sheetConfig) {
                await readXlsxFromFile(self.file, {sheet: config.sheet, schema: config.schema}).then(({ rows, errors }: any) => {
                    if (errors && errors.length > 0) {
                        reject(errors);
                    }
                    self.excelRows = {
                        ...self.excelRows,
                        [config.sheet]: rows
                    }
                });
            }
            resolve(self.excelRows);
        });
    }
    getDataBySheet(sheetName: string) {
        return this.excelRows[sheetName];
    }
    private initSheetConfig() {
        this.sheetConfig = [{
            sheet: Sheetnames.POSITIONS,
            schema: this.masterSchema
        }, {
            sheet: Sheetnames.STAFFS,
            schema: {
                ...this.masterSchema,
                'phone': { prop: 'phone' },
                'email': { prop: 'email' },
                'position': { prop: 'position' }
            }
        }, {
            sheet: Sheetnames.INDIGENOUS_NATIONS,
            schema: this.masterSchema
        }, {
            sheet: Sheetnames.INDIGENOUS_CATEGORY,
            schema: this.masterSchema
        }, {
            sheet: Sheetnames.ROLES,
            schema: this.masterSchema
        }, {
            sheet: Sheetnames.EAACTS,
            schema: this.masterSchema
        }, {
            sheet: Sheetnames.WORK_TYPES,
            schema: this.masterSchema
        }, {
            sheet: Sheetnames.PROJECTS,
            schema: {
                ...this.masterSchema,
                'description': { prop: 'description' },
                'location': { prop: 'location' },
                'address': { prop: 'address' },
                'proponent_name': { prop: 'proponent_name' },
                'sub_sector_name': { prop: 'sub_sector_name' }
            }
        },{
            sheet: Sheetnames.MINISTRIES,
            schema: {
                ...this.masterSchema,
                'abbreviation': { prop: 'abbreviation' }
            }
        },{
            sheet: Sheetnames.FEDERAL_INVOLVEMENTS,
            schema: this.masterSchema
        },{
            sheet: Sheetnames.PHASES,
            schema: {
                ...this.masterSchema,
                'duration': { prop: 'duration' },
                'legislated': { prop: 'legislated' },
                'work_type': { prop: 'work_type' },
                'ea_act': { prop: 'ea_act' }
            }
        },{
            sheet: Sheetnames.MILESTONES,
            schema: {
                ...this.masterSchema,
                'start_at': { prop: 'start_at' },
                'duration': { prop: 'duration' },
                'kind': { prop: 'kind' },
                'auto': { prop: 'auto' },
                'milestone_type': { prop: 'milestone_type' },
                'phase_name': { prop: 'phase_name' }
            }
        },{
            sheet: Sheetnames.TEAMS,
            schema: {
                ...this.masterSchema,
            }
        },{
            sheet: Sheetnames.OUTCOMES,
            schema: {
                ...this.masterSchema,
                'milestone': { prop: 'milestone' },
                'terminates_work': { prop: 'terminates_work' }
            }
        },{
            sheet: Sheetnames.REGIONS,
            schema: {
                ...this.masterSchema,
                'entity': { prop: 'entity' }
            }
        },{
            sheet: Sheetnames.SECTORS,
            schema: {
                ...this.masterSchema,
                'short_name': { prop: 'short_name' }
            }
        },{
            sheet: Sheetnames.SUBSECTORS,
            schema: {
                ...this.masterSchema,
                'short_name': { prop: 'short_name' },
                'sector': { prop: 'sector' }
            }
        },{
            sheet: Sheetnames.PROPONETS,
            schema: {
                ...this.masterSchema
            }
        }];
    }
}