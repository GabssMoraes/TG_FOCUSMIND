import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styles from './styles.module.css';

export default function SetupSubtopicos() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    const materia = searchParams.get('materia');

    const [loading, setLoading] = useState(true);
    const [subtopicos, setSubtopicos] = useState([]);
    const [selecionados, setSelecionados] = useState(new Set());
    const [adicionando, setAdicionando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) { navigate('/login'); return; }
        carregarSubtopicos();
    }, [userId]);

    const carregarSubtopicos = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/gerar-subtopicos`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error('Falha ao gerar sub-tópicos');
            const data = await res.json();
            const parsed = JSON.parse(data.subtopicos);
            setSubtopicos(parsed);
            // Seleciona todos por padrão
            setSelecionados(new Set(parsed.map((_, i) => i)));
        } catch (e) {
            setError('Não foi possível gerar o roteiro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelecionado = (idx) => {
        setSelecionados(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const handleAdicionarMetas = async () => {
        const topicosParaAdicionar = subtopicos.filter((_, i) => selecionados.has(i));
        if (topicosParaAdicionar.length === 0) {
            toast.error('Selecione pelo menos um sub-tópico!');
            return;
        }

        setAdicionando(true);
        let adicionados = 0;
        try {
            for (const topico of topicosParaAdicionar) {
                const res = await fetch('http://localhost:8080/api/metas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: parseInt(userId),
                        descricao: `${topico.titulo} — ${topico.descricao} (~${topico.tempoEstimadoHoras}h)`
                    })
                });
                if (res.ok) adicionados++;
            }
            toast.success(`${adicionados} sub-tópico(s) adicionado(s) como metas! 🎯`);
            navigate(`/dashboard`);
        } catch (e) {
            toast.error('Erro ao adicionar metas. Tente novamente.');
        } finally {
            setAdicionando(false);
        }
    };

    const totalHorasSelecionadas = subtopicos
        .filter((_, i) => selecionados.has(i))
        .reduce((sum, t) => sum + (t.tempoEstimadoHoras || 0), 0);

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <div className={styles.logoDot}></div>
                        FocusMind
                    </div>
                    <div className={styles.badge}>✨ Seu plano personalizado está pronto!</div>
                    <h1 className={styles.title}>
                        Roteiro de estudos para<br />
                        <span className={styles.materia}>{materia}</span>
                    </h1>
                    <p className={styles.subtitle}>
                        A IA gerou estes sub-tópicos para você. Selecione os que quer adicionar ao seu Dashboard como metas.
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className={styles.loadingBox}>
                        <div className={styles.spinner}></div>
                        <p className={styles.loadingText}>O FocusBot está criando seu roteiro personalizado...</p>
                        <p className={styles.loadingSubtext}>Analisando a matéria e seu tempo disponível</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className={styles.errorBox}>
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button className={styles.btnRetry} onClick={carregarSubtopicos}>
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* Aviso sobre sub-tópicos faltando */}
                {!loading && !error && subtopicos.length > 0 && (
                    <div className={styles.warningBox}>
                        <span className={styles.warningIcon}>💡</span>
                        <div>
                            <strong>Atenção:</strong> Esta lista pode não cobrir todos os tópicos que você precisa estudar.
                            Você pode adicionar mais metas manualmente no Dashboard a qualquer momento!
                        </div>
                    </div>
                )}

                {/* Lista de Sub-tópicos */}
                {!loading && !error && subtopicos.length > 0 && (
                    <>
                        <div className={styles.topicGrid}>
                            {subtopicos.map((topico, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.topicCard} ${selecionados.has(idx) ? styles.topicSelected : ''}`}
                                    onClick={() => toggleSelecionado(idx)}
                                >
                                    <div className={styles.topicCheck}>
                                        {selecionados.has(idx) ? (
                                            <span className={styles.checkmark}>✓</span>
                                        ) : (
                                            <span className={styles.checkEmpty}></span>
                                        )}
                                    </div>
                                    <div className={styles.topicOrder}>{topico.ordem || idx + 1}</div>
                                    <div className={styles.topicContent}>
                                        <div className={styles.topicTitle}>{topico.titulo}</div>
                                        <div className={styles.topicDesc}>{topico.descricao}</div>
                                    </div>
                                    <div className={styles.topicTime}>
                                        <span className={styles.timeIcon}>⏱</span>
                                        {topico.tempoEstimadoHoras}h
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Resumo e Ações */}
                        <div className={styles.footer}>
                            <div className={styles.summary}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryVal}>{selecionados.size}</span>
                                    <span className={styles.summaryLabel}>selecionados</span>
                                </div>
                                <div className={styles.summaryDivider} />
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryVal}>{totalHorasSelecionadas}h</span>
                                    <span className={styles.summaryLabel}>tempo total</span>
                                </div>
                                <div className={styles.summaryDivider} />
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryVal}>{subtopicos.length - selecionados.size}</span>
                                    <span className={styles.summaryLabel}>não selecionados</span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={styles.btnSkip}
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Pular por agora
                                </button>
                                <button
                                    className={styles.btnAdd}
                                    onClick={handleAdicionarMetas}
                                    disabled={adicionando || selecionados.size === 0}
                                >
                                    {adicionando ? (
                                        <><span className={styles.btnSpinner}></span> Adicionando...</>
                                    ) : (
                                        <>Adicionar ao Dashboard 🎯</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
