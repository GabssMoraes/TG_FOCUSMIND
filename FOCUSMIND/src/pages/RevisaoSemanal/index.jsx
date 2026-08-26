import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import { formatMessage } from '../../utils/formatters';
import styles from './styles.module.css';

const SUGGESTIONS = {
    1: ["Cumpri minhas metas", "Estudei sem celular", "Fiz pausas no Pomodoro", "Dormi bem"],
    2: ["Procrastinei muito", "Usei redes sociais no estudo", "Cansaço excessivo", "Não fiz as pausas"],
    3: ["Estudar em blocos menores", "Deixar celular em outro cômodo", "Fazer revisão antes de dormir"]
};

export default function RevisaoSemanal() {
    const { userId } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    
    const [oQueFoiBem, setOQueFoiBem] = useState('');
    const [oQueNaoSaiuComoPlanejado, setOQueNaoSaiuComoPlanejado] = useState('');
    const [oQueAjustar, setOQueAjustar] = useState('');
    
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ metas: 0, sessoes: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Carrega o histórico de revisões
    const loadHistory = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/revisoes?userId=${userId}`);
            if (res.ok) setHistory(await res.json());
        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
        }
    }, [userId]);

    // Carrega estatísticas da semana para ajudar na reflexão
    const loadStats = useCallback(async () => {
        if (!userId) return;
        try {
            // Conta sessões dos últimos 7 dias
            const resSessao = await fetch(`http://localhost:8080/api/sessoes?userId=${userId}`);
            let sessoesCount = 0;
            if (resSessao.ok) {
                const sessoes = await resSessao.json();
                const seteDiasAtras = new Date();
                seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
                sessoesCount = sessoes.filter(s => s.foiConcluida && new Date(s.data) >= seteDiasAtras).length;
            }

            // Conta metas dos últimos 7 dias
            const resMeta = await fetch(`http://localhost:8080/api/metas?userId=${userId}`);
            let metasCount = 0;
            if (resMeta.ok) {
                const metas = await resMeta.json();
                // Assumindo que metas concluídas ficam com status 'C'
                metasCount = metas.filter(m => m.status === 'C').length; 
            }

            setStats({ metas: metasCount, sessoes: sessoesCount });
        } catch (error) {
            console.error("Erro ao carregar stats:", error);
        }
    }, [userId]);

    useEffect(() => {
        loadHistory();
        loadStats();
    }, [loadHistory, loadStats]);

    const handleNext = (e) => {
        e.preventDefault();
        if (currentStep === 1 && !oQueFoiBem.trim()) {
            toast.error("Me conte pelo menos uma coisa boa!");
            return;
        }
        if (currentStep === 2 && !oQueNaoSaiuComoPlanejado.trim()) {
            toast.error("O que não deu certo? Seja sincero!");
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrev = (e) => {
        e.preventDefault();
        setCurrentStep(prev => prev - 1);
    };

    const handleChipClick = (suggestion) => {
        if (currentStep === 1) setOQueFoiBem(prev => prev ? `${prev}, ${suggestion}` : suggestion);
        if (currentStep === 2) setOQueNaoSaiuComoPlanejado(prev => prev ? `${prev}, ${suggestion}` : suggestion);
        if (currentStep === 3) setOQueAjustar(prev => prev ? `${prev}, ${suggestion}` : suggestion);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!oQueAjustar.trim()) {
            toast.error("O que você vai ajustar?");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("FocusBot analisando sua revisão...");

        try {
            const response = await fetch('http://localhost:8080/api/revisoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, oQueFoiBem, oQueNaoSaiuComoPlanejado, oQueAjustar })
            });

            if (response.ok) {
                toast.dismiss(loadingToast);
                toast.success("Revisão registrada! +30 moedas ganhas 🪙");
                setOQueFoiBem('');
                setOQueNaoSaiuComoPlanejado('');
                setOQueAjustar('');
                setCurrentStep(1);
                loadHistory();
            } else {
                toast.dismiss(loadingToast);
                toast.error("Erro ao registrar revisão semanal.");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Erro ao conectar ao servidor.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}><Icon name="review" style={{ marginRight: '8px' }} /> Revisão Metacognitiva</h2>
                <p className={styles.desc}>
                    A reflexão é o primeiro passo para vencer a procrastinação. Faça isso em 3 passos simples.
                </p>
            </div>

            <div className={styles.layout}>
                {/* ── Painel Esquerdo: Formulário Wizard + Estatísticas ── */}
                <div className={styles.leftCol}>
                    
                    {/* Estatísticas da Semana */}
                    <div className={styles.statsCard}>
                        <h4 className={styles.statsTitle}>Nesta última semana, você:</h4>
                        <div className={styles.statsRow}>
                            <div className={styles.statItem}>
                                <Icon name="target" style={{ color: '#4ecdc4', fontSize: '1.2rem' }} />
                                <div><strong>{stats.metas}</strong> metas concluídas</div>
                            </div>
                            <div className={styles.statItem}>
                                <Icon name="timer" style={{ color: '#ff6b6b', fontSize: '1.2rem' }} />
                                <div><strong>{stats.sessoes}</strong> sessões focadas</div>
                            </div>
                        </div>
                    </div>

                    {/* Wizard Form */}
                    <div className={styles.card}>
                        <div className={styles.wizardHeader}>
                            <div className={`${styles.stepIndicator} ${currentStep >= 1 ? styles.activeStep : ''}`}>1</div>
                            <div className={styles.stepLine}></div>
                            <div className={`${styles.stepIndicator} ${currentStep >= 2 ? styles.activeStep : ''}`}>2</div>
                            <div className={styles.stepLine}></div>
                            <div className={`${styles.stepIndicator} ${currentStep >= 3 ? styles.activeStep : ''}`}>3</div>
                        </div>

                        <form onSubmit={currentStep === 3 ? handleSubmit : handleNext}>
                            {currentStep === 1 && (
                                <div className={styles.stepContent}>
                                    <h3 className={styles.stepTitle}>O que deu muito certo esta semana?</h3>
                                    <p className={styles.stepDesc}>Reconheça suas pequenas vitórias. O que você conseguiu fazer que te orgulha?</p>
                                    <textarea
                                        className={styles.textarea}
                                        rows="4"
                                        placeholder="Ex: Consegui focar 3 sessões sem celular..."
                                        value={oQueFoiBem}
                                        onChange={(e) => setOQueFoiBem(e.target.value)}
                                        disabled={isSubmitting}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className={styles.stepContent}>
                                    <h3 className={styles.stepTitle}>O que não saiu conforme planejado?</h3>
                                    <p className={styles.stepDesc}>Sem julgamentos. Entender onde falhamos ajuda a evitar os mesmos gatilhos.</p>
                                    <textarea
                                        className={styles.textarea}
                                        rows="4"
                                        placeholder="Ex: Procrastinei na quinta à tarde por cansaço..."
                                        value={oQueNaoSaiuComoPlanejado}
                                        onChange={(e) => setOQueNaoSaiuComoPlanejado(e.target.value)}
                                        disabled={isSubmitting}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className={styles.stepContent}>
                                    <h3 className={styles.stepTitle}>O que você pretende ajustar?</h3>
                                    <p className={styles.stepDesc}>Quais pequenas mudanças práticas você pode tentar semana que vem?</p>
                                    <textarea
                                        className={styles.textarea}
                                        rows="4"
                                        placeholder="Ex: Fazer blocos de estudo mais curtos (15 min)..."
                                        value={oQueAjustar}
                                        onChange={(e) => setOQueAjustar(e.target.value)}
                                        disabled={isSubmitting}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {/* Chips de Sugestão */}
                            <div className={styles.chipsContainer}>
                                {SUGGESTIONS[currentStep].map((sug, i) => (
                                    <div key={i} className={styles.chip} onClick={() => handleChipClick(sug)}>
                                        <Icon name="plus" style={{ fontSize: '0.7rem' }} /> {sug}
                                    </div>
                                ))}
                            </div>

                            {/* Controles */}
                            <div className={styles.wizardControls}>
                                {currentStep > 1 ? (
                                    <button type="button" className={styles.btnSecondary} onClick={handlePrev} disabled={isSubmitting}>
                                        <Icon name="chevron-left" /> Voltar
                                    </button>
                                ) : <div />}
                                
                                {currentStep < 3 ? (
                                    <button type="button" className={styles.btnPrimary} onClick={handleNext}>
                                        Próximo passo <Icon name="check" style={{ marginLeft: '6px' }} />
                                    </button>
                                ) : (
                                    <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                                        {isSubmitting ? "Processando..." : <span>Concluir e Ganhar <Icon name="coins" /></span>}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* ── Painel Direito: Histórico ── */}
                <div className={styles.historyCol}>
                    <div className={styles.card} style={{ height: '100%' }}>
                        <h3 className={styles.cardTitle}><Icon name="history" style={{ marginRight: '8px' }} /> Histórico de Reflexões</h3>
                        <div className={styles.historyList}>
                            {history.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: '#7a8099', textAlign: 'center', padding: '20px 0' }}>
                                    Nenhuma revisão registrada ainda.
                                </p>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className={styles.reviewItem}>
                                        <div className={styles.reviewHeader}>
                                            <span className={styles.reviewDate}>{formatDate(item.dataRegistro)}</span>
                                            <span className={styles.reviewCoins}>+30 <Icon name="coins" style={{ color: '#f7c59f' }} /></span>
                                        </div>

                                        <div className={styles.reviewBlock}>
                                            <div className={styles.reviewQ}>O que foi bem:</div>
                                            <div className={styles.reviewA}>{item.oQueFoiBem}</div>
                                        </div>
                                        <div className={styles.reviewBlock}>
                                            <div className={styles.reviewQ}>O que não deu certo:</div>
                                            <div className={styles.reviewA}>{item.oQueNaoSaiuComoPlanejado}</div>
                                        </div>
                                        <div className={styles.reviewBlock}>
                                            <div className={styles.reviewQ}>Ajustes:</div>
                                            <div className={styles.reviewA}>{item.oQueAjustar}</div>
                                        </div>

                                        {item.resumoIA && (
                                            <div className={styles.aiResponse}>
                                                <div className={styles.aiHeader}>
                                                    <Icon name="bot" /> FocusBot diz:
                                                </div>
                                                <div 
                                                    className={styles.aiContent}
                                                    dangerouslySetInnerHTML={{ __html: formatMessage(item.resumoIA) }} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
