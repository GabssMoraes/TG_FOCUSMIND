import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import styles from './styles.module.css';

export default function Timer() {
    const navigate = useNavigate();
    const { userId } = useAuth();

    // Timer states
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [timerRunning, setTimerRunning] = useState(false);
    const [currentMode, setCurrentMode] = useState(25); // 25, 15, or 50 minutes
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState("0m");
    const [focusScore, setFocusScore] = useState("100%");

    // Feedback modal states
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [nivelFoco, setNivelFoco] = useState(5);
    const [distracoes, setDistracoes] = useState('');
    const [motivacao, setMotivacao] = useState('Alta');
    const [comentario, setComentario] = useState('');

    // Ambient audio states
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
    const [selectedAudio, setSelectedAudio] = useState('none');
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const audioRef = useRef(null);

    // Audio URLs (royalty-free lofi / ambient tracks)
    const audioUrls = {
        lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Lo-fi (Helix test track)
        rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Rain sound
        cafe: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'  // Cafe ambient
    };

    const loadStats = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/sessoes?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                const hojeStr = new Date().toISOString().split('T')[0];

                // Filtra sessões concluídas hoje
                const hojeSessoes = data.filter(s => s.foiConcluida && s.data.startsWith(hojeStr));
                setSessionsCompleted(hojeSessoes.length);

                // Soma tempo real
                let totalMin = 0;
                let somaFoco = 0;
                hojeSessoes.forEach(s => {
                    if (s.tempoReal) {
                        const parts = s.tempoReal.split(':');
                        const min = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                        totalMin += min;
                    }
                    if (s.nivelFoco) {
                        somaFoco += s.nivelFoco;
                    }
                });

                if (totalMin > 60) {
                    setTotalFocusTime(`${Math.floor(totalMin / 60)}h ${totalMin % 60}m`);
                } else {
                    setTotalFocusTime(`${totalMin}m`);
                }

                if (hojeSessoes.length > 0) {
                    const avgFoco = Math.round((somaFoco / (hojeSessoes.length * 5)) * 100);
                    setFocusScore(`${avgFoco}%`);
                } else {
                    setFocusScore("100%");
                }
            }

            // Checar se o modo foco está desbloqueado no localStorage
            const unlocked = localStorage.getItem(`@FocusMind:unlockedFocusMode:${userId}`);
            setIsAudioUnlocked(unlocked === 'true');
        } catch (error) {
            console.error("Erro ao obter estatísticas de foco:", error);
        }
    };

    useEffect(() => {
        loadStats();
    }, [userId]);

    useEffect(() => {
        let interval = null;

        if (timerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds(prev => prev - 1);
            }, 1000);
        }
        else if (timerRunning && timerSeconds === 0) {
            setTimerRunning(false);
            // Abrir modal de feedback para salvar
            setShowFeedbackModal(true);
            toast.success("Parabéns por concluir sua sessão! 🎉");
        }

        return () => clearInterval(interval);
    }, [timerRunning, timerSeconds]);

    // Lógica do Áudio
    useEffect(() => {
        if (selectedAudio === 'none') {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlayingAudio(false);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        audioRef.current = new Audio(audioUrls[selectedAudio]);
        audioRef.current.loop = true;

        if (isPlayingAudio) {
            audioRef.current.play().catch(err => {
                console.error("Erro ao tocar áudio:", err);
                setIsPlayingAudio(false);
            });
        }
    }, [selectedAudio]);

    const toggleAudioPlay = () => {
        if (!audioRef.current || selectedAudio === 'none') return;

        if (isPlayingAudio) {
            audioRef.current.pause();
            setIsPlayingAudio(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlayingAudio(true);
            }).catch(e => console.error(e));
        }
    };

    const toggleTimer = () => {
        setTimerRunning(!timerRunning);
    };

    const resetTimer = () => {
        setTimerRunning(false);
        setTimerSeconds(currentMode * 60);
    };

    const changeMode = (minutes) => {
        setTimerRunning(false);
        setCurrentMode(minutes);
        setTimerSeconds(minutes * 60);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSaveFeedback = async () => {
        // Formatar tempo real e planejado (HH:mm:ss)
        const formatLocalTime = (mins) => {
            const h = Math.floor(mins / 60).toString().padStart(2, '0');
            const m = (mins % 60).toString().padStart(2, '0');
            return `${h}:${m}:00`;
        };

        const payload = {
            userId,
            foiConcluida: true,
            tempoPlanejado: formatLocalTime(currentMode),
            tempoReal: formatLocalTime(currentMode),
            nivelFoco,
            distracoesReportadas: distracoes,
            avaliacaoMotivacao: motivacao,
            comentario: comentario
        };

        try {
            const response = await fetch('http://localhost:8080/api/sessoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Sessão registrada! +10 moedas ganhas 🪙");
                setShowFeedbackModal(false);
                setDistracoes('');
                setComentario('');
                setTimerSeconds(currentMode * 60);
                loadStats();
            } else {
                toast.error("Erro ao registrar sessão.");
            }
        } catch (error) {
            toast.error("Erro ao comunicar com o servidor.");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles['timer-page']}>
                <div className={`${styles.section} ${styles['timer-section']}`}>
                    <div className={styles['section-label']}>Temporizador de Foco</div>
                    <div className={styles['section-title']}>Sessão de Estudos</div>

                    <p className={styles['section-desc']}>
                        Mantenha o foco absoluto. O temporizador guiará seus intervalos de descanso.
                    </p>
                </div>

                <div className={styles['chips-row']}>
                    <button
                        className={`${styles.chip} ${currentMode === 25 ? styles.activeChip : ''}`}
                        onClick={() => changeMode(25)}
                    >
                        <Icon name="timer" style={{ marginRight: '6px' }} /> 25/5 min (Clássico)
                    </button>
                    <button
                        className={`${styles.chip} ${currentMode === 15 ? styles.activeChip : ''}`}
                        onClick={() => changeMode(15)}
                    >
                        <Icon name="star" style={{ marginRight: '6px' }} /> 15/3 min (TDAH adaptado)
                    </button>
                    <button
                        className={`${styles.chip} ${currentMode === 50 ? styles.activeChip : ''}`}
                        onClick={() => changeMode(50)}
                    >
                        <Icon name="fire" style={{ marginRight: '6px' }} /> 50/10 min (Avançado)
                    </button>
                </div>

                <div className={styles['big-timer']}>
                    <div className={styles['big-timer-num']}>
                        {formatTime(timerSeconds)}
                    </div>
                    <div className={styles['big-timer-label']}>
                        {timerRunning ? 'Foco ativo...' : 'Pausado'}
                    </div>
                </div>

                <div className={styles['timer-controls']}>
                    <button className={styles['btn-primary']} onClick={toggleTimer}>
                        {timerRunning ? <><Icon name="pause" style={{ marginRight: '6px' }} /> Pausar</> : <><Icon name="play" style={{ marginRight: '6px' }} /> Iniciar</>}
                    </button>

                    <button className={styles['btn-secondary']} onClick={resetTimer}>
                        <Icon name="redo" style={{ marginRight: '6px' }} /> Reiniciar
                    </button>
                </div>

                {/* Seção Modo Foco Avançado (Desbloqueado com Moedas) */}
                <div className={styles['dash-card']} style={{ marginTop: '20px', width: '100%', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Syne', color: '#c0b8f7' }}>
                            <Icon name="headphones" style={{ marginRight: '6px' }} /> Modo Foco Avançado (Lofi / Sons)
                        </span>
                        {!isAudioUnlocked && (
                            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: '#7c6cfa' }}>
                                Bloqueado na Loja <Icon name="fa-solid fa-lock" />
                            </span>
                        )}
                    </div>

                    {isAudioUnlocked ? (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <select
                                value={selectedAudio}
                                onChange={(e) => {
                                    setSelectedAudio(e.target.value);
                                    setIsPlayingAudio(true);
                                }}
                                style={{
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '0.8rem'
                                }}
                            >
                                <option value="none">Nenhum som de fundo</option>
                                <option value="lofi">Música Lo-Fi</option>
                                <option value="rain">Chuva Relaxante</option>
                                <option value="cafe">Cafeteria</option>
                            </select>

                            {selectedAudio !== 'none' && (
                                <button
                                    onClick={toggleAudioPlay}
                                    style={{
                                        background: '#7c6cfa',
                                        border: 'none',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isPlayingAudio ? <><Icon name="pause" style={{ marginRight: '6px' }} /> Pausar</> : <><Icon name="play" style={{ marginRight: '6px' }} /> Tocar</>}
                                </button>
                            )}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                            Gaste suas moedas na <strong>Loja</strong> para desbloquear músicas de fundo e ruído de chuva!
                        </p>
                    )}
                </div>

                <div className={styles['stats-grid']}>
                    <div className={styles['dash-card']}>
                        <div className={styles['dash-num']}>{sessionsCompleted}</div>
                        <div className={styles['dash-sub']}>Sessões hoje</div>
                    </div>

                    <div className={styles['dash-card']}>
                        <div className={styles['dash-num']}>{totalFocusTime}</div>
                        <div className={styles['dash-sub']}>Total hoje</div>
                    </div>

                    <div className={styles['dash-card']}>
                        <div className={styles['dash-num']}>{focusScore}</div>
                        <div className={styles['dash-sub']}>Foco médio</div>
                    </div>
                </div>
            </div>

            {/* Modal de Feedback do Estudo */}
            {showFeedbackModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 999
                }}>
                    <div style={{
                        background: '#120f1d',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '420px',
                        color: '#fff',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <h3 style={{ fontFamily: 'Syne', fontSize: '1.1rem', marginBottom: '14px', textAlign: 'center' }}>
                            <Icon name="review" style={{ marginRight: '6px' }} /> Como foi a sua sessão?
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', textAlign: 'center' }}>
                            Responda rapidinho para registrar seu progresso e ganhar moedas!
                        </p>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Nível de Foco (1 a 5):</label>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setNivelFoco(n)}
                                        style={{
                                            flex: 1,
                                            background: nivelFoco === n ? '#7c6cfa' : 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            padding: '8px 0',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Sensação de Motivação:</label>
                            <select
                                value={motivacao}
                                onChange={(e) => setMotivacao(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <option value="Baixa">Baixa</option>
                                <option value="Media">Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Excelente">Excelente</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Houve distrações? O que aconteceu?</label>
                            <input
                                type="text"
                                value={distracoes}
                                onChange={(e) => setDistracoes(e.target.value)}
                                placeholder="Ex: notificações do celular, barulhos..."
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Comentários gerais:</label>
                            <textarea
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                placeholder="Escreva observações rápidas se quiser..."
                                rows="2"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '0.85rem',
                                    resize: 'none'
                                }}
                            />
                        </div>

                        <button
                            onClick={handleSaveFeedback}
                            style={{
                                width: '100%',
                                background: '#4ecdc4',
                                border: 'none',
                                color: '#0e0b16',
                                padding: '12px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            Salvar Sessão e Ganhar <Icon name="coins" style={{ color: '#0e0b16' }} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}