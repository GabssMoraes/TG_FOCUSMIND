import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './styles.module.css';

export default function Timer() {
    const navigate = useNavigate();

    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [timerRunning, setTimerRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    useEffect(() => {
        let interval = null;

        if (timerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds(prev => prev - 1);
            }, 1000);
        }
        else if (timerRunning && timerSeconds === 0) {
            setTimerRunning(false);
            setSessionsCompleted(prev => prev + 1);
            setTimerSeconds(5 * 60);

            alert("Sessão concluída! 🎉");
        }

        return () => clearInterval(interval);
    }, [timerRunning, timerSeconds]);

    const toggleTimer = () => {
        setTimerRunning(!timerRunning);
    };

    const resetTimer = () => {
        setTimerRunning(false);
        setTimerSeconds(25 * 60);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className={styles.page}>
            <div className={styles['timer-page']}>
                <div className={`${styles.section} ${styles['timer-section']}`}>
                    <div className={styles['section-label']}>Temporizador de Foco</div>
                    <div className={styles['section-title']}>Sessão Pomodoro</div>

                    <p className={styles['section-desc']}>
                        Foque por 25 minutos, depois descanse 5.
                    </p>
                </div>

                <div className={styles['chips-row']}>
                    <div className={styles.chip}>⏱ 25/5 min</div>
                    <div className={styles.chip}>🧘 15/3 min</div>
                    <div className={styles.chip}>⚡ 50/10 min</div>
                </div>

                <div className={styles['big-timer']}>
                    <div className={styles['big-timer-num']}>
                        {formatTime(timerSeconds)}
                    </div>
                    <div className={styles['big-timer-label']}>Foco ativo</div>
                </div>

                <div className={styles['timer-controls']}>
                    <button className={styles['btn-primary']} onClick={toggleTimer}>
                        {timerRunning ? '⏸ Pausar' : '▶ Iniciar'}
                    </button>

                    <button className={styles['btn-secondary']} onClick={resetTimer}>
                        ↺ Reiniciar
                    </button>
                </div>

                <div className={styles['stats-grid']}>

                    <div className={styles['dash-card']}>
                        <div className={styles['dash-num']}>
                            {sessionsCompleted}
                        </div>
                        <div className={styles['dash-sub']}>Sessões hoje</div>
                    </div>

                    <div className={styles['dash-card']}>
                        <div className={styles['dash-num']}>
                            2h 34m
                        </div>
                        <div className={styles['dash-sub']}>Total hoje</div>
                    </div>

                    <div className={styles['dash-card']}>
                        <div className={styles['dash-num']}>
                            87%
                        </div>
                        <div className={styles['dash-sub']}>Foco médio</div>
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