import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFound from "./NotFound";
import StaffList from "../components/staff/StaffList";
import AnticipatedEAOSchedule from "../components/reports/eaReferral/AnticipatedEAOSchedule";
import ResourceForecast from "../components/reports/resourceForecast/ResourceForecast";
import ThirtySixtyNinety from "../components/reports/30-60-90Report/ThirtySixtyNinety";
import IndigenousNationList from "../components/indigenousNation/IndigenousNationList";
import ProponentList from "../components/proponent/ProponentList";
import WorkList from "../components/work/WorkList";
import ProjectList from "../components/project/ProjectList";
import UserList from "../components/user/UserList";
import TemplateList from "../components/task/template/TemplateList";
import { MasterProvider } from "../components/shared/MasterContext";
import WorkStaffList from "../components/work/workStaff/WorkStaffList";
import WorkPlanContainer from "../components/workPlan/WorkPlanContainer";
import { WorkplanProvider } from "../components/workPlan/WorkPlanContext";

const AuthenticatedRoutes = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<Dashboard />} /> */}
      <Route
        path="/list-management/staffs"
        element={
          <MasterProvider key={"/list-management/staffs"}>
            <StaffList />
          </MasterProvider>
        }
      />
      <Route
        path="/list-management/projects"
        element={
          <MasterProvider key={"/list-management/projects"}>
            <ProjectList />
          </MasterProvider>
        }
      />
      <Route
        path="/reports/referral-schedule"
        element={<AnticipatedEAOSchedule />}
      />
      <Route path="/reports/resource-forecast" element={<ResourceForecast />} />
      <Route path="/reports/30-60-90" element={<ThirtySixtyNinety />} />
      <Route path="/templates" element={<TemplateList />} />
      <Route
        path="/list-management/indigenous-nations"
        element={
          <MasterProvider key={"/list-management/indigenous-nations"}>
            <IndigenousNationList />
          </MasterProvider>
        }
      />
      <Route
        path="/list-management/proponents"
        element={
          <MasterProvider key={"/list-management/proponents"}>
            <ProponentList />
          </MasterProvider>
        }
      />
      <Route
        path="/works"
        element={
          <MasterProvider key={"/works"}>
            <WorkList />
          </MasterProvider>
        }
      />
      <Route path="/list-management/work-staff" element={<WorkStaffList />} />
      <Route
        path="/work-plan"
        element={
          <WorkplanProvider>
            <WorkPlanContainer />
          </WorkplanProvider>
        }
      />
      <Route path="/admin/users" element={<UserList />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthenticatedRoutes;
