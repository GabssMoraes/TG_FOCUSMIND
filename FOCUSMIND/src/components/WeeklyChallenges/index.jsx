import React, { useState, useEffect } from 'react';
import Icon from '../Icon';
import styles from './styles.module.css';

// Pool de desafios possíveis — o sistema escolhe 3 por semana
const CHALLENGE_POOL = [
    { id: 'marathon',   icon: 'timer',    title: 'Maratonista',          desc: 'Complete 5 sessões Pomodoro esta semana',      goal: 5,  unit: 'sessões',   reward: 30 },
    { id: 'focused',    icon: 'fire',     title: 'Sem Distrações',       desc: 'Termine 3 sessões com nível de foco ≥ 4',      goal: 3,  unit: 'sessões',   reward: 25 },
    { id: 'curious',    icon: 'bot',      title: 'Estudante Curioso',    desc: 'Faça 3 perguntas ao FocusBot',                goal: 3,  unit: 'perguntas', reward: 20 },
    { id: 'reviewer',   icon: 'review',   title: 'Revisor Dedicado',     desc: 'Complete a Revisão Semanal',                  goal: 1,  unit: 'revisão',   reward: 15 },
    { id: 'quiz_ace',   icon: 'brain',    title: 'Mestre do Quiz',       desc: 'Acerte 80%+ no Quiz 3 dias seguidos',         goal: 3,  unit: 'dias',      reward: 25 },
    { id: 'goals',      icon: 'target',   title: 'Realizador',           desc: 'Conclua 3 metas de estudo',                   goal: 3,  unit: 'metas',     reward: 20 },
    { id: 'streak3',    icon: 'star',     title: 'Consistente',          desc: 'Acesse o FocusMind por 3 dias seguidos',      goal: 3,  unit: 'dias',      reward: 15 },
    { id: 'schedule',   icon: 'calendar', title: 'Organizado',           desc: 'Crie 2 blocos de tempo na Grade Horária',     goal: 2,  unit: 'blocos',    reward: 15 },
    { id: 'shop',       icon: 'shop',     title: 'Investidor',           desc: 'Compre algo na Loja de Recompensas',          goal: 1,  unit: 'compra',    reward: 10 },
    { id: 'long_sess',  icon: 'headphones', title: 'Deep Worker',        desc: 'Complete uma sessão de 50 minutos',           goal: 1,  unit: 'sessão',    reward: 20 },
];

/**
 * Seleciona 3 desafios baseado na semana do ano (determinístico — mesma semana = mesmos desafios).
 */
function getWeeklyChallenges() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    const seed = weekNumber * 31 + now.getFullYear() * 7;

    const indices = [];
    let s = seed;
    while (indices.length < 3) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        const idx = s % CHALLENGE_POOL.length;
        if (!indices.includes(idx)) indices.push(idx);
    }
    return indices.map(i => CHALLENGE_POOL[i]);
}

/**
 * Retorna progresso de cada desafio usando dados já disponíveis.
 * userId é usado para a chave do localStorage.
 */
function getChallengeProgress(challengeId, sessionCount, metasDone, streakDias, userId) {
    const storeKey = `@FocusMind:challenge_${challengeId}_${userId}`;
    const stored = parseInt(localStorage.getItem(storeKey) || '0', 10);

    switch (challengeId) {
        case 'marathon':  return Math.min(sessionCount, 5);
        case 'focused':   return Math.min(stored, 3);  // incrementado via API de sessões
        case 'curious':   return Math.min(stored, 3);  // incrementado ao enviar chat
        case 'reviewer':  return Math.min(stored, 1);
        case 'quiz_ace':  return Math.min(stored, 3);
        case 'goals':     return Math.min(metasDone, 3);
        case 'streak3':   return Math.min(streakDias, 3);
        case 'schedule':  return Math.min(stored, 2);
        case 'shop':      return Math.min(stored, 1);
        case 'long_sess': return Math.min(stored, 1);
        default:          return 0;
    }
}

/**
 * WeeklyChallenges — Desafios Semanais Rotativos
 * Props:
 *   userId        — id do usuário
 *   sessionCount  — número de sessões da semana
 *   metasDone     — número de metas concluídas na semana
 *   streakDias    — dias de sequência
 */
export default function WeeklyChallenges({ userId, sessionCount = 0, metasDone = 0, streakDias = 0 }) {
    const [challenges] = useState(() => getWeeklyChallenges());
    const [expanded, setExpanded] = useState(true);

    // Calcula dias até próxima segunda
    const now = new Date();
    const daysUntilMonday = ((8 - now.getDay()) % 7) || 7;

    return (
        <div className={styles.card}>
            <div className={styles.header} onClick={() => setExpanded(v => !v)} role="button" tabIndex={0}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}><Icon name="star" /></div>
                    <div>
                        <h3 className={styles.title}>Desafios da Semana</h3>
                        <p className={styles.subtitle}>Renovam em {daysUntilMonday} dia{daysUntilMonday !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <Icon name={expanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}
                    style={{ color: 'var(--muted)', fontSize: '0.8rem' }} />
            </div>

            {expanded && (
                <div className={styles.challengeList}>
                    {challenges.map((challenge) => {
                        const progress = getChallengeProgress(challenge.id, sessionCount, metasDone, streakDias, userId);
                        const pct = Math.min(100, (progress / challenge.goal) * 100);
                        const done = progress >= challenge.goal;

                        return (
                            <div key={challenge.id} className={`${styles.challengeItem} ${done ? styles.done : ''}`}>
                                <div className={styles.challengeLeft}>
                                    <div className={`${styles.challengeIcon} ${done ? styles.challengeIconDone : ''}`}>
                                        {done
                                            ? <Icon name="check" style={{ color: '#4ecdc4' }} />
                                            : <Icon name={challenge.icon} style={{ color: '#7c6cfa' }} />
                                        }
                                    </div>
                                    <div className={styles.challengeInfo}>
                                        <div className={styles.challengeTitle}>{challenge.title}</div>
                                        <div className={styles.challengeDesc}>{challenge.desc}</div>
                                        <div className={styles.progressRow}>
                                            <div className={styles.progressTrack}>
                                                <div
                                                    className={`${styles.progressFill} ${done ? styles.progressDone : ''}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className={styles.progressLabel}>
                                                {progress}/{challenge.goal}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${styles.reward} ${done ? styles.rewardDone : ''}`}>
                                    <Icon name="coins" style={{ fontSize: '0.7rem' }} />
                                    <span>+{challenge.reward}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
