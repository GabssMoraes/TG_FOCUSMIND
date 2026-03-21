import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "../components/Header/index.jsx";
import Home from "../pages/Home/index.jsx";
//import Login from "../pages/Login/index.jsx";
import Dashboard from "../pages/Dashboard/index.jsx";
import Chat from "../pages/Chat/index.jsx";
import Profile from "../pages/Profile/index.jsx";
import Timer from "../pages/Timer/index.jsx";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                {/* <Route path="/login" element={<Login />} />*/}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/timer" element={<Timer />} />
            </Routes>
        </BrowserRouter>
    );
}