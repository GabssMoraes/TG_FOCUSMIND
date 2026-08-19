import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import styles from './styles.module.css';

function Cadastro() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Etapa 1 — Conta
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Etapa 2 — Perfil de Estudo
    const [materiaEstudo, setMateriaEstudo] = useState('');
    const [horasDiaDisponiveis, setHorasDiaDisponiveis] = useState('');
    const [dataLimiteEstudo, setDataLimiteEstudo] = useState('');
    const [tempoTotalEstudoHoras, setTempoTotalEstudoHoras] = useState('');

    const handleEtapa1 = (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { toast.error("Por favor, digite um e-mail válido!"); return; }
        if (password !== confirmPassword) { toast.error("As senhas não coincidem!"); return; }
        if (password.length < 7) { toast.error("A senha deve ter pelo menos 7 caracteres!"); return; }
        setStep(2);
    };

    const handleCadastroFinal = async (e) => {
        e.preventDefault();
        if (!materiaEstudo.trim()) { toast.error("Informe o que você vai estudar!"); return; }
        if (!horasDiaDisponiveis || parseInt(horasDiaDisponiveis) < 1) { toast.error("Informe quantas horas por dia você pode estudar!"); return; }
        if (!dataLimiteEstudo) { toast.error("Informe a data limite para concluir seus estudos!"); return; }

        try {
            const response = await fetch('http://localhost:8080/api/usuarios/cadastrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    materiaEstudo,
                    horasDiaDisponiveis: parseInt(horasDiaDisponiveis),
                    dataLimiteEstudo,
                    tempoTotalEstudoHoras: tempoTotalEstudoHoras ? parseInt(tempoTotalEstudoHoras) : null
                })
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                toast.error(errorMsg);
                return;
            }

            const userId = await response.text();
            toast.success("Conta criada! Vamos configurar seu plano de estudos 🚀");
            navigate(`/setup-subtopicos?userId=${userId}&materia=${encodeURIComponent(materiaEstudo)}`);
        } catch (error) {
            toast.error("Erro: A API parece estar offline. Ligue o Spring Boot!");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.cadastroCard}>
                <div className={styles.logo}>
                    <div className={styles.logoDot}></div>
                    FocusMind
                </div>

                {/* Indicador de Steps */}
                <div className={styles.stepIndicator}>
                    <div className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>
                        <span>1</span>
                    </div>
                    <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : ''}`} />
                    <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}>
                        <span>2</span>
                    </div>
                </div>
                <p className={styles.stepLabel}>
                    {step === 1 ? 'Crie sua conta' : 'Configure seu plano de estudos'}
                </p>

                {/* ─── ETAPA 1: Conta ─── */}
                {step === 1 && (
                    <form onSubmit={handleEtapa1} noValidate>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Nome completo</label>
                            <input type="text" id="name" className={styles.input}
                                placeholder="ex: João da Silva" value={name}
                                onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">E-mail</label>
                            <input type="email" id="email" className={styles.input}
                                placeholder="seu@email.com" value={email}
                                onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Senha</label>
                            <input type="password" id="password" className={styles.input}
                                placeholder="Mínimo 7 caracteres" value={password}
                                onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirmar senha</label>
                            <input type="password" id="confirmPassword" className={styles.input}
                                placeholder="Repita sua senha" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className={styles.btnPrimary}>
                            Próximo →
                        </button>
                    </form>
                )}

                {/* ─── ETAPA 2: Perfil de Estudo ─── */}
                {step === 2 && (
                    <form onSubmit={handleCadastroFinal} noValidate>
                        <div className={styles.studyInfoBox}>
                            <span className={styles.studyInfoIcon}>🤖</span>
                            <p>Com essas informações, vou gerar um roteiro de estudos personalizado pra você com a IA!</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="materiaEstudo">O que você vai estudar?</label>
                            <input type="text" id="materiaEstudo" className={styles.input}
                                placeholder="ex: Cálculo Diferencial, Direito Civil, Python..."
                                value={materiaEstudo}
                                onChange={(e) => setMateriaEstudo(e.target.value)} required />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="horasDia">Horas por dia disponíveis</label>
                                <input type="number" id="horasDia" className={styles.input}
                                    placeholder="ex: 3" min="1" max="16"
                                    value={horasDiaDisponiveis}
                                    onChange={(e) => setHorasDiaDisponiveis(e.target.value)} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="totalHoras">Total de horas (opcional)</label>
                                <input type="number" id="totalHoras" className={styles.input}
                                    placeholder="ex: 60" min="1"
                                    value={tempoTotalEstudoHoras}
                                    onChange={(e) => setTempoTotalEstudoHoras(e.target.value)} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="dataLimite">Data limite para concluir</label>
                            <input type="date" id="dataLimite" className={styles.input}
                                min={new Date().toISOString().split('T')[0]}
                                value={dataLimiteEstudo}
                                onChange={(e) => setDataLimiteEstudo(e.target.value)} required />
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" className={styles.btnSecondary}
                                onClick={() => setStep(1)}>
                                ← Voltar
                            </button>
                            <button type="submit" className={styles.btnPrimary} style={{ flex: 1 }}>
                                Gerar meu plano 🚀
                            </button>
                        </div>
                    </form>
                )}

                <div className={styles.footerText}>
                    Já tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Faça login</a>
                </div>
            </div>
        </div>
    );
}

export default Cadastro;