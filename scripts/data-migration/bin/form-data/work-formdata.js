"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndigenousWork = exports.StaffWorkRole = exports.Issue = exports.Engagement = exports.Event = exports.Phase = exports.Work = exports.WorkFormData = void 0;
const formdata_base_1 = __importDefault(require("./formdata-base"));
class WorkFormData extends formdata_base_1.default {
    constructor(work, phase, event
    // ,engagement: Engagement
    , issue, staffWorkRole, indigenousWork, currentphaselabel, currenteaactlabel, actionType = 0, isworkterminated = false, activephase = 0, completedEvent = "", completedEventPhase = "") {
        super();
        this.actionType = 0;
        this.isworkterminated = false;
        this.activephase = 0;
        this.completedEvent = "";
        this.completedEventPhase = "";
        this.currentphaselabel = "";
        this.currenteaactlabel = "";
        this.works = work;
        this["works-work_phases"] = phase;
        this["works-events"] = event;
        // this["works-engagements"] = [];
        this["works-issues"] = issue;
        this["works-staff_work_roles"] = staffWorkRole;
        this["works-indigenous_works"] = indigenousWork;
        this.currenteaactlabel = currenteaactlabel;
        this.currentphaselabel = currentphaselabel;
        this.actionType = actionType;
        this.isworkterminated = isworkterminated;
        this.activephase = activephase;
        this.completedEvent = completedEvent;
        this.completedEventPhase = completedEventPhase;
    }
}
exports.WorkFormData = WorkFormData;
class Work {
    /**
     *
     */
    constructor(project_tracking_number, work_tracking_number, project_id, ministry_id, start_date, current_phase_id, federal_involvement_id, title, anticipated_decision_date, short_description, long_description, is_pcep_required, is_cac_recommended, work_short_status, work_status_stoplight, eao_team_id, responsible_epd_id, work_lead_id, ea_act_id, work_type_id) {
        this.project_tracking_number = "";
        this.work_tracking_number = "";
        this.project_id = "";
        this.ministry_id = "";
        this.start_date = "";
        this.current_phase_id = "";
        this.federal_involvement_id = "";
        this.id = "";
        this.title = "";
        this.anticipated_decision_date = "";
        this.short_description = "";
        this.long_description = "";
        this.is_pecp_required = false;
        this.is_cac_recommended = false;
        this.work_short_status = "";
        this.work_status_stoplight = "";
        this.is_active = true;
        this.eao_team_id = "";
        this.responsible_epd_id = "";
        this.work_lead_id = "";
        this.ea_act_id = "";
        this.work_type_id = "";
        this.project_tracking_number = project_tracking_number;
        this.work_tracking_number = work_tracking_number;
        this.project_id = project_id;
        this.ministry_id = ministry_id;
        this.start_date = start_date;
        this.current_phase_id = current_phase_id;
        this.federal_involvement_id = federal_involvement_id;
        this.title = title;
        this.anticipated_decision_date = anticipated_decision_date;
        this.short_description = short_description;
        this.long_description = long_description;
        this.is_pecp_required = is_pcep_required;
        this.is_cac_recommended = is_cac_recommended;
        this.work_short_status = work_short_status;
        this.work_status_stoplight = work_status_stoplight;
        this.eao_team_id = eao_team_id;
        this.responsible_epd_id = responsible_epd_id;
        this.work_lead_id = work_lead_id;
        this.ea_act_id = ea_act_id;
        this.work_type_id = work_type_id;
    }
}
exports.Work = Work;
class Phase {
    /**
     *
     */
    constructor(phase_id, phasename, eaactlabel, legislated, duration, durationlabel, start_date, anticipated_end_date) {
        this.id = "";
        this.phase_id = "";
        this.phasename = "";
        this.eaactlabel = "";
        this.legislated = false;
        this.duration = "";
        this.durationlabel = "";
        this.start_date = "";
        this.anticipated_end_date = "";
        this.phase_id = phase_id;
        this.phasename = phasename;
        this.eaactlabel = eaactlabel;
        this.legislated = legislated;
        this.duration = duration;
        this.durationlabel = durationlabel;
        this.start_date = start_date;
        this.anticipated_end_date = anticipated_end_date;
    }
}
exports.Phase = Phase;
class Event {
    /**
     *
     */
    constructor(title, phaselabel, eaactlabel, milestonelabel, anticipated_start_date, anticipated_end_date, milestone_id, milestone_type_name, phaseindex, index, short_description, long_description, decision_id, start_date, end_date, is_active = true, is_complete = false, isfixedevent = true, isendevent = false, allowEditing = true) {
        this.id = "";
        this.title = "";
        this.allowEditing = true;
        this.phaselabel = "";
        this.eaactlabel = "";
        this.milestonelabel = "";
        this.anticipated_start_date = "";
        this.anticipated_end_date = "";
        this.milestone_id = "";
        this.milestone_type_name = "";
        this.isfixedevent = true;
        this.isendevent = true;
        this.phaseindex = "";
        this.duration = "";
        this.index = "";
        this.short_description = "";
        this.long_description = "";
        this.decision_id = "";
        this.start_date = "";
        this.end_date = "";
        this.is_active = true;
        this.is_complete = false;
        this.title = title;
        this.phaselabel = phaselabel;
        this.eaactlabel = eaactlabel;
        this.milestonelabel = milestonelabel;
        this.anticipated_start_date = anticipated_start_date;
        this.anticipated_end_date = anticipated_end_date;
        this.milestone_id = milestone_id;
        this.milestone_type_name = milestone_type_name;
        this.phaseindex = phaseindex;
        this.index = index;
        this.short_description = short_description;
        this.long_description = long_description;
        this.decision_id = decision_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.is_active = is_active;
        this.is_complete = is_complete;
        this.isfixedevent = isfixedevent;
        this.isendevent = isendevent;
        this.allowEditing = !(this.end_date !== undefined && this.is_complete);
    }
}
exports.Event = Event;
class Engagement {
    /**
     *
     */
    constructor(phase_label, title, start_date, end_date, phaseindex, duration, milestone_type_name, start_at, phase_id, project_id, work_type_id, milestone_id, engagement_id) {
        this.id = "";
        this.phase_label = "";
        this.title = "";
        this.start_date = "";
        this.end_date = "";
        this.phaseindex = "";
        this.correlationkey = "default";
        this.duration = "";
        this.milestone_type_name = "";
        this.start_at = "";
        this.phase_id = "";
        this.project_id = "";
        this.work_type_id = "";
        this.milestone_id = "";
        this.engagement_id = "";
        this.phase_label = phase_label;
        this.start_date = start_date;
        this.title = title;
        this.end_date = end_date;
        this.phaseindex = phaseindex;
        this.duration = duration;
        this.milestone_type_name = milestone_type_name;
        this.start_at = start_at;
        this.work_engagements = {
            id: "",
            phase_id: phase_id,
            project_id: project_id,
            work_type_id: work_type_id,
            milestone_id: milestone_id,
            engagement_id: engagement_id
        };
    }
}
exports.Engagement = Engagement;
class Issue {
    /**
     *
     */
    constructor(title, short_description, long_description, start_date, anticipated_resolution_date, resolution_date, is_key_issue = false, is_sensitive = false, is_active = false, is_resolved = false) {
        this.id = "";
        this.title = "";
        this.short_description = "";
        this.long_description = "";
        this.start_date = "";
        this.anticipated_resolution_date = "";
        this.resolution_date = "";
        this.is_key_issue = false;
        this.is_sensitive = false;
        this.is_active = false;
        this.is_resolved = false;
        this.title = title;
        this.short_description = short_description;
        this.long_description = long_description;
        this.start_date = start_date;
        this.anticipated_resolution_date = anticipated_resolution_date;
        this.resolution_date = resolution_date;
        this.is_key_issue = is_key_issue;
        this.is_sensitive = is_sensitive;
        this.is_active = is_active;
        this.is_resolved = is_resolved;
    }
}
exports.Issue = Issue;
class StaffWorkRole {
    /**
     *
     */
    constructor(staff_id, role_id, position, phone, email) {
        this.id = "";
        this.staff_id = "";
        this.role_id = "";
        this.position = "";
        this.phone = "";
        this.email = "";
        this.staff_id = staff_id;
        this.role_id = role_id;
        this.position = position;
        this.phone = phone;
        this.email = email;
    }
}
exports.StaffWorkRole = StaffWorkRole;
class IndigenousWork {
    /**
     *
     */
    constructor(indigenous_nation_id, indigenous_category_id) {
        this.id = "";
        this.indigenous_nation_id = "";
        this.indigenous_category_id = "";
        this.indigenous_nation_id = indigenous_nation_id;
        this.indigenous_category_id = indigenous_category_id;
    }
}
exports.IndigenousWork = IndigenousWork;
module.exports = {
    WorkFormData,
    Work,
    Phase,
    Event,
    Engagement,
    Issue,
    StaffWorkRole,
    IndigenousWork
};
