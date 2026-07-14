import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedAuth = localStorage.getItem('@FocusMind:auth');
        return storedAuth ? JSON.parse(storedAuth) : false;
    });

    const [userId, setUserId] = useState(() => {
        const storedId = localStorage.getItem('@FocusMind:userId');
        return storedId ? parseInt(storedId, 10) : null;
    });

    const login = (id) => {
        setIsAuthenticated(true);
        setUserId(parseInt(id, 10));
        localStorage.setItem('@FocusMind:auth', JSON.stringify(true));
        localStorage.setItem('@FocusMind:userId', id.toString());
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserId(null);
        localStorage.removeItem('@FocusMind:auth');
        localStorage.removeItem('@FocusMind:userId');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
