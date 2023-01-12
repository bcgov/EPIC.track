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
const work_formdata_1 = require("../form-data/work-formdata");
const sheetnames_const_1 = __importDefault(require("../infrastructure/sheetnames-const"));
const mapper_base_1 = __importDefault(require("./mapper-base"));
const moment_1 = __importDefault(require("moment"));
class WorkMapper extends mapper_base_1.default {
    constructor(file, lookupRepository) {
        super();
        this.sheetConf = [];
        this.eaacts = [];
        this.workTypes = [];
        this.projects = [];
        this.ministries = [];
        this.federalInvolvement = [];
        this.staffs = [];
        this.teams = [];
        this.phases = [];
        this.milestones = [];
        this.outcomes = [];
        this.roles = [];
        this.indigenousNations = [];
        this.indigenousCategories = [];
        this.file = file;
        this.lookupRepository = lookupRepository;
        this.initSheetConfig();
    }
    map() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            yield self.lookupRepository.init();
            console.log('Inside map ', new Date());
            self.eaacts = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.EAACTS);
            self.workTypes = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.WORK_TYPES);
            self.projects = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.PROJECTS);
            self.ministries = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.MINISTRIES);
            self.federalInvolvement = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.FEDERAL_INVOLVEMENTS);
            self.staffs = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.STAFFS);
            self.teams = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.TEAMS);
            self.phases = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.PHASES);
            self.milestones = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.MILESTONES);
            self.outcomes = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.OUTCOMES);
            self.roles = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.ROLES);
            self.indigenousCategories = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.INDIGENOUS_CATEGORY);
            self.indigenousNations = self.lookupRepository.getDataBySheet(sheetnames_const_1.default.INDIGENOUS_NATIONS);
            let excelRows = yield self.getCompleteExcelRows();
            const excelWorks = excelRows['Work'];
            let workFormData;
            const workDataCollection = [];
            excelWorks.forEach(work => {
                const eaAct = self.eaacts.filter(p => p.name === work.ea_act)[0];
                const workType = self.workTypes.filter(p => p.name === work.work_type)[0];
                const project = self.projects.filter(p => p.name === work.project)[0];
                const ministry = self.ministries.filter(p => p.name === work.ministry)[0];
                const federalInvolvement = self.federalInvolvement.filter(p => p.name === work.federal_involvement)[0];
                const eaoTeam = self.teams.filter(p => p.name === work.eao_team)[0];
                const epd = self.staffs.filter(p => p.name === work.epd)[0];
                const lead = self.staffs.filter(p => p.name === work.lead)[0];
                const currentPhase = self.phases.filter(p => p.name === work.current_phase)[0];
                const isWorkTerminated = work.terminated;
                const currentEvent = work.current_event;
                let actionType = 0;
                let activePhase = 0;
                let workData = new work_formdata_1.Work(work.project_tracking_number, work.work_tracking_number, project.id, ministry.id, work.start_date, currentPhase.id, federalInvolvement.id, work.title, work.decision_date, work.short_description, work.long_description, work.pecp_required, work.cac_recommended, work.work_short_status, work.stop_light, eaoTeam.id, epd.id, lead.id, eaAct.id, workType.id);
                const excelPhases = excelRows['Phases'];
                const workPhases = excelPhases.filter(p => p.work_tracking_number === work.work_tracking_number);
                const phaseDataCollection = [];
                workPhases.forEach(phase => {
                    const phaseRow = self.phases.filter(p => p.name === phase.phase)[0];
                    const endDate = phase.end_date;
                    const startDate = phase.start_date;
                    const durationRecorded = (0, moment_1.default)(endDate).diff((0, moment_1.default)(startDate), 'days');
                    const durationFixed = parseInt(phaseRow.duration);
                    const diff = durationRecorded - durationFixed;
                    let durationLabel = "";
                    if (phase.legislated) {
                        if (diff !== 0)
                            durationLabel = durationFixed + '(' + (diff > 0 ? '+' : '-') + Math.abs(diff) + ')';
                        else
                            durationLabel = durationRecorded.toString();
                    }
                    else {
                        durationLabel = durationRecorded.toString();
                    }
                    const phaseData = new work_formdata_1.Phase(phaseRow.id, phaseRow.name, eaAct.name, phase.legislated, durationRecorded.toString(), durationLabel, startDate, endDate);
                    phaseDataCollection.push(phaseData);
                });
                const excelEvents = excelRows['Events'];
                const workEvents = excelEvents.filter(p => p.work_tracking_number === work.work_tracking_number);
                const eventDataCollection = [];
                workEvents.forEach((event, index) => {
                    console.log('end event', typeof (event.end_event));
                    const milestone = self.milestones.filter(p => p.name = event.milestone
                        && p.phase_name === event.phase_name
                        && p.milestone_type === event.milestone_type)[0];
                    const phaseIndex = phaseDataCollection.findIndex(p => p.phasename === event.phase_name);
                    const outcome = self.outcomes.filter(p => p.name === event.decision)[0];
                    const phaseEvents = workEvents.filter(p => p.phase_name === event.phase_name);
                    const phaseEventIndex = phaseEvents.findIndex(p => p.title === event.title);
                    const isfixedevent = (phaseEventIndex === 0 || phaseEventIndex === (phaseEvents.length - 1));
                    const eventData = new work_formdata_1.Event(event.title, event.phase_name, eaAct.name, event.milestone, event.anticipated_start_date, event.anticipated_end_date, milestone.id, event.milestone_type_name, phaseIndex.toString(), index.toString(), event.short_description, event.long_description, outcome ? outcome.id : "", event.start_date, event.end_date, true // all events getting inserted through excel would be active
                    , event.end_date !== undefined, isfixedevent, event.end_event);
                    eventDataCollection.push(eventData);
                });
                const excelIssues = excelRows['Issues'];
                const workIssues = excelIssues.filter(p => p.work_tracking_number === work.work_tracking_number);
                const issueDataCollection = [];
                workIssues.forEach(issue => {
                    const issueData = new work_formdata_1.Issue(issue.title, issue.short_description, issue.long_description, issue.start_date, issue.anticipated_resolution_date, issue.resolution_date, issue.keyissue, issue.sensitive, issue.active, issue.resolved);
                    issueDataCollection.push(issueData);
                });
                const excelStaffs = excelRows['Staffs'];
                const workStaffs = excelStaffs.filter(p => p.work_tracking_number === work.work_tracking_number);
                const staffDataCollection = [];
                workStaffs.forEach(staff => {
                    const staffRow = self.staffs.filter(p => p.name === staff.staff_name)[0];
                    const role = self.roles.filter(p => p.name === staff.role)[0];
                    const staffData = new work_formdata_1.StaffWorkRole(staffRow.id, role.id, staff.position, staff.phone, staff.email);
                    staffDataCollection.push(staffData);
                });
                const excelPINs = excelRows['PINs'];
                const workPINs = excelPINs.filter(p => p.work_tracking_number === work.work_tracking_number);
                const pinDataCollection = [];
                workPINs.forEach(pin => {
                    const indigenousNation = self.indigenousNations.filter(p => p.name === pin.indigenous_nation)[0];
                    const indigenousCategory = self.indigenousCategories.filter(p => p.name === pin.indigenous_category)[0];
                    const pinData = new work_formdata_1.IndigenousWork(indigenousNation.id, indigenousCategory.id);
                    pinDataCollection.push(pinData);
                });
                const currentPhaseIndex = workPhases.findIndex(p => p.phase === currentPhase.name);
                actionType = currentPhaseIndex;
                activePhase = currentPhaseIndex;
                const phaseEvents = eventDataCollection.filter(p => p.phaselabel === currentPhase.name);
                const lastEvent = phaseEvents[phaseEvents.length - 1];
                if (lastEvent.end_date !== undefined && currentPhaseIndex < (phaseDataCollection.length - 1)) {
                    actionType = currentPhaseIndex + 1;
                    activePhase = currentPhaseIndex + 1;
                }
                workFormData = new work_formdata_1.WorkFormData(workData, phaseDataCollection, eventDataCollection, issueDataCollection, staffDataCollection, pinDataCollection, workPhases[activePhase].phase, eaAct.name, actionType, isWorkTerminated, activePhase, currentEvent, currentPhase.name);
                workDataCollection.push({ data: workFormData });
                console.log('Final work json', JSON.stringify(workDataCollection));
            });
            return workDataCollection;
        });
    }
    getCompleteExcelRows() {
        const self = this;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let excelRows = {};
            for (const conf of self.sheetConf) {
                let rows = yield self.mapFile(self.file, conf.schema, conf.sheet);
                excelRows = Object.assign(Object.assign({}, excelRows), { [conf.sheet]: rows });
            }
            resolve(excelRows);
        }));
    }
    getFormDetails() {
        return {
            file: this.file,
            type: 'work',
            form: 'work'
        };
    }
    initSheetConfig() {
        this.sheetConf = [{
                sheet: 'Work',
                schema: {
                    'Project Tracking Number': {
                        prop: 'project_tracking_number'
                    },
                    'Work Tracking Number': {
                        prop: 'work_tracking_number'
                    },
                    'Title': {
                        prop: 'title'
                    },
                    'EA Act': {
                        prop: 'ea_act'
                    },
                    'Work Type': {
                        prop: 'work_type'
                    },
                    'Start Date': {
                        prop: 'start_date',
                        type: Date
                    },
                    'Project': {
                        prop: 'project'
                    },
                    'Ministry': {
                        prop: 'ministry'
                    },
                    'Federal Involvement': {
                        prop: 'federal_involvement'
                    },
                    'Short Description': {
                        prop: 'short_description'
                    },
                    'Long Description': {
                        prop: 'long_description'
                    },
                    'PECP Required': {
                        prop: 'pecp_required'
                    },
                    'CAC Recommended': {
                        prop: 'cac_recommended'
                    },
                    'Work Short Status': {
                        prop: 'work_short_status'
                    },
                    'Stop Light': {
                        prop: 'stop_light'
                    },
                    'EAO Team': {
                        prop: 'eao_team'
                    },
                    'EPD': {
                        prop: 'epd'
                    },
                    'Current Phase': {
                        prop: 'current_phase'
                    },
                    'Current Event': {
                        prop: 'current_event'
                    },
                    'Decision Date': {
                        prop: 'decision_date',
                        type: Date
                    },
                    'Lead': {
                        prop: 'lead'
                    },
                    'Active': {
                        prop: 'active'
                    },
                    'Terminated': {
                        prop: 'terminated'
                    }
                }
            }, {
                sheet: 'Phases',
                schema: {
                    'Work Tracking Number': {
                        prop: 'work_tracking_number'
                    },
                    'Phase': {
                        prop: 'phase'
                    },
                    'Start Date': {
                        prop: 'start_date',
                        type: Date
                    },
                    'End Date': {
                        prop: 'end_date',
                        type: Date
                    },
                    'Legislated': {
                        prop: 'legislated'
                    }
                }
            }, {
                sheet: 'Events',
                schema: {
                    'Work Tracking Number': {
                        prop: 'work_tracking_number'
                    },
                    'Title': {
                        prop: 'title'
                    },
                    'Short Description': {
                        prop: 'short_description'
                    },
                    'Long Description': {
                        prop: 'Milestone'
                    },
                    'Milestone': {
                        prop: 'milestone'
                    },
                    'Milestone Type': {
                        prop: 'milestone_type'
                    },
                    'Phase Name': {
                        prop: 'phase_name'
                    },
                    'Decision': {
                        prop: 'decision'
                    },
                    'Anticipated Start Date': {
                        prop: 'anticipated_start_date',
                        type: Date
                    },
                    'Anticipated End Date': {
                        prop: 'anticipated_end_date',
                        type: Date
                    },
                    'Start Date': {
                        prop: 'start_date',
                        type: Date
                    },
                    'End Date': {
                        prop: 'end_date',
                        type: Date
                    },
                    'Active': {
                        prop: 'active'
                    },
                    'Complete': {
                        prop: 'complete'
                    },
                    'End Event': {
                        prop: 'end_event'
                    }
                }
            }, {
                sheet: 'Issues',
                schema: {
                    'Work Tracking Number': {
                        prop: 'work_tracking_number'
                    },
                    'Title': {
                        prop: 'title'
                    },
                    'Short Description': {
                        prop: 'short_description'
                    },
                    'Long Description': {
                        prop: 'long_description'
                    },
                    'Start Date': {
                        prop: 'start_date',
                        type: Date
                    },
                    'Anticipated Resolution Date': {
                        prop: 'anticipated_resolution_date',
                        type: Date
                    },
                    'Resolution Date': {
                        prop: 'resolution_date',
                        type: Date
                    },
                    'Key Issue': {
                        prop: 'keyissue'
                    },
                    'Sensitive': {
                        prop: 'sensitive'
                    },
                    'Resolved': {
                        prop: 'resolved'
                    },
                    'Active': {
                        prop: 'active'
                    }
                }
            }, {
                sheet: 'Staffs',
                schema: {
                    'Work Tracking Number': {
                        prop: 'work_tracking_number'
                    },
                    'Staff Name': {
                        prop: 'staff_name'
                    },
                    'Role': {
                        prop: 'role'
                    },
                    'Position': {
                        prop: 'position'
                    },
                    'Phone': {
                        prop: 'phone'
                    },
                    'Email': {
                        prop: 'email'
                    }
                }
            }, {
                sheet: 'PINs',
                schema: {
                    'Work Tracking Number': {
                        prop: 'work_tracking_number'
                    },
                    'Indigenous Nation': {
                        prop: 'indigenous_nation'
                    },
                    'Indigenous Category': {
                        prop: 'indigenous_category'
                    }
                }
            }];
    }
}
exports.default = WorkMapper;
