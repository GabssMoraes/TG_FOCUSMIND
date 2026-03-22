import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { toastConfig } from "../config/toast.js";

import { AuthProvider, useAuth } from "../contexts/AuthContext.jsx";

import Header from "../components/Header/index.jsx";
import Home from "../pages/Home/index.jsx";
import Login from "../pages/Login/index.jsx";
import Dashboard from "../pages/Dashboard/index.jsx";
import Chat from "../pages/Chat/index.jsx";
import Profile from "../pages/Profile/index.jsx";
import Timer from "../pages/Timer/index.jsx";
import Cadastro from "../pages/Cadastro/index.jsx";

function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function AppRoutes() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Header />
                <Toaster {...toastConfig} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Cadastro />} />

                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/timer" element={<PrivateRoute><Timer /></PrivateRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}