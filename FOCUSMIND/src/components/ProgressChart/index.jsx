import React, { useState, useEffect } from 'react';
import Icon from '../Icon';
import styles from './styles.module.css';

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function ProgressChart({ userId }) {
    const [weekData, setWeekData] = useState([]);
    const [metasData, setMetasData] = useState([]);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [totalSessions, setTotalSessions] = useState(0);
    const [totalMetasDone, setTotalMetasDone] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('foco'); // 'foco' | 'metas'

    useEffect(() => {
        if (!userId) return;
        loadWeeklyData();
    }, [userId]);

    const loadWeeklyData = async () => {
        setIsLoading(true);
        try {
            // Calcula os 7 dias da semana atual (seg–dom)
            const now = new Date();
            const monday = new Date(now);
            monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
            monday.setHours(0, 0, 0, 0);

            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                weekDays.push(d.toISOString().split('T')[0]);
            }

            // Sessões
            const sessRes = await fetch(`http://localhost:8080/api/sessoes?userId=${userId}`);
            let sessData = [];
            if (sessRes.ok) sessData = await sessRes.json();

            const focusByDay = weekDays.map(day => {
                let mins = 0;
                let count = 0;
                sessData.forEach(s => {
                    if (s.foiConcluida && s.data && s.data.startsWith(day) && s.tempoReal) {
                        const parts = s.tempoReal.split(':');
                        mins += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                        count++;
                    }
                });
                return { day, mins, count };
            });

            // Metas
            const metasRes = await fetch(`http://localhost:8080/api/metas?userId=${userId}`);
            let metasAll = [];
            if (metasRes.ok) metasAll = await metasRes.json();

            const metasByDay = weekDays.map(day => {
                let done = 0;
                let created = 0;
                metasAll.forEach(m => {
                    if (m.dataConclusao && m.dataConclusao.startsWith(day)) done++;
                    if (m.dataCriacao && m.dataCriacao.startsWith(day)) created++;
                });
                return { day, done, created };
            });

            setWeekData(focusByDay);
            setMetasData(metasByDay);
            setTotalMinutes(focusByDay.reduce((a, b) => a + b.mins, 0));
            setTotalSessions(focusByDay.reduce((a, b) => a + b.count, 0));
            setTotalMetasDone(metasByDay.reduce((a, b) => a + b.done, 0));
        } catch (e) {
            console.error('Erro ao carregar dados semanais:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (min) => {
        if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}m`;
        return `${min}m`;
    };

    // Dados para o gráfico de barras
    const barData = activeTab === 'foco'
        ? weekData.map(d => d.mins)
        : metasData.map(d => d.done);

    const maxVal = Math.max(...barData, 1);

    // Média
    const avg = barData.length > 0
        ? (barData.reduce((a, b) => a + b, 0) / barData.length)
        : 0;

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>
                    <div className={styles.loadingDots}>
                        <span /><span /><span />
                    </div>
                    <p>Carregando progresso...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header com tabs */}
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <div className={styles.iconWrap}><Icon name="fa-solid fa-chart-bar" /></div>
                    <h2>Progresso Semanal</h2>
                </div>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'foco' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('foco')}
                    >
                        <Icon name="timer" style={{ fontSize: '0.75rem' }} /> Foco
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'metas' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('metas')}
                    >
                        <Icon name="target" style={{ fontSize: '0.75rem' }} /> Metas
                    </button>
                </div>
            </div>

            {/* Resumo rápido */}
            <div className={styles.summaryRow}>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryVal} style={{ color: '#4ecdc4' }}>
                        {activeTab === 'foco' ? formatTime(totalMinutes) : totalMetasDone}
                    </span>
                    <span className={styles.summaryLabel}>
                        {activeTab === 'foco' ? 'tempo total' : 'concluídas'}
                    </span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryItem}>
                    <span className={styles.summaryVal} style={{ color: '#7c6cfa' }}>
                        {activeTab === 'foco' ? totalSessions : metasData.reduce((a, b) => a + b.created, 0)}
                    </span>
                    <span className={styles.summaryLabel}>
                        {activeTab === 'foco' ? 'sessões' : 'criadas'}
                    </span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryItem}>
                    <span className={styles.summaryVal} style={{ color: '#f7c59f' }}>
                        {activeTab === 'foco'
                            ? formatTime(Math.round(avg))
                            : avg.toFixed(1)}
                    </span>
                    <span className={styles.summaryLabel}>média/dia</span>
                </div>
            </div>

            {/* Gráfico de barras SVG */}
            <div className={styles.chartWrap}>
                <svg viewBox="0 0 350 140" className={styles.chartSvg} preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id="barGradFoco" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7c6cfa" />
                            <stop offset="100%" stopColor="#4ecdc4" />
                        </linearGradient>
                        <linearGradient id="barGradMetas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f7c59f" />
                            <stop offset="100%" stopColor="#ff6b6b" />
                        </linearGradient>
                    </defs>

                    {/* Linha média */}
                    {avg > 0 && (
                        <>
                            <line
                                x1="30" y1={110 - (avg / maxVal) * 90}
                                x2="340" y2={110 - (avg / maxVal) * 90}
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="4 4"
                                strokeWidth="1"
                            />
                            <text
                                x="26" y={110 - (avg / maxVal) * 90 - 4}
                                fill="rgba(255,255,255,0.25)"
                                fontSize="8"
                                textAnchor="end"
                            >
                                avg
                            </text>
                        </>
                    )}

                    {/* Barras */}
                    {barData.map((val, i) => {
                        const barW = 30;
                        const gap = (310 - 7 * barW) / 6;
                        const x = 35 + i * (barW + gap);
                        const barH = maxVal > 0 ? (val / maxVal) * 90 : 0;
                        const y = 110 - barH;
                        const isToday = i === ((new Date().getDay() + 6) % 7);

                        return (
                            <g key={i}>
                                {/* Fundo da barra */}
                                <rect
                                    x={x} y={20} width={barW} height={90}
                                    rx="6" fill="rgba(255,255,255,0.03)"
                                />
                                {/* Barra de valor */}
                                <rect
                                    x={x} y={y} width={barW} height={Math.max(barH, 0)}
                                    rx="6"
                                    fill={`url(#${activeTab === 'foco' ? 'barGradFoco' : 'barGradMetas'})`}
                                    opacity={val > 0 ? 1 : 0.15}
                                    className={styles.bar}
                                    style={{ animationDelay: `${i * 0.06}s` }}
                                />
                                {/* Valor acima */}
                                {val > 0 && (
                                    <text
                                        x={x + barW / 2} y={y - 5}
                                        fill="rgba(255,255,255,0.7)"
                                        fontSize="9"
                                        fontWeight="700"
                                        textAnchor="middle"
                                        fontFamily="'Syne', sans-serif"
                                    >
                                        {activeTab === 'foco' ? formatTime(val) : val}
                                    </text>
                                )}
                                {/* Label do dia */}
                                <text
                                    x={x + barW / 2} y={128}
                                    fill={isToday ? '#7c6cfa' : 'rgba(255,255,255,0.35)'}
                                    fontSize="10"
                                    fontWeight={isToday ? '800' : '500'}
                                    textAnchor="middle"
                                    fontFamily="'DM Sans', sans-serif"
                                >
                                    {DAY_LABELS[i]}
                                </text>
                                {/* Dot indicador "hoje" */}
                                {isToday && (
                                    <circle cx={x + barW / 2} cy={135} r="2" fill="#7c6cfa" />
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Empty state */}
            {barData.every(v => v === 0) && (
                <div className={styles.emptyHint}>
                    <Icon name={activeTab === 'foco' ? 'timer' : 'target'} style={{ opacity: 0.3, fontSize: '1.2rem' }} />
                    <p>
                        {activeTab === 'foco'
                            ? 'Nenhuma sessão de foco essa semana. Vamos começar!'
                            : 'Nenhuma meta concluída essa semana. Bora!'}
                    </p>
                </div>
            )}
        </div>
    );
}
