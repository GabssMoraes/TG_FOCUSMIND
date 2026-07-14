import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import styles from './styles.module.css';

export default function RevisaoSemanal() {
    const { userId } = useAuth();

    const [oQueFoiBem, setOQueFoiBem] = useState('');
    const [oQueNaoSaiuComoPlanejado, setOQueNaoSaiuComoPlanejado] = useState('');
    const [oQueAjustar, setOQueAjustar] = useState('');
    const [history, setHistory] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadHistory = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/revisoes?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Erro ao carregar histórico de revisões:", error);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!oQueFoiBem.trim() || !oQueNaoSaiuComoPlanejado.trim() || !oQueAjustar.trim()) {
            toast.error("Por favor, preencha todos os campos da reflexão!");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("FocusBot analisando sua revisão semanal...");

        try {
            const response = await fetch('http://localhost:8080/api/revisoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    oQueFoiBem,
                    oQueNaoSaiuComoPlanejado,
                    oQueAjustar
                })
            });

            if (response.ok) {
                toast.dismiss(loadingToast);
                toast.success("Revisão registrada! +30 moedas ganhas 🪙");
                setOQueFoiBem('');
                setOQueNaoSaiuComoPlanejado('');
                setOQueAjustar('');
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
                <h2 className={styles.title}><Icon name="review" style={{ marginRight: '8px' }} /> Revisão Metacognitiva Semanal</h2>
                <p className={styles.desc}>
                    A reflexão periódica é crucial para entender seus padrões de produtividade, reorganizar prioridades e vencer a procrastinação.
                </p>
            </div>

            <div className={styles.layout}>

                {/* Formulário */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}><Icon name="brain" style={{ marginRight: '8px' }} /> Sua Reflexão</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>1. O que deu muito certo esta semana?</label>
                            <textarea
                                className={styles.textarea}
                                rows="3"
                                placeholder="Ex: Consegui focar 3 sessões de Cálculo sem mexer no celular..."
                                value={oQueFoiBem}
                                onChange={(e) => setOQueFoiBem(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>2. O que não saiu conforme planejado?</label>
                            <textarea
                                className={styles.textarea}
                                rows="3"
                                placeholder="Ex: Procrastinei na quinta-feira à tarde por cansaço..."
                                value={oQueNaoSaiuComoPlanejado}
                                onChange={(e) => setOQueNaoSaiuComoPlanejado(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>3. O que você pretende ajustar para a próxima semana?</label>
                            <textarea
                                className={styles.textarea}
                                rows="3"
                                placeholder="Ex: Fazer blocos de estudo mais curtos de 15 min nas matérias difíceis..."
                                value={oQueAjustar}
                                onChange={(e) => setOQueAjustar(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.btnSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "FocusBot Processando..." : <span>Submeter e Ganhar <Icon name="coins" style={{ marginLeft: '4px' }} /></span>}
                        </button>
                    </form>
                </div>

                {/* Histórico */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}><Icon name="history" style={{ marginRight: '8px' }} /> Histórico de Reflexões</h3>
                    <div style={{ maxHeight: '490px', overflowY: 'auto', paddingRight: '5px' }}>
                        {history.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: '#7a8099', textAlign: 'center', padding: '20px 0' }}>
                                Nenhuma revisão registrada ainda. Faça sua reflexão ao lado!
                            </p>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className={styles.reviewItem}>
                                    <div className={styles.reviewHeader}>
                                        <span className={styles.reviewDate}>{formatDate(item.dataRegistro)}</span>
                                        <span className={styles.reviewCoins}>+30 moedas <Icon name="coins" style={{ color: '#f7c59f' }} /></span>
                                    </div>

                                    <div className={styles.reviewQ}>O que foi bem:</div>
                                    <div className={styles.reviewA}>{item.oQueFoiBem}</div>

                                    <div className={styles.reviewQ}>O que não deu certo:</div>
                                    <div className={styles.reviewA}>{item.oQueNaoSaiuComoPlanejado}</div>

                                    <div className={styles.reviewQ}>Ajustes futuros:</div>
                                    <div className={styles.reviewA}>{item.oQueAjustar}</div>

                                    {item.resumoIA && (
                                        <div className={styles.aiResponse}>
                                            <strong><Icon name="bot" /> FocusBot:</strong><br />
                                            {item.resumoIA}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
