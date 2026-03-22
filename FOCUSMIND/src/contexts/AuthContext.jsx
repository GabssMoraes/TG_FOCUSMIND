import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedAuth = localStorage.getItem('@FocusMind:auth');
        return storedAuth ? JSON.parse(storedAuth) : false;
    });

    const login = () => {
        setIsAuthenticated(true);
        localStorage.setItem('@FocusMind:auth', JSON.stringify(true));
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('@FocusMind:auth');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
