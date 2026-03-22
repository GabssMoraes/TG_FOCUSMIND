import React from 'react';
import { useNavigate } from "react-router-dom";
import styles from './styles.module.css';

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>
            <div className={styles['dashboard-layout']}>

                <div className={styles.sidebar}>
                    <div className={styles['sidebar-section']}>
                        <div className={styles['sidebar-label']}>Principal</div>

                        <div
                            className={`${styles['sidebar-item']} ${styles.active}`}
                            onClick={() => navigate('/')}
                        >
                            <span className={styles['sidebar-item-icon']}>🏠</span> Início
                        </div>

                        <div
                            className={styles['sidebar-item']}
                            onClick={() => navigate('/timer')}
                        >
                            <span className={styles['sidebar-item-icon']}>⏱️</span> Temporizador
                        </div>
                    </div>
                </div>

                <div className={styles['main-content']}>
                    <div className={styles.greeting}>
                        <h2>Boa tarde, Teste da Silva 👋</h2>
                        <p>Você tem 3 matérias programadas para hoje. Sua sequência está em 5 dias 🔥</p>
                    </div>

                    <div className={styles['dash-grid']}>
                        <div className={styles['dash-card']}>
                            <div className={styles['dash-num']}>2h 34m</div>
                            <div className={styles['dash-sub']} style={{ color: '#4ecdc4' }}>
                                ↑ 18% em relação a ontem
                            </div>
                        </div>

                        <div className={styles['dash-card']}>
                            <div className={styles['dash-num']}>87%</div>
                            <div className={styles['dash-sub']} style={{ color: '#4ecdc4' }}>
                                ↑ Seu melhor da semana
                            </div>
                        </div>

                        <div className={styles['dash-card']}>
                            <div className={styles['dash-num']}>5 dias</div>
                            <div className={styles['dash-sub']}>Continue assim!</div>
                        </div>
                    </div>

                    <div className={styles['dash-card']}>
                        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '14px', fontSize: '1rem' }}>
                            🤖 IA sugere agora
                        </h3>

                        <div style={{
                            background: 'rgba(124,108,250,.08)',
                            borderRadius: '12px',
                            padding: '14px',
                            fontSize: '.87rem',
                            color: '#c0b8f7',
                            marginBottom: '12px'
                        }}>
                            Você tem 45 min livres agora. Perfeito para revisar as anotações de Cálculo antes da sessão de exercícios!
                        </div>

                        <button
                            className={styles['btn-primary']}
                            style={{ width: '100%', padding: '10px' }}
                            onClick={() => navigate('/chat')}
                        >
                            Conversar com a IA
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}