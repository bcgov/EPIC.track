import Sheetnames from "./sheetnames-const";

const readXlsxFromFile = require('read-excel-file/node');
export default class LookupRepository {
    private file: string;
    private sheetConfig: any[] = [];
    private excelRows: any = {};
    private masterSchema: any = {
        'Id': { prop: 'id' },
        'Name': { prop: 'name' }
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
                'First Name': {prop: 'firstname'},
                'Last Name': {prop: 'lastname'},
                'Phone': { prop: 'phone' },
                'Email': { prop: 'email' },
                'Position': { prop: 'position' }
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
                'Description': { prop: 'description' },
                'Location': { prop: 'location' },
                'Address': { prop: 'address' },
                'Proponent Name': { prop: 'proponent_name' },
                'Sub Type Name': { prop: 'sub_type_name' }
            }
        },{
            sheet: Sheetnames.MINISTRIES,
            schema: {
                ...this.masterSchema,
                'Abbreviation': { prop: 'abbreviation' }
            }
        },{
            sheet: Sheetnames.FEDERAL_INVOLVEMENTS,
            schema: this.masterSchema
        },{
            sheet: Sheetnames.PHASES,
            schema: {
                ...this.masterSchema,
                'Duration': { prop: 'duration' },
                'Legislated': { prop: 'legislated' },
                'Work_type': { prop: 'work_type' },
                'Ea Act': { prop: 'ea_act' }
            }
        },{
            sheet: Sheetnames.MILESTONES,
            schema: {
                ...this.masterSchema,
                'Start At': { prop: 'start_at' },
                'Duration': { prop: 'duration' },
                'Kind': { prop: 'kind' },
                'Auto': { prop: 'auto' },
                'Milestone Type': { prop: 'milestone_type' },
                'Phase Name': { prop: 'phase_name' }
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
                'Milestone': { prop: 'milestone' },
                'Terminates Work': { prop: 'terminates_work' }
            }
        },{
            sheet: Sheetnames.REGIONS,
            schema: {
                ...this.masterSchema,
                'Entity': { prop: 'entity' }
            }
        },{
            sheet: Sheetnames.TYPES,
            schema: {
                ...this.masterSchema,
                'Short Name': { prop: 'short_name' }
            }
        },{
            sheet: Sheetnames.SUBTYPES,
            schema: {
                ...this.masterSchema,
                'Short Name': { prop: 'short_name' },
                'Type': { prop: 'type' }
            }
        },{
            sheet: Sheetnames.PROPONENTS,
            schema: {
                ...this.masterSchema
            }
        }];
    }
}