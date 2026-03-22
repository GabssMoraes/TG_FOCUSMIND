import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import styles from './styles.module.css';

function Cadastro() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleVerifica = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            toast.error("Por favor, digite um e-mail válido!");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem!");
            return;
        }

        if (password.length < 7) {
            toast.error("A senha deve ter pelo menos 7 caracteres!");
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/usuarios/cadastrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!response.ok) {
                // Caso o backend lance uma exceção (throw new Exception("Email já está em uso!"))
                const errorMsg = await response.text();
                toast.error(errorMsg);
                return;
            }

            toast.success("Bem-vindo(a) ao FocusMind!");
            navigate('/login');
        } catch (error) {
            toast.error("Erro fatal: A API parece estar offline. Ligue o Spring Boot!");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.cadastroCard}>
                <div className={styles.logo}>
                    <div className={styles.logoDot}></div>
                    FocusMind
                </div>
                <p className={styles.subtitle}>Crie sua conta e revolucione sua forma de estudar.</p>

                <form onSubmit={handleVerifica} noValidate>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Nome completo</label>
                        <input
                            type="text"
                            id="name"
                            className={styles.input}
                            placeholder="ex: Teste da Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                            placeholder="Crie uma senha forte"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirmar senha</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={styles.input}
                            placeholder="Repita sua senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.btnPrimary}>
                        Criar conta
                    </button>
                </form>

                <div className={styles.footerText}>
                    Já tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Faça login</a>
                </div>
            </div>
        </div>
    );
}

export default Cadastro;