import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            toast.error("Por favor, digite um e-mail válido!");
            return;
        }
        if (!password) {
            toast.error("Por favor, digite sua senha!");
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                toast.error(errorMsg);
                return;
            }

            login();
            toast.success("Login aprovado!");
            navigate('/dashboard');
        } catch (error) {
            toast.error("Servidor Spring Boot offline!");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.loginCard}>
                <div className={styles.logo}>
                    <div className={styles.logoDot}></div>
                    FocusMind
                </div>
                <p className={styles.subtitle}>Bem-vindo de volta! Faça login para continuar o seu foco.</p>

                <form onSubmit={handleLogin} noValidate>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            className={styles.input}
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <a href="#" className={styles.forgotPassword}>Esqueci minha senha</a>
                    </div>

                    <button type="submit" className={styles.btnPrimary}>
                        Entrar
                    </button>
                </form>

                <div className={styles.footerText}>
                    Ainda não tem uma conta? <a href="#" onClick={(e) => {
                        e.preventDefault();
                        navigate('/register');
                    }}>Cadastre-se</a>
                </div>
            </div>
        </div>
    );
}

export default Login;