import FormDataBase from "./formdata-base";

export class WorkFormData extends FormDataBase {
    works: Work;
    ['works-work_phases']: Phase[];
    ['works-events']: Event[];
    // ['works-engagements']: Engagement[];
    ['works-issues']: Issue[];
    ['works-staff_work_roles']: StaffWorkRole[]
    ['works-indigenous_works']: IndigenousWork[];

    actionType: number = 0;
    isworkterminated: boolean = false;
    activephase: number = 0;
    completedEvent: string = "";
    completedEventPhase: string = "";
    currentphaselabel: string =  "";
    currenteaactlabel: string = "";
    constructor(
        work: Work
        ,phase: Phase[]
        ,event: Event[]
        // ,engagement: Engagement
        ,issue: Issue[]
        ,staffWorkRole: StaffWorkRole[]
        ,indigenousWork: IndigenousWork[]
        ,currentphaselabel: string
        ,currenteaactlabel: string
        ,actionType: number = 0
        ,isworkterminated: boolean = false
        ,activephase: number = 0
        ,completedEvent:string = ""
        ,completedEventPhase: string = "") {
        super();
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
export class Work {
    project_tracking_number: string = "";
    work_tracking_number: string = "";
    project_id: string = "";
    ministry_id: string = "";
    start_date: string = "";
    current_phase_id: string = "";
    federal_involvement_id: string = "";
    id: string = "";
    title: string = "";
    anticipated_decision_date: string = "";
    short_description: string = "";
    long_description: string = "";
    is_pecp_required: boolean = false;
    is_cac_recommended: boolean = false;
    work_short_status: string = "";
    work_status_stoplight: string = "";
    is_active: boolean = true;
    eao_team_id: string = "";
    responsible_epd_id: string = "";
    work_lead_id: string = "";
    ea_act_id: string = "";
    work_type_id: string = "";
    /**
     *
     */
    constructor(
     project_tracking_number: string
    ,work_tracking_number: string
    ,project_id: string
    ,ministry_id: string
    ,start_date: string
    ,current_phase_id: string
    ,federal_involvement_id: string
    ,title: string 
    ,anticipated_decision_date: string 
    ,short_description: string 
    ,long_description: string 
    ,is_pcep_required: boolean 
    ,is_cac_recommended: boolean
    ,work_short_status: string 
    ,work_status_stoplight: string 
    ,eao_team_id: string 
    ,responsible_epd_id: string 
    ,work_lead_id: string 
    ,ea_act_id: string 
    ,work_type_id: string  ) {
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
export class Phase {
    id: string = "";
    phase_id: string = "";
    phasename: string = "";
    eaactlabel: string = "";
    legislated: boolean = false;
    duration: string = "";
    durationlabel: string = "";
    start_date: string = "";
    anticipated_end_date: string = "";
    /**
     *
     */
    constructor(
        phase_id: string
        ,phasename: string
        ,eaactlabel: string
        ,legislated: boolean
        ,duration: string
        ,durationlabel: string
        ,start_date: string
        ,anticipated_end_date: string) {
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
export class Event {
    id: string = "";
    title: string = "";
    allowEditing: boolean = true;
    phaselabel: string = "";
    eaactlabel: string = "";
    milestonelabel: string = "";
    anticipated_start_date: string = "";
    anticipated_end_date: string = "";
    milestone_id: string = "";
    milestone_type_name: string = "";
    isfixedevent: boolean = true;
    isendevent: boolean = true;
    phaseindex: string = "";
    duration: string = "";
    index: string = "";
    short_description: string = "";
    long_description: string = "";
    decision_id: string = "";
    start_date: string = "";
    end_date: string = "";
    is_active: boolean = true;
    is_complete: boolean = false;
    /**
     *
     */
    constructor(
       title: string
       ,phaselabel: string
       ,eaactlabel: string
       ,milestonelabel: string
       ,anticipated_start_date: string
       ,anticipated_end_date: string
       ,milestone_id: string
       ,milestone_type_name: string
       ,phaseindex: string
       ,index: string
       ,short_description: string
       ,long_description: string
       ,decision_id: string
       ,start_date: string
       ,end_date: string
       ,is_active: boolean = true
       ,is_complete: boolean = false
       ,isfixedevent: boolean = true
       ,isendevent: boolean = false
       ,allowEditing: boolean = true) {
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
            this.isendevent = isendevent ;
            this.allowEditing = !(this.end_date !== undefined && this.is_complete);
    }
}
export class Engagement {
    id: string = "";
    phase_label: string = "";
    title: string = "";
    start_date: string = "";
    end_date: string = "";
    phaseindex: string = "";
    correlationkey: string = "default";
    duration: string = "";
    milestone_type_name: string = "";
    start_at: string = "";

    work_engagements: any;
    phase_id: string = "";
    project_id: string = "";
    work_type_id: string = "";
    milestone_id: string = "";
    engagement_id: string = "";
    /**
     *
     */
    constructor(
        phase_label: string
        ,title: string
        ,start_date: string
        ,end_date: string
        ,phaseindex: string
        ,duration: string
        ,milestone_type_name: string
        ,start_at: string
        ,phase_id: string
        ,project_id: string
        ,work_type_id: string
        ,milestone_id: string
        ,engagement_id: string) {
        this.phase_label = phase_label;
        this.start_date = start_date;
        this.title = title;
        this.end_date = end_date;
        this.phaseindex = phaseindex;
        this.duration = duration;
        this.milestone_type_name = milestone_type_name;
        this.start_at = start_at;

        this.work_engagements = {
            id: ""
            ,phase_id: phase_id
            ,project_id: project_id
            ,work_type_id: work_type_id
            ,milestone_id: milestone_id
            ,engagement_id: engagement_id
        }
    }
}

export class Issue {
    id: string = "";
    title: string = "";
    short_description: string = "";
    long_description: string = "";
    start_date: string = "";
    anticipated_resolution_date: string = "";
    resolution_date: string = "";
    is_key_issue: boolean = false;
    is_sensitive: boolean = false;
    is_active: boolean = false;
    is_resolved: boolean = false;
    /**
     *
     */
    constructor(
        title: string
        ,short_description: string
        ,long_description: string
        ,start_date: string
        ,anticipated_resolution_date: string
        ,resolution_date: string
        ,is_key_issue: boolean = false
        ,is_sensitive: boolean = false
        ,is_active: boolean = false
        ,is_resolved: boolean = false
    ) {
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
export class StaffWorkRole {
    id: string = "";
    staff_id: string = "";
    role_id: string = "";
    position: string = "";
    phone: string = "";
    email: string = "";
    /**
     *
     */
    constructor(
        staff_id: string
        ,role_id: string
        ,position: string
        ,phone: string
        ,email: string) {
      this.staff_id = staff_id;
      this.role_id = role_id;
      this.position = position;
      this.phone = phone;
      this.email = email;
    }
}
export class IndigenousWork {
    id: string = "";
    indigenous_nation_id: string = "";
    indigenous_category_id: string = "";
    /**
     *
     */
    constructor(
        indigenous_nation_id: string
        ,indigenous_category_id: string
    ) {
        this.indigenous_nation_id = indigenous_nation_id;
        this.indigenous_category_id = indigenous_category_id;
    }
}

module.exports = {
    WorkFormData
    ,Work
    ,Phase
    ,Event
    ,Engagement
    ,Issue
    ,StaffWorkRole
    ,IndigenousWork
}