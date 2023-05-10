import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFound from "./NotFound";
import StaffList from "../components/staff/StaffList";
import AnticipatedEAOSchedule from "../components/reports/eaReferral/AnticipatedEAOSchedule";
import ResourceForecast from "../components/reports/resourceForecast/ResourceForecast";
import ThirtySixtyNinety from "../components/reports/30-60-90Report/ThirtySixtyNinety";
import IndigenousNationList from "../components/indigenousNation/IndigenousNationList";
import ProponentList from "../components/proponent/ProponentList";

const AuthenticatedRoutes = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<Dashboard />} /> */}
      <Route path="/data-management/staffs" element={<StaffList />} />
      <Route
        path="/reporting/referral-schedule"
        element={<AnticipatedEAOSchedule />}
      />
      <Route
        path="/reporting/resource-forecast"
        element={<ResourceForecast />}
      />
      <Route path="/reporting/30-60-90" element={<ThirtySixtyNinety />} />
      {/* <Route path="/surveys" element={<SurveyListing />} />
            <Route path="/surveys/create" element={<CreateSurvey />} />
            <Route path="/surveys/:surveyId/build" element={<SurveyFormBuilder />} />
            <Route path="/surveys/:surveyId/submit" element={<SurveySubmit />} />
            <Route path="/surveys/:surveyId/comments" element={<CommentReviewListing />} />
            <Route path="/surveys/:surveyId/comments/all" element={<CommentTextListing />} />
            <Route path="/surveys/:surveyId/submissions/:submissionId/review" element={<CommentReview />} /> */}
      <Route
        path="/data-management/indigenous-nations"
        element={<IndigenousNationList />}
      />
      <Route path="/data-management/proponents" element={<ProponentList />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthenticatedRoutes;
