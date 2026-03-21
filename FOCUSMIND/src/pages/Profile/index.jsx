import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './styles.module.css';

export default function Profile() {
    const navigate = useNavigate();
    const [toggles, setToggles] = useState({
        lembretes: true,
        musica: true,
        noturno: true,
        relatorio: false,
        sugestoes: true
    });

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className={styles.page}>
            <div className={styles['profile-page']}>



                <div className={styles['profile-header']}>
                    <div className={styles['profile-avatar-big']}>🧑‍🎓</div>
                    <div>
                        <div className={styles['profile-name']}>Teste da Silva</div>
                        <div className={styles['profile-email']}>teste.silva@email.com</div>
                    </div>

                    <div className={styles['profile-stats-container']}>
                        <div className={styles['profile-stats-row']}>
                            <div className={styles['profile-stat-item']}>
                                <div className={styles['profile-stat-val-1']}>5</div>
                                <div className={styles['profile-stat-label']}>dias seguidos</div>
                            </div>
                            <div className={styles['profile-stat-item']}>
                                <div className={styles['profile-stat-val-2']}>47h</div>
                                <div className={styles['profile-stat-label']}>total estudado</div>
                            </div>
                            <div className={styles['profile-stat-item']}>
                                <div className={styles['profile-stat-val-3']}>12</div>
                                <div className={styles['profile-stat-label']}>conquistas</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles['profile-grid']}>
                    <div className={styles['profile-section']}>
                        <h3>⚙️ Preferências de estudo</h3>

                        {Object.keys(toggles).map((key) => (
                            <div key={key} className={styles['pref-toggle']}>
                                <span>{key}</span>
                                <div
                                    className={`${styles.toggle} ${toggles[key] ? styles.on : ''}`}
                                    onClick={() => handleToggle(key)}
                                ></div>
                            </div>
                        ))}
                    </div>

                    <div className={styles['profile-section']}>
                        <h3>📚 Minhas matérias</h3>
                        <div className={styles['subjects-container']}>
                            <div className={styles.chip}>Cálculo II</div>
                            <div className={styles.chip}>Algoritmos</div>
                            <div className={styles.chip}>Física</div>
                            <div className={styles.chip}>P. de Software</div>
                            <div className={styles.chip}>+ Adicionar</div>
                        </div>
                    </div>
                </div>
                <button
                    className={`${styles['btn-secondary']} ${styles['back-btn']}`}
                    onClick={() => navigate('/dashboard')}
                >
                    ← Voltar
                </button>
            </div>

        </div>
    );
}