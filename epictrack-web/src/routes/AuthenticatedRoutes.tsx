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
import Example from "../components/user/UserList";
import UserList from "../components/user/UserList";
import CreateTemplateForm from "../components/task/template/CreateTemplateForm";
import TemplateList from "../components/task/template/TemplateList";
import { MasterProvider } from "../components/shared/MasterContext";

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
      <Route path="/list-management/projects" element={<ProjectList />} />
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
      <Route path="/list-management/proponents" element={<ProponentList />} />
      <Route path="/works" element={<WorkList />} />
      <Route path="/admin/users" element={<UserList />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthenticatedRoutes;
