import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import UserService from "../services/userService";
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import NavBar from "./layout/NavBar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AnticipatedEAOSchedule from "./anticipatedEAOSchedule";


export default function App() {
    console.log(process.env.REACT_APP_API_URL);
    const dispatch = useDispatch();
    useEffect(() => {
        UserService.initKeycloak(dispatch);
    }, [dispatch]);
    return (
        <>
            <BrowserRouter>
                <NavBar />
                <Routes>
                    <Route path="/anticipated-eao-schedule" element={<AnticipatedEAOSchedule />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}