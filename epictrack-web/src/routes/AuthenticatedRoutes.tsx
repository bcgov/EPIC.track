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
import CreateTemplateForm from "../components/task/template/CreateTemplateForm";
import Example from "../components/user/UserList";
import UserList from "../components/user/UserList";

const AuthenticatedRoutes = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<Dashboard />} /> */}
      <Route path="/data-management/staffs" element={<StaffList />} />
      <Route path="/data-management/projects" element={<ProjectList />} />
      <Route
        path="/reporting/referral-schedule"
        element={<AnticipatedEAOSchedule />}
      />
      <Route
        path="/reporting/resource-forecast"
        element={<ResourceForecast />}
      />
      <Route path="/reporting/30-60-90" element={<ThirtySixtyNinety />} />
      <Route path="/templates" element={<CreateTemplateForm />} />
      <Route
        path="/data-management/indigenous-nations"
        element={<IndigenousNationList />}
      />
      <Route path="/data-management/proponents" element={<ProponentList />} />
      <Route path="/works" element={<WorkList />} />
      <Route path="/admin/users" element={<UserList />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthenticatedRoutes;
