import React, { useState, useEffect, useRef } from 'react';
import Icon from '../Icon';
import styles from './styles.module.css';

/**
 * PauseMode — Modo Pausa Guiada
 * Aparece automaticamente após concluir uma sessão Pomodoro.
 * Mantém o usuário no site durante os 5 minutos de pausa.
 *
 * Props:
 *   sessionMinutes — duração da sessão que acabou
 *   onPauseEnd()   — callback quando a pausa termina (auto-reinicia timer)
 *   onSkip()       — callback para pular a pausa
 */
export default function PauseMode({ sessionMinutes = 25, onPauseEnd, onSkip }) {
    const PAUSE_SECONDS = sessionMinutes >= 50 ? 10 * 60 : 5 * 60; // 10min para sessões longas

    const [mode, setMode] = useState(null); // null | 'breath' | 'reflection' | 'rest'
    const [timeLeft, setTimeLeft] = useState(PAUSE_SECONDS);
    const [breathPhase, setBreathPhase] = useState('inhale'); // inhale | hold | exhale
    const [breathCount, setBreathCount] = useState(0);
    const [reflection, setReflection] = useState('');
    const [reflectionSaved, setReflectionSaved] = useState(false);

    const intervalRef = useRef(null);
    const breathTimerRef = useRef(null);

    // Countdown geral da pausa
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    onPauseEnd?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, []);

    // Lógica de respiração 4-7-8 (inhalar 4s, segurar 7s, exhalar 8s)
    useEffect(() => {
        if (mode !== 'breath') {
            clearTimeout(breathTimerRef.current);
            return;
        }

        const sequence = [
            { phase: 'inhale', duration: 4000 },
            { phase: 'hold', duration: 7000 },
            { phase: 'exhale', duration: 8000 },
        ];
        let idx = 0;

        const runBreath = () => {
            const current = sequence[idx % 3];
            setBreathPhase(current.phase);
            if (current.phase === 'inhale') setBreathCount(c => c + 1);
            breathTimerRef.current = setTimeout(runBreath, current.duration);
            idx++;
        };

        runBreath();
        return () => clearTimeout(breathTimerRef.current);
    }, [mode]);

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    const pct = ((PAUSE_SECONDS - timeLeft) / PAUSE_SECONDS) * 100;

    const handleSaveReflection = () => {
        if (!reflection.trim()) return;
        // Salva localmente
        const key = `@FocusMind:reflections`;
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        stored.unshift({ text: reflection, date: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(stored.slice(0, 30))); // máximo 30
        setReflectionSaved(true);
    };

    const breathLabels = {
        inhale: 'Inspire devagar...',
        hold: 'Segure o ar...',
        exhale: 'Expire lentamente...',
    };

    const breathColors = {
        inhale: '#7c6cfa',
        hold: '#f7c59f',
        exhale: '#4ecdc4',
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                {/* Countdown bar no topo */}
                <div className={styles.countdownBar}>
                    <div className={styles.countdownFill} style={{ width: `${pct}%` }} />
                </div>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <Icon name="timer" />
                        <span>Pausa {sessionMinutes >= 50 ? '10' : '5'} min</span>
                    </div>
                    <span className={styles.timeLeft}>{formatTime(timeLeft)}</span>
                    <button className={styles.skipBtn} onClick={onSkip}>Pular pausa</button>
                </div>

                {/* Título */}
                <div className={styles.titleSection}>
                    <h2>Sessão concluída! Você merece descansar.</h2>
                    <p>Escolha como aproveitar seus próximos minutos de recuperação:</p>
                </div>

                {/* Opções ou modo ativo */}
                {!mode ? (
                    <div className={styles.optionsGrid}>
                        <button className={styles.optionCard} onClick={() => setMode('breath')}>
                            <div className={styles.optionIcon} style={{ background: 'rgba(124,108,250,0.15)' }}>
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                                    <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="#7c6cfa" strokeWidth="1.5"/>
                                    <path d="M12 8v4l3 3" stroke="#7c6cfa" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <strong>Respiração Guiada</strong>
                            <p>Técnica 4-7-8 para clareza mental</p>
                        </button>

                        <button className={styles.optionCard} onClick={() => setMode('reflection')}>
                            <div className={styles.optionIcon} style={{ background: 'rgba(78,205,196,0.15)' }}>
                                <Icon name="pen" style={{ color: '#4ecdc4', fontSize: '1.4rem' }} />
                            </div>
                            <strong>Reflexão Rápida</strong>
                            <p>O que você aprendeu nessa sessão?</p>
                        </button>

                        <button className={styles.optionCard} onClick={() => setMode('rest')}>
                            <div className={styles.optionIcon} style={{ background: 'rgba(247,197,159,0.15)' }}>
                                <Icon name="headphones" style={{ color: '#f7c59f', fontSize: '1.4rem' }} />
                            </div>
                            <strong>Descanso</strong>
                            <p>Feche os olhos e respire</p>
                        </button>
                    </div>
                ) : (

                    <div className={styles.modeContent}>

                        {/* Modo Respiração */}
                        {mode === 'breath' && (
                            <div className={styles.breathContent}>
                                <div
                                    className={`${styles.breathCircle} ${styles[breathPhase]}`}
                                    style={{ '--color': breathColors[breathPhase] }}
                                >
                                    <span className={styles.breathLabel}>{breathLabels[breathPhase]}</span>
                                </div>
                                <p className={styles.breathCount}>Ciclo {breathCount} de respiração</p>
                                <p className={styles.breathTip}>
                                    Inspire pelo nariz (4s) → Segure (7s) → Expire pela boca (8s)
                                </p>
                            </div>
                        )}

                        {/* Modo Reflexão */}
                        {mode === 'reflection' && (
                            <div className={styles.reflectionContent}>
                                <p className={styles.reflectionPrompt}>
                                    ✍️ O que foi mais interessante ou difícil nessa sessão?
                                </p>
                                {!reflectionSaved ? (
                                    <>
                                        <textarea
                                            className={styles.reflectionArea}
                                            placeholder="Ex: Entendi melhor o conceito de recursão, mas ainda tenho dúvida em casos base..."
                                            value={reflection}
                                            onChange={e => setReflection(e.target.value)}
                                            rows={4}
                                        />
                                        <button
                                            className={styles.btnSave}
                                            onClick={handleSaveReflection}
                                            disabled={!reflection.trim()}
                                        >
                                            <Icon name="check" /> Salvar reflexão
                                        </button>
                                    </>
                                ) : (
                                    <div className={styles.savedMsg}>
                                        <Icon name="check" />
                                        <p>Reflexão salva! Continue assim — revisar o que aprendeu reforça a memória.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Modo Descanso */}
                        {mode === 'rest' && (
                            <div className={styles.restContent}>
                                <div className={styles.restIcon}>
                                    <div className={styles.restRipple} />
                                    <div className={styles.restRipple} style={{ animationDelay: '0.6s' }} />
                                    <div className={styles.restRipple} style={{ animationDelay: '1.2s' }} />
                                    <Icon name="headphones" style={{ fontSize: '2.5rem', color: '#f7c59f', position: 'relative' }} />
                                </div>
                                <p className={styles.restText}>Feche os olhos por alguns instantes.</p>
                                <p className={styles.restSubText}>O próximo ciclo de foco começa automaticamente.</p>
                            </div>
                        )}

                        <button className={styles.btnBack} onClick={() => setMode(null)}>
                            ← Outras opções
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Próxima sessão começa automaticamente em <strong>{formatTime(timeLeft)}</strong></p>
                </div>
            </div>
        </div>
    );
}
