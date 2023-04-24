import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserService from '../services/userService';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AnticipatedEAOSchedule from './reports/eaReferral/anticipatedEAOSchedule';
import ReportSelector from './reportSelector/reportSelector';
import StaffForm from './staff/form/staffForm';
import StaffList from './staff/list/staffList';
import NavBar from './layout/NavBar';
import { RootState } from '../store';
import ProjectForm from './project/form/projectForm';
import ProjectList from './project/list/projectList';
import ReportSample from './reports/30-60-90Report/thirtySixtyNinety';

export default function App() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) =>
    state.user.authentication.authenticated);
  useEffect(() => {
    UserService.initKeycloak(dispatch);
  }, [dispatch]);
  return (
    <>
      {isLoggedIn && <BrowserRouter>
        <NavBar />
        <Suspense fallback={'Lazy loading pages ...'}>
          <Routes>
            <Route path='/anticipated-eao-schedule' element={<AnticipatedEAOSchedule />} />
            <Route path='/report-selector' element={<ReportSelector />} />
            <Route path='/staff' element={<StaffForm />} />
            <Route path='/staff-list' element={<StaffList />} />
            <Route path='/project' element={<ProjectForm />} />
            <Route path='/project-list' element={<ProjectList />} />
            <Route path='/report-30-60-90' element={<ReportSample />} />
          </Routes>
        </Suspense>
      </BrowserRouter>}
    </>
  )
}