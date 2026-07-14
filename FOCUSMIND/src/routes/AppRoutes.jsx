import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { toastConfig } from "../config/toast.js";

import { AuthProvider, useAuth } from "../contexts/AuthContext.jsx";

import PublicHeader from "../components/Header/index.jsx";
import AppLayout from "../components/AppLayout/index.jsx";

import Home from "../pages/Home/index.jsx";
import Login from "../pages/Login/index.jsx";
import Cadastro from "../pages/Cadastro/index.jsx";
import Dashboard from "../pages/Dashboard/index.jsx";
import Chat from "../pages/Chat/index.jsx";
import Profile from "../pages/Profile/index.jsx";
import Timer from "../pages/Timer/index.jsx";
import RevisaoSemanal from "../pages/RevisaoSemanal/index.jsx";
import TimeBlocking from "../pages/TimeBlocking/index.jsx";
import LojaRecompensas from "../pages/LojaRecompensas/index.jsx";

function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicLayout({ children }) {
    return (
        <>
            <PublicHeader />
            {children}
        </>
    );
}

export default function AppRoutes() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster {...toastConfig} />
                <Routes>
                    {/* ── Rotas Públicas (com header simples) ── */}
                    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                    <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                    <Route path="/register" element={<PublicLayout><Cadastro /></PublicLayout>} />

                    {/* ── Rotas Privadas (com AppLayout = sidebar + topbar) ── */}
                    <Route path="/dashboard" element={
                        <PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>
                    } />
                    <Route path="/timer" element={
                        <PrivateRoute><AppLayout><Timer /></AppLayout></PrivateRoute>
                    } />
                    <Route path="/timeblocking" element={
                        <PrivateRoute><AppLayout><TimeBlocking /></AppLayout></PrivateRoute>
                    } />
                    <Route path="/revisao" element={
                        <PrivateRoute><AppLayout><RevisaoSemanal /></AppLayout></PrivateRoute>
                    } />
                    <Route path="/chat" element={
                        <PrivateRoute><AppLayout><Chat /></AppLayout></PrivateRoute>
                    } />
                    <Route path="/loja" element={
                        <PrivateRoute><AppLayout><LojaRecompensas /></AppLayout></PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}