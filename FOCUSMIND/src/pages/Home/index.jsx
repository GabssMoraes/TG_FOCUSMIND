import React from 'react';
import { useNavigate } from "react-router-dom";
import styles from './styles.module.css';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className={styles['hero-badge']}>✦ Powered by IA</div>
                    <h1>Estude com foco.<br />Aprenda de verdade.</h1>
                    <p className={styles['hero-text']}>
                        Uma plataforma inteligente que entende como você aprende e adapta sua rotina de estudos para maximizar foco, reduzir a procrastinação e aumentar seu desempenho acadêmico.
                    </p>

                    <div className={styles['btn-group']}>
                        <button
                            className={styles['btn-primary']}
                            onClick={() => navigate('/dashboard')}
                        >
                            Começar agora
                        </button>

                        <button
                            className={styles['btn-secondary']}
                            onClick={() => navigate('/chat')}
                        >
                            Falar com a IA
                        </button>
                    </div>

                    <div className={styles.botoesExplicativos}>
                        <div className={styles.chip}>🎯 Técnica Pomodoro</div>
                        <div className={styles.chip}>🤖 IA Personalizada</div>
                        <div className={styles.chip}>📊 Relatórios semanais</div>
                        <div className={styles.chip}>🔔 Lembretes inteligentes</div>
                    </div>
                </div>

                <div className={styles['hero-visual']}>
                    <div className={styles['hero-card']}>
                        <div className={`${styles['ai-chat-bubble']} ${styles.ai}`}>
                            <div className={styles['bubble-label']}>🤖 FocusMind</div>
                            Oi, Ana! Você tem 2h disponíveis hoje. Que tal começarmos com Cálculo?
                        </div>

                        <div className={`${styles['ai-chat-bubble']} ${styles.user}`}>
                            <div className={styles['bubble-label']}>Você</div>
                            Ok, mas estou me sentindo distraída hoje...
                        </div>

                        <div className={styles['focus-timer']}>
                            <div className={styles['timer-circle']}>15:00</div>
                            <div className={styles['timer-info']}>
                                <div className={styles['timer-title']}>Sessão de foco ativa — Cálculo II</div>
                                <div style={{ color: 'var(--muted)', fontSize: '.78rem', marginBottom: '8px' }}>
                                    Derivadas — Exercícios 3.1
                                </div>
                                <div className={styles['timer-bar']}>
                                    <div className={styles['timer-fill']}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className={styles.section}>
                <div className={styles['stats-row']}>
                    <div className={styles['stat-card']}>
                        <div className={styles['stat-num']}>73%</div>
                        <div className={styles['stat-label']}>melhora no foco</div>
                    </div>

                    <div className={styles['stat-card']}>
                        <div className={styles['stat-num']}>2.4×</div>
                        <div className={styles['stat-label']}>mais produtividade</div>
                    </div>

                    <div className={styles['stat-card']}>
                        <div className={styles['stat-num']}>89%</div>
                        <div className={styles['stat-label']}>menos procrastinação</div>
                    </div>


                </div>
            </div>
        </div>
    );
}