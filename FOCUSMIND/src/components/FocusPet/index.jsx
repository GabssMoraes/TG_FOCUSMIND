import React, { useMemo } from 'react';
import styles from './styles.module.css';

/**
 * FocusPet — Companheiro de Foco animado
 * Estado derivado dos dados reais do perfil (sem nova API).
 *
 * Props:
 *   streakDias    — dias de sequência consecutivos
 *   pontos        — total de moedas acumuladas
 *   sessionsToday — sessões Pomodoro completadas hoje
 *   hasUnlockedFocusMode — se comprou o Modo Foco na Loja
 */
export default function FocusPet({ streakDias = 0, pontos = 0, sessionsToday = 0, hasUnlockedFocusMode = false }) {

    // Determina o estado do pet baseado nos dados do usuário
    const petState = useMemo(() => {
        if (streakDias >= 7 && sessionsToday >= 2) return 'legendary';
        if (hasUnlockedFocusMode || streakDias >= 5) return 'evolved';
        if (sessionsToday >= 2 || streakDias >= 3) return 'excited';
        if (sessionsToday >= 1) return 'happy';
        if (streakDias === 0 && sessionsToday === 0) return 'sleeping';
        return 'idle';
    }, [streakDias, pontos, sessionsToday, hasUnlockedFocusMode]);

    // Nível visual baseado em pontos
    const level = pontos >= 500 ? 4 : pontos >= 200 ? 3 : pontos >= 50 ? 2 : 1;

    const stateLabels = {
        sleeping:  { label: 'Dormindo...', hint: 'Faça uma sessão Pomodoro para acordar seu companheiro!' },
        idle:      { label: 'Esperando...', hint: 'Que tal começar uma sessão de foco hoje?' },
        happy:     { label: 'Contente!', hint: 'Boa! Continue estudando para deixá-lo mais animado.' },
        excited:   { label: 'Animado!', hint: 'Você está arrasando! Mais uma sessão e ele fica em chamas.' },
        evolved:   { label: 'Em Chamas!', hint: 'Impressionante sequência! Seu companheiro está evoluído.' },
        legendary: { label: 'Lendário!', hint: 'Modo lendário ativado. Você é imparável!' },
    };

    const { label, hint } = stateLabels[petState];

    return (
        <div className={`${styles.petCard} ${styles[petState]} ${styles[`level${level}`]}`}>
            <div className={styles.petHeader}>
                <span className={styles.petTitle}>Companheiro de Foco</span>
                <span className={`${styles.petLevel} ${styles[petState]}`}>Nível {level}</span>
            </div>

            {/* SVG Pet — Coruja estilizada que muda de expressão */}
            <div className={styles.petWrapper}>
                {/* Partículas decorativas (visíveis em estados evolved e legendary) */}
                {(petState === 'evolved' || petState === 'legendary') && (
                    <div className={styles.particles}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={styles.particle} style={{ '--i': i }} />
                        ))}
                    </div>
                )}

                <svg
                    className={`${styles.petSvg} ${styles[`anim_${petState}`]}`}
                    viewBox="0 0 120 120"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <radialGradient id="petBodyGrad" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" stopColor={level >= 3 ? '#a89cf7' : '#7c6cfa'} />
                            <stop offset="100%" stopColor={level >= 3 ? '#4ecdc4' : '#5a4de0'} />
                        </radialGradient>
                        <radialGradient id="petBellyGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
                        </radialGradient>
                        {petState === 'legendary' && (
                            <filter id="petGlow">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                        )}
                    </defs>

                    {/* Aura de fundo (legendary) */}
                    {petState === 'legendary' && (
                        <circle cx="60" cy="65" r="50" fill="rgba(124,108,250,0.08)" className={styles.aura} />
                    )}

                    {/* Rabo felpudo */}
                    <path d="M36 90 Q 15 100 12 70 Q 10 50 25 55 Q 20 75 36 80 Z" fill="url(#petBodyGrad)" />
                    {/* Ponta do rabo branca */}
                    <path d="M12 70 Q 10 50 25 55 Q 22 65 12 70 Z" fill="rgba(255,255,255,0.8)" />

                    {/* Corpo da raposa */}
                    <ellipse cx="60" cy="75" rx="26" ry="32" fill="url(#petBodyGrad)"
                        filter={petState === 'legendary' ? 'url(#petGlow)' : undefined} />

                    {/* Barriga (branca/clara) */}
                    <ellipse cx="60" cy="82" rx="14" ry="22" fill="url(#petBellyGrad)" />

                    {/* Orelhas */}
                    <polygon points="40,32 26,12 50,30" fill={level >= 2 ? '#a89cf7' : '#7c6cfa'} />
                    <polygon points="80,32 94,12 70,30" fill={level >= 2 ? '#a89cf7' : '#7c6cfa'} />
                    {/* Interior das orelhas */}
                    <polygon points="38,30 30,18 45,28" fill="url(#petBellyGrad)" />
                    <polygon points="82,30 90,18 75,28" fill="url(#petBellyGrad)" />

                    {/* Cabeça da raposa (larga e pontuda embaixo) */}
                    <path d="M 28 42 Q 60 25 92 42 Q 95 55 60 66 Q 25 55 28 42 Z" fill="url(#petBodyGrad)"
                        filter={petState === 'legendary' ? 'url(#petGlow)' : undefined} />

                    {/* Detalhe branco do focinho e bochechas */}
                    <path d="M 32 46 Q 60 40 88 46 Q 90 55 60 64 Q 30 55 32 46 Z" fill="rgba(255,255,255,0.95)" />

                    {/* Focinho (Nariz) */}
                    <circle cx="60" cy="62" r="3.5" fill="#1a1630" />

                    {/* Olhos - Raposa (Pupilas redondas) */}
                    {petState === 'sleeping' ? (
                        <>
                            <path d="M40 50 Q46 54 52 50" stroke="#1a1630" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M68 50 Q74 54 80 50" stroke="#1a1630" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </>
                    ) : (
                        <>
                            <circle cx={petState === 'legendary' ? 47 : 46} cy={50} r={petState === 'legendary' ? 5 : 4.5} fill="#1a1630" />
                            <circle cx={petState === 'legendary' ? 73 : 74} cy={50} r={petState === 'legendary' ? 5 : 4.5} fill="#1a1630" />
                            {/* Brilho nos olhos */}
                            <circle cx="48" cy="48" r="1.5" fill="rgba(255,255,255,0.9)" />
                            <circle cx="72" cy="48" r="1.5" fill="rgba(255,255,255,0.9)" />
                        </>
                    )}

                    {/* Expressão extra: bocejo (sleeping), brilho (excited/legendary) */}
                    {petState === 'sleeping' && (
                        <text x="72" y="22" fontSize="10" fill="rgba(255,255,255,0.5)">z</text>
                    )}
                    {(petState === 'excited' || petState === 'legendary') && (
                        <text x="74" y="22" fontSize="12">✨</text>
                    )}

                    {/* Patas */}
                    <ellipse cx="50" cy="104" rx="8" ry="4" fill="rgba(90,77,224,0.6)" />
                    <ellipse cx="70" cy="104" rx="8" ry="4" fill="rgba(90,77,224,0.6)" />

                    {/* Chamas (evolved / legendary) */}
                    {(petState === 'evolved' || petState === 'legendary') && (
                        <g className={styles.flames}>
                            <path d="M55 110 Q52 100 58 95 Q55 105 62 108 Q59 98 66 93 Q63 103 70 107 Q66 97 71 90 Q74 100 68 110 Z"
                                fill={petState === 'legendary' ? '#f7c59f' : '#ff8c42'} opacity="0.85" />
                        </g>
                    )}
                </svg>
            </div>

            {/* Status label */}
            <div className={styles.petStatus}>
                <span className={`${styles.statusDot} ${styles[petState]}`} />
                <strong>{label}</strong>
            </div>

            {/* Hint */}
            <p className={styles.petHint}>{hint}</p>

            {/* Barra de progresso para próximo nível */}
            <div className={styles.xpBar}>
                <div className={styles.xpLabel}>
                    <span>Nível {level}</span>
                    <span>{pontos} / {level >= 4 ? '∞' : level === 3 ? '500' : level === 2 ? '200' : '50'}</span>
                </div>
                <div className={styles.xpTrack}>
                    <div
                        className={styles.xpFill}
                        style={{
                            width: level >= 4 ? '100%' :
                                level === 3 ? `${Math.min(100, ((pontos - 200) / 300) * 100)}%` :
                                level === 2 ? `${Math.min(100, ((pontos - 50) / 150) * 100)}%` :
                                `${Math.min(100, (pontos / 50) * 100)}%`
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
