import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon';
import styles from './styles.module.css';

const MOODS = [
    { emoji: '😴', label: 'Cansado', value: 1 },
    { emoji: '😐', label: 'Neutro', value: 2 },
    { emoji: '🙂', label: 'Bem', value: 3 },
    { emoji: '💪', label: 'Animado', value: 4 },
    { emoji: '🔥', label: 'Ótimo', value: 5 },
];

const DURATIONS = [
    { label: '15 min', value: 15, icon: 'star', desc: 'Sessão curta e focada' },
    { label: '25 min', value: 25, icon: 'timer', desc: 'Pomodoro clássico' },
    { label: '50 min', value: 50, icon: 'fire', desc: 'Deep work avançado' },
];

/**
 * DailyCheckIn — Modal de check-in diário
 * Aparece uma vez por dia, na primeira abertura do Dashboard.
 * Cria um micro-comprometimento antes de iniciar os estudos.
 *
 * Props:
 *   activeTasks   — lista de metas ativas do usuário
 *   onStart(mode) — callback chamado ao confirmar (recebe minutos selecionados)
 *   onSkip()      — callback ao pular
 */
export default function DailyCheckIn({ activeTasks = [], onStart, onSkip }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0: humor | 1: metas | 2: duração
    const [mood, setMood] = useState(null);
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState(25);
    const [visible, setVisible] = useState(false);

    // Animação de entrada com delay
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    const toggleTask = (id) => {
        setSelectedTaskIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(0, 3)
        );
    };

    const handleFinish = () => {
        onStart?.(selectedDuration);
    };

    const handleSkip = () => {
        setVisible(false);
        setTimeout(() => onSkip?.(), 300);
    };

    const steps = [
        {
            title: 'Como você está hoje?',
            subtitle: 'Seu estado emocional nos ajuda a personalizar sua jornada de foco.',
        },
        {
            title: 'Qual é o foco de hoje?',
            subtitle: 'Selecione até 3 metas prioritárias para esta sessão.',
        },
        {
            title: 'Quanto tempo você tem?',
            subtitle: 'Escolha a duração ideal para sua sessão de foco.',
        },
    ];

    return (
        <div className={`${styles.overlay} ${visible ? styles.visible : ''}`}>
            <div className={`${styles.modal} ${visible ? styles.modalVisible : ''}`}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Icon name="target" />
                        <span>Check-in Diário</span>
                    </div>
                    <button className={styles.skipBtn} onClick={handleSkip}>
                        Pular por hoje
                    </button>
                </div>

                {/* Progress dots */}
                <div className={styles.progressDots}>
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`${styles.dot} ${step === i ? styles.dotActive : step > i ? styles.dotDone : ''}`} />
                    ))}
                </div>

                {/* Step title */}
                <div className={styles.stepHeader}>
                    <h2 className={styles.title}>{steps[step].title}</h2>
                    <p className={styles.subtitle}>{steps[step].subtitle}</p>
                </div>

                {/* Step 0: Mood */}
                {step === 0 && (
                    <div className={styles.moodGrid}>
                        {MOODS.map(m => (
                            <button
                                key={m.value}
                                className={`${styles.moodBtn} ${mood?.value === m.value ? styles.moodSelected : ''}`}
                                onClick={() => setMood(m)}
                            >
                                <span className={styles.moodEmoji}>{m.emoji}</span>
                                <span className={styles.moodLabel}>{m.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 1: Tasks */}
                {step === 1 && (
                    <div className={styles.taskList}>
                        {activeTasks.length === 0 ? (
                            <div className={styles.emptyTasks}>
                                <Icon name="target" />
                                <p>Nenhuma meta ativa.<br />Você pode criar uma no Dashboard!</p>
                            </div>
                        ) : (
                            activeTasks.map(task => (
                                <button
                                    key={task.id}
                                    className={`${styles.taskItem} ${selectedTaskIds.includes(task.id) ? styles.taskSelected : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                >
                                    <div className={styles.taskCheck}>
                                        {selectedTaskIds.includes(task.id) && <Icon name="check" />}
                                    </div>
                                    <span className={styles.taskDesc}>{task.descricao}</span>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* Step 2: Duration */}
                {step === 2 && (
                    <div className={styles.durationGrid}>
                        {DURATIONS.map(d => (
                            <button
                                key={d.value}
                                className={`${styles.durationBtn} ${selectedDuration === d.value ? styles.durationSelected : ''}`}
                                onClick={() => setSelectedDuration(d.value)}
                            >
                                <Icon name={d.icon} />
                                <span className={styles.durationLabel}>{d.label}</span>
                                <span className={styles.durationDesc}>{d.desc}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    {step > 0 && (
                        <button className={styles.btnBack} onClick={() => setStep(s => s - 1)}>
                            ← Voltar
                        </button>
                    )}
                    {step < 2 ? (
                        <button
                            className={styles.btnNext}
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 0 && !mood}
                        >
                            Próximo →
                        </button>
                    ) : (
                        <button className={styles.btnStart} onClick={handleFinish}>
                            <Icon name="play" /> Começar Jornada
                        </button>
                    )}
                </div>

                {/* Mood summary (visible from step 1+) */}
                {mood && step > 0 && (
                    <div className={styles.moodSummary}>
                        {mood.emoji} <span>Hoje você está <strong>{mood.label.toLowerCase()}</strong></span>
                    </div>
                )}
            </div>
        </div>
    );
}
