import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/client';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({ ...decoded, token });
            } catch (e) {
                logout();
            }
        }
    }, []);

    async function login(username, password) {
        const res = await api.post('/login', { login: username, password });

        const { accessToken, refreshToken, isProfileComplete } = res.data;
        const decoded = jwtDecode(accessToken);

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser({ ...decoded, token: accessToken });

        return res.data;
    }

    async function register(username, password, role = 'KLIENT') {
        await api.post('/register', { login: username, password, role });
    }

    function logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    }

    const isEmployee = user?.role === 'PRACOWNIK';

    return (
        <AuthContext.Provider value={{ user, login, logout, register, isEmployee }}>
            {children}
        </AuthContext.Provider>
    );
}