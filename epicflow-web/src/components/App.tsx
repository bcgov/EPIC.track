import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserService from '../services/userService';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import NavBar from './layout/NavBar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AnticipatedEAOSchedule from './anticipatedEAOSchedule';
import ReportSelector from './reportSelector';
import StaffForm from './staff/form/staffForm';
import StaffList from './staff/list/staffList';


export default function App() {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state: any) => state.user.authentication.authenticated);
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
                    </Routes>
                </Suspense>

            </BrowserRouter>}
        </>
    )
}