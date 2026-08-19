import React from 'react';
import { useNavigate } from "react-router-dom";
import styles from './styles.module.css';

const features = [
    {
        icon: '⏱',
        color: 'rgba(78,205,196,0.12)',
        iconColor: '#4ecdc4',
        title: 'Timer Pomodoro',
        desc: 'Ciclos de foco e pausa baseados na técnica Pomodoro, com análise do seu histórico de sessões.'
    },
    {
        icon: '🤖',
        color: 'rgba(124,108,250,0.12)',
        iconColor: '#7c6cfa',
        title: 'FocusBot com IA',
        desc: 'Um assistente inteligente que analisa sua rotina e te sugere o próximo passo mais adequado para o dia.'
    },
    {
        icon: '🎯',
        color: 'rgba(247,197,159,0.12)',
        iconColor: '#f7c59f',
        title: 'Metas de Estudo',
        desc: 'Crie metas de estudo e valide seu aprendizado respondendo um quiz gerado por IA antes de concluí-las.'
    },
    {
        icon: '📅',
        color: 'rgba(78,205,196,0.12)',
        iconColor: '#4ecdc4',
        title: 'Grade Horária',
        desc: 'Monte sua grade semanal de Time Blocking para organizar melhor o uso do seu tempo de estudo.'
    },
    {
        icon: '🧩',
        color: 'rgba(255,107,107,0.10)',
        iconColor: '#ff6b6b',
        title: 'Quiz Diário',
        desc: 'Fixe o conteúdo com quizzes personalizados pela IA com base na sua matéria de estudo principal.'
    },
    {
        icon: '🏆',
        color: 'rgba(255,215,0,0.10)',
        iconColor: '#ffd700',
        title: 'Gamificação',
        desc: 'Acumule moedas, mantenha sua sequência de dias ativos e abra baús de recompensas ao avançar.'
    },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroBg} aria-hidden="true">
                    <div className={styles.heroBgGlow1} />
                    <div className={styles.heroBgGlow2} />
                </div>

                <div className={styles.heroContent}>

                    <h1 className={styles.heroTitle}>
                        Estude com<br />
                        <span className={styles.heroTitleHighlight}>inteligência.</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        O FocusMind combina técnicas de foco comprovadas com inteligência artificial para te ajudar a estudar melhor, manter o ritmo e alcançar seus objetivos acadêmicos.
                    </p>

                    <div className={styles.heroActions}>
                        <button className={styles.btnPrimary} onClick={() => navigate('/register')}>
                            Criar conta grátis
                        </button>
                        <button className={styles.btnGhost} onClick={() => navigate('/login')}>
                            Já tenho conta →
                        </button>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.heroCard}>
                        <div className={styles.cardTopBar} />
                        <div className={styles.chatBubble + ' ' + styles.aiMessage}>
                            <span className={styles.bubbleTag}>🤖 FocusBot</span>
                            Boa tarde! Você tem 2 metas pendentes hoje. Que tal começarmos pela mais urgente?
                        </div>
                        <div className={styles.chatBubble + ' ' + styles.userMessage}>
                            <span className={styles.bubbleTag}>Você</span>
                            Pode me ajudar a montar um plano de revisão?
                        </div>
                        <div className={styles.timerWidget}>
                            <div className={styles.timerRing}>
                                <svg viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(124,108,250,0.15)" strokeWidth="4"/>
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="#7c6cfa" strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray="125.6"
                                        strokeDashoffset="44"
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                    />
                                </svg>
                                <span className={styles.timerVal}>22:00</span>
                            </div>
                            <div className={styles.timerInfo}>
                                <div className={styles.timerTitle}>Sessão de foco ativa</div>
                                <div className={styles.timerSub}>Revisão Semanal — Capítulo 5</div>
                                <div className={styles.timerBar}><div className={styles.timerFill}/></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className={styles.featuresSection}>
                <div className={styles.sectionInner}>
                    <p className={styles.sectionLabel}>O que você vai ter</p>
                    <h2 className={styles.sectionTitle}>Tudo que você precisa para estudar melhor</h2>
                    <p className={styles.sectionSub}>Ferramentas de produtividade integradas com IA para que você possa focar no que importa: aprender.</p>

                    <div className={styles.featuresGrid}>
                        {features.map((f, i) => (
                            <div key={i} className={styles.featureCard}>
                                <div className={styles.featureIcon} style={{ background: f.color }}>
                                    <span>{f.icon}</span>
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaCard}>
                    <div className={styles.ctaBgGlow} />
                    <h2 className={styles.ctaTitle}>Pronto para começar?</h2>
                    <p className={styles.ctaSub}>Crie sua conta e comece a usar o FocusMind hoje mesmo.</p>
                    <button className={styles.btnPrimary} onClick={() => navigate('/register')}>
                        Criar conta grátis
                    </button>
                </div>
            </section>

        </div>
    );
}