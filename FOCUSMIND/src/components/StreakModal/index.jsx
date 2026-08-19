import React, { useEffect, useState } from 'react';
import Icon from '../Icon';
import styles from './styles.module.css';

export default function StreakModal({ streak, onClose }) {
    const [confetti, setConfetti] = useState([]);

    useEffect(() => {
        if (streak > 0) {
            // Generate random confetti só se tiver streak
            const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9f43', '#c0b8f7'];
            const pieces = Array.from({ length: 80 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                background: colors[Math.floor(Math.random() * colors.length)],
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 0.5}s`,
                width: `${Math.random() * 6 + 6}px`,
                height: `${Math.random() * 10 + 10}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px' // mix de bolinhas e papelzinhos
            }));
            setConfetti(pieces);
        } else {
            setConfetti([]);
        }
    }, [streak]);

    let message = "Continue assim para não perder sua chama!";
    if (streak === 0) message = "Você perdeu a sua sequência. Mas não desanime, toda jornada começa com um primeiro passo!";
    else if (streak === 1) message = "O primeiro passo! Que chama incrível está nascendo.";
    else if (streak === 3) message = "Três dias seguidos! Você está criando o hábito.";
    else if (streak >= 7 && streak < 30) message = "Foco impecável! Ninguém te segura mais.";
    else if (streak >= 30) message = "Lenda do Foco! Um mês inteiro focado.";

    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const hojeIdx = new Date().getDay(); // 0 a 6 (Dom a Sab)

    const currentWeekDays = diasSemana.map((label, idx) => {
        const diff = hojeIdx - idx; // dias passados em relação a hoje (negativo = futuro)
        const active = streak > 0 && diff >= 0 && diff < streak;
        return {
            id: idx,
            label,
            active
        };
    });

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                {/* Efeito de Confetes */}
                <div className={styles.confettiContainer}>
                    {confetti.map(c => (
                        <div
                            key={c.id}
                            className={styles.confettiPiece}
                            style={{
                                left: c.left,
                                background: c.background,
                                animation: `fall ${c.animationDuration} linear forwards`,
                                animationDelay: c.animationDelay,
                                width: c.width,
                                height: c.height,
                                borderRadius: c.borderRadius
                            }}
                        />
                    ))}
                </div>

                <button className={styles.closeBtn} onClick={onClose}>
                    <Icon name="fa-solid fa-xmark" />
                </button>

                {/* Ícone com Efeito de Fogo CSS */}
                <div className={`${styles.fireIconWrapper} ${streak === 0 ? styles.fireLost : ''}`}>
                    <Icon name={streak === 0 ? "snowflake" : "fire"} />
                </div>

                <div className={styles.fireSubtitle}>{streak === 0 ? 'A chama apagou' : 'Sequência Atual'}</div>
                <h2 className={styles.fireText}>{streak}</h2>

                <div className={styles.diasLabel}>{streak === 1 ? 'Dia' : 'Dias'}</div>
                
                {/* Caminho de Streak tipo Duolingo */}
                <div className={styles.streakPath}>
                    {currentWeekDays.map((day, idx) => (
                        <div key={day.id} className={styles.streakDayWrapper}>
                            <div className={styles.streakDay}>
                                <div className={`${styles.streakCircle} ${day.active ? styles.activeCircle : ''}`}>
                                    {day.active && <Icon name="fire" style={{ fontSize: '0.8rem' }} />}
                                </div>
                                <span className={`${styles.streakLabel} ${day.active ? styles.activeLabel : ''}`}>{day.label}</span>
                            </div>
                            {idx < 6 && (
                                <div className={`${styles.streakConnector} ${(day.active && currentWeekDays[idx+1].active) ? styles.activeConnector : ''}`} />
                            )}
                        </div>
                    ))}
                </div>

                <p className={styles.fireDesc}>
                    {message}
                </p>

                <button className={styles.btnAction} onClick={onClose}>
                    Incrível
                </button>
            </div>
        </div>
    );
}
