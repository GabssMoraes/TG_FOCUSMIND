import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Icon from '../Icon';
import styles from './styles.module.css';
import { playSuccessSound } from '../../utils/audioUtils';

// Pool de desafios possíveis — o sistema escolhe 3 por semana (ou 6 com Pacote de Desafios Bônus)
const CHALLENGE_POOL = [
    { id: 'marathon',   icon: 'timer',      title: 'Maratonista',          desc: 'Complete 5 sessões Pomodoro esta semana',      goal: 5,  unit: 'sessões',   reward: 30 },
    { id: 'focused',    icon: 'fire',       title: 'Sem Distrações',       desc: 'Termine 3 sessões com nível de foco ≥ 4',      goal: 3,  unit: 'sessões',   reward: 25 },
    { id: 'curious',    icon: 'bot',        title: 'Estudante Curioso',    desc: 'Faça 3 perguntas ao FocusBot',                goal: 3,  unit: 'perguntas', reward: 20 },
    { id: 'reviewer',   icon: 'review',     title: 'Revisor Dedicado',     desc: 'Complete a Revisão Semanal',                  goal: 1,  unit: 'revisão',   reward: 15 },
    { id: 'quiz_ace',   icon: 'brain',      title: 'Mestre do Quiz',       desc: 'Acerte 80%+ no Quiz 3 vezes',                 goal: 3,  unit: 'vezes',     reward: 25 },
    { id: 'goals',      icon: 'target',     title: 'Realizador',           desc: 'Conclua 3 metas de estudo',                   goal: 3,  unit: 'metas',     reward: 20 },
    { id: 'streak3',    icon: 'star',       title: 'Consistente',          desc: 'Acesse o FocusMind por 3 dias seguidos',      goal: 3,  unit: 'dias',      reward: 15 },
    { id: 'schedule',   icon: 'calendar',   title: 'Organizado',           desc: 'Crie 2 blocos de tempo na Grade Horária',     goal: 2,  unit: 'blocos',    reward: 15 },
    { id: 'shop',       icon: 'shop',       title: 'Investidor',           desc: 'Compre algo na Loja de Recompensas',          goal: 1,  unit: 'compra',    reward: 10 },
    { id: 'long_sess',  icon: 'headphones', title: 'Deep Worker',          desc: 'Complete uma sessão estendida (45m+)',        goal: 1,  unit: 'sessão',    reward: 20 },
];

function getWeekSeed() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    return weekNumber * 31 + now.getFullYear() * 7;
}

/**
 * Seleciona N desafios baseado na semana do ano (determinístico — mesma semana = mesmos desafios).
 */
function getWeeklyChallenges(count = 3) {
    const seed = getWeekSeed();
    const indices = [];
    let s = seed;
    while (indices.length < count && indices.length < CHALLENGE_POOL.length) {
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
        case 'focused':   return Math.min(stored, 3);
        case 'curious':   return Math.min(stored, 3);
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
 *   userId           — id do usuário
 *   sessionCount     — número de sessões da semana
 *   metasDone        — número de metas concluídas na semana
 *   streakDias       — dias de sequência
 *   onRewardClaimed  — callback quando o usuário resgata as moedas de um desafio
 */
export default function WeeklyChallenges({ userId, sessionCount = 0, metasDone = 0, streakDias = 0, onRewardClaimed }) {
    const hasExtraChallenges = localStorage.getItem(`@FocusMind:extraChallenges:${userId}`) === 'true';
    const challengeCount = hasExtraChallenges ? 6 : 3;
    const weekSeed = getWeekSeed();

    const challenges = useMemo(() => getWeeklyChallenges(challengeCount), [challengeCount]);
    const [expanded, setExpanded] = useState(true);
    const [claimedMap, setClaimedMap] = useState(() => {
        const map = {};
        challenges.forEach(c => {
            const key = `@FocusMind:claimed_${weekSeed}_${c.id}_${userId}`;
            map[c.id] = localStorage.getItem(key) === 'true';
        });
        return map;
    });
    const [claimingId, setClaimingId] = useState(null);

    const handleClaim = async (challenge) => {
        if (!userId || claimingId) return;
        setClaimingId(challenge.id);
        try {
            const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/recompensar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moedas: challenge.reward,
                    baus: 0,
                    motivo: `Desafio Semanal: ${challenge.title}`
                })
            });

            if (res.ok) {
                const claimKey = `@FocusMind:claimed_${weekSeed}_${challenge.id}_${userId}`;
                localStorage.setItem(claimKey, 'true');
                setClaimedMap(prev => ({ ...prev, [challenge.id]: true }));
                playSuccessSound();
                toast.success(`Desafio "${challenge.title}" concluído! +${challenge.reward} moedas 🪙`);
                onRewardClaimed?.(challenge.reward);
            } else {
                toast.error("Erro ao resgatar recompensa.");
            }
        } catch {
            toast.error("Sem conexão com o servidor.");
        } finally {
            setClaimingId(null);
        }
    };

    // Calcula dias até próxima segunda
    const now = new Date();
    const daysUntilMonday = ((8 - now.getDay()) % 7) || 7;

    return (
        <div className={styles.card}>
            <div className={styles.header} onClick={() => setExpanded(v => !v)} role="button" tabIndex={0}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}><Icon name="star" /></div>
                    <div>
                        <h3 className={styles.title}>
                            Desafios da Semana {hasExtraChallenges ? '(+Bônus)' : ''}
                        </h3>
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
                        const isClaimed = claimedMap[challenge.id] || localStorage.getItem(`@FocusMind:claimed_${weekSeed}_${challenge.id}_${userId}`) === 'true';

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
                                {done && !isClaimed ? (
                                    <button
                                        className={styles.claimBtn}
                                        onClick={() => handleClaim(challenge)}
                                        disabled={claimingId === challenge.id}
                                    >
                                        <Icon name="coins" style={{ fontSize: '0.7rem' }} />
                                        <span>{claimingId === challenge.id ? '...' : `Resgatar +${challenge.reward}`}</span>
                                    </button>
                                ) : (
                                    <div className={`${styles.reward} ${isClaimed ? styles.rewardDone : ''}`}>
                                        <Icon name="coins" style={{ fontSize: '0.7rem' }} />
                                        <span>{isClaimed ? 'Resgatado' : `+${challenge.reward}`}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
