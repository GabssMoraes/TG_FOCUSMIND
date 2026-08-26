import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import PauseMode from '../../components/PauseMode';
import styles from './styles.module.css';

// ── Constelações famosas com threshold por estrela (viewBox 0 0 100 60) ──
const CONSTELLATIONS = [
    {
        name: 'Orion — O Caçador',
        stars: [
            { id: 0, cx: 38, cy: 20, threshold: 0,  size: 1.4 }, // Betelgeuse
            { id: 1, cx: 55, cy: 17, threshold: 14, size: 1.1 }, // Bellatrix
            { id: 2, cx: 42, cy: 33, threshold: 25, size: 1.0 }, // Alnitak
            { id: 3, cx: 49, cy: 32, threshold: 37, size: 1.0 }, // Alnilam
            { id: 4, cx: 56, cy: 31, threshold: 50, size: 1.0 }, // Mintaka
            { id: 5, cx: 33, cy: 48, threshold: 63, size: 1.3 }, // Rigel
            { id: 6, cx: 60, cy: 47, threshold: 76, size: 1.0 }, // Saiph
            { id: 7, cx: 46, cy: 23, threshold: 90, size: 0.8 }, // Meissa
        ],
        edges: [[0,7],[1,7],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]],
    },
    {
        name: 'Ursa Maior — A Concha',
        stars: [
            { id: 0, cx: 15, cy: 42, threshold: 0,  size: 1.1 },
            { id: 1, cx: 25, cy: 35, threshold: 13, size: 1.0 },
            { id: 2, cx: 36, cy: 30, threshold: 26, size: 1.1 },
            { id: 3, cx: 50, cy: 26, threshold: 40, size: 0.9 },
            { id: 4, cx: 58, cy: 15, threshold: 54, size: 1.0 },
            { id: 5, cx: 69, cy: 22, threshold: 67, size: 1.2 },
            { id: 6, cx: 65, cy: 34, threshold: 80, size: 1.0 },
            { id: 7, cx: 50, cy: 38, threshold: 92, size: 0.9 },
        ],
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,3]],
    },
    {
        name: 'Cassiopeia — O W',
        stars: [
            { id: 0, cx: 14, cy: 18, threshold: 0,  size: 1.2 },
            { id: 1, cx: 28, cy: 40, threshold: 22, size: 1.1 },
            { id: 2, cx: 46, cy: 12, threshold: 44, size: 1.3 },
            { id: 3, cx: 64, cy: 38, threshold: 66, size: 1.0 },
            { id: 4, cx: 80, cy: 10, threshold: 88, size: 1.1 },
        ],
        edges: [[0,1],[1,2],[2,3],[3,4]],
    },
    {
        name: 'Leão — O Leão',
        stars: [
            { id: 0, cx: 20, cy: 44, threshold: 0,  size: 1.4 }, // Regulus
            { id: 1, cx: 27, cy: 30, threshold: 14, size: 0.9 },
            { id: 2, cx: 35, cy: 19, threshold: 28, size: 1.1 },
            { id: 3, cx: 44, cy: 12, threshold: 42, size: 0.9 },
            { id: 4, cx: 55, cy: 22, threshold: 56, size: 1.0 },
            { id: 5, cx: 72, cy: 28, threshold: 70, size: 1.2 }, // Denebola
            { id: 6, cx: 50, cy: 38, threshold: 85, size: 0.9 },
        ],
        edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[0,6]],
    },
    {
        name: 'Cruz do Sul — Cruzeiro',
        stars: [
            { id: 0, cx: 50, cy: 8,  threshold: 0,  size: 1.3 }, // topo
            { id: 1, cx: 50, cy: 52, threshold: 20, size: 1.1 }, // base
            { id: 2, cx: 20, cy: 30, threshold: 40, size: 1.2 }, // esquerda
            { id: 3, cx: 80, cy: 30, threshold: 60, size: 1.3 }, // direita - mais brilhante
            { id: 4, cx: 62, cy: 18, threshold: 80, size: 0.8 }, // extra
        ],
        edges: [[0,1],[2,3],[0,4]],
    },
];

// Estrelas de fundo — misto de pequenas e médias com brilho variado
const BG_STARS = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    cx: (((i * 37 + 13) % 98) + 1),
    cy: (((i * 53 + 7)  % 58) + 1),
    r: i % 5 === 0 ? 0.7 : i % 3 === 0 ? 0.45 : 0.28,
    opacity: 0.2 + ((i * 17) % 60) / 100,
    twinkleDelay: (i * 0.3) % 4,
}));

function FullScreenConstellation({ progress, constellationIdx }) {
    const c = CONSTELLATIONS[constellationIdx % CONSTELLATIONS.length];

    return (
        <svg
            className={styles.fullscreenConstellation}
            viewBox="0 0 100 60"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Nebulosa de fundo — gradientes radiais suaves */}
            <defs>
                <radialGradient id="nebula1" cx="70%" cy="20%" r="40%">
                    <stop offset="0%" stopColor="rgba(80,30,180,0.25)" />
                    <stop offset="100%" stopColor="rgba(80,30,180,0)" />
                </radialGradient>
                <radialGradient id="nebula2" cx="20%" cy="70%" r="40%">
                    <stop offset="0%" stopColor="rgba(10,60,160,0.2)" />
                    <stop offset="100%" stopColor="rgba(10,60,160,0)" />
                </radialGradient>
                <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(192,184,247,0.8)" />
                    <stop offset="100%" stopColor="rgba(192,184,247,0)" />
                </radialGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="0.4" result="blur" />
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>

            {/* Manchas de nebulosa */}
            <rect width="100" height="60" fill="url(#nebula1)" />
            <rect width="100" height="60" fill="url(#nebula2)" />

            {/* Estrelas de fundo com brilho variado — agora no formato de 4 pontas */}
            {BG_STARS.map(s => (
                <path
                    key={s.id}
                    d="M0,-1 Q0,0 1,0 Q0,0 0,1 Q0,0 -1,0 Q0,0 0,-1 Z"
                    fill={`rgba(255,255,255,${s.opacity})`}
                    style={{
                        transform: `translate(${s.cx}px, ${s.cy}px) scale(${s.r * 1.2})`,
                        animation: `twinkle ${2 + s.twinkleDelay}s ease-in-out infinite alternate`,
                        animationDelay: `${s.twinkleDelay}s`
                    }}
                />
            ))}

            {/* Linhas da constelação — aparecem só quando os 2 nós estão visíveis */}
            {c.edges.map(([a, b]) => {
                const starA = c.stars[a];
                const starB = c.stars[b];
                const visible = progress >= starA.threshold && progress >= starB.threshold;
                return (
                    <line
                        key={`e-${a}-${b}`}
                        x1={starA.cx} y1={starA.cy}
                        x2={starB.cx} y2={starB.cy}
                        stroke="rgba(192,184,247,0.6)"
                        strokeWidth="0.35"
                        strokeLinecap="round"
                        style={{
                            opacity: visible ? 1 : 0,
                            transition: 'opacity 1.5s ease',
                        }}
                    />
                );
            })}

            {/* Estrelas da constelação — aparecem progressivamente */}
            {c.stars.map(s => {
                const visible = progress >= s.threshold;
                return (
                    <g key={s.id} filter="url(#glow)" transform={`translate(${s.cx}, ${s.cy})`}>
                        {/* Halo de brilho */}
                        <circle
                            cx="0" cy="0"
                            r={s.size * 2.5}
                            fill={visible ? 'rgba(192,184,247,0.15)' : 'transparent'}
                            style={{ transition: 'fill 1.2s ease' }}
                        />
                        {/* Estrela principal em formato de 4 pontas */}
                        <path
                            d="M0,-1 Q0,0 1,0 Q0,0 0,1 Q0,0 -1,0 Q0,0 0,-1 Z"
                            fill="#e8e4ff"
                            style={{
                                transform: `scale(${visible ? s.size * 1.5 : 0})`,
                                transition: 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                                transformOrigin: 'center'
                            }}
                        />
                    </g>
                );
            })}

            {/* Nome da constelação */}
            <text
                x="50" y="57.5"
                textAnchor="middle"
                fontSize="2.8"
                fill={`rgba(192,184,247,${Math.max(0, (progress - 70) / 30 * 0.7)})`}
                fontFamily="DM Sans"
                letterSpacing="0.6"
                style={{ transition: 'fill 1s ease' }}
            >
                {c.name.toUpperCase()}
            </text>
        </svg>
    );
}


export default function Timer() {
    const navigate = useNavigate();
    const { userId } = useAuth();

    // Timer states
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [constellationIdx, setConstellationIdx] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [currentMode, setCurrentMode] = useState(25); // 25, 15, or 50 minutes
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState("0m");
    const [focusScore, setFocusScore] = useState("100%");

    // Feedback modal states
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showPauseMode, setShowPauseMode] = useState(false);
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
        // Sorteia nova constelação
        setConstellationIdx(prev => (prev + 1) % CONSTELLATIONS.length);
    };

    const changeMode = (minutes) => {
        setTimerRunning(false);
        setCurrentMode(minutes);
        setTimerSeconds(minutes * 60);
        setConstellationIdx(prev => (prev + 1) % CONSTELLATIONS.length);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Lógica da Plantação de Foco
    const progress = ((currentMode * 60 - timerSeconds) / (currentMode * 60)) * 100;
    
    // stage 0: semente (0%)
    // stage 1: caule cresce (25%)
    // stage 2: folhas (50%)
    // stage 3: copa (75%)
    // stage 4: frutos (100%)
    const plantStage = progress >= 100 ? 4 : progress >= 75 ? 3 : progress >= 50 ? 2 : progress >= 15 ? 1 : 0;

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
                toast.success("Sessão registrada! +10 moedas ganhas");
                setShowFeedbackModal(false);
                setDistracoes('');
                setComentario('');
                setTimerSeconds(currentMode * 60);
                loadStats();
                // Exibe modo de pausa guiada
                setShowPauseMode(true);
            } else {
                toast.error("Erro ao registrar sessão.");
            }
        } catch (error) {
            toast.error("Erro ao comunicar com o servidor.");
        }
    };

    // Opacidade do timer: começa em 1, vai diminuindo para 0.20 ao final para revelar a constelação
    const timerOpacity = Math.max(0.20, 1 - (progress / 100) * 0.8);

    return (
        <div className={styles.page}>
            {/* Constelação full-screen de fundo */}
            <FullScreenConstellation progress={progress} constellationIdx={constellationIdx} />

            <div className={styles['timer-page']} style={{ opacity: timerOpacity, transition: 'opacity 1.5s ease' }}>
                <div className={`${styles.section} ${styles['timer-section']}`}>
                    <div className={styles['section-label']}>Temporizador de Foco</div>
                    <div className={styles['section-title']}>Sessão de Estudos</div>

                    <p className={styles['section-desc']}>
                        Mantenha o foco absoluto. O temporizador guiará seus intervalos de descanso.
                    </p>
                </div>

                <div className={styles['chips-row']}>
                    <button
                        className={`${styles.chip} ${currentMode === 1 ? styles.activeChip : ''}`}
                        onClick={() => changeMode(1)}
                        title="Modo rápido para testes"
                    >
                        <Icon name="timer" style={{ marginRight: '6px' }} /> 1 min (Teste)
                    </button>
                    <button
                        className={`${styles.chip} ${currentMode === 25 ? styles.activeChip : ''}`}
                        onClick={() => changeMode(25)}
                    >
                        <Icon name="timer" style={{ marginRight: '6px' }} /> 25 min (Clássico)
                    </button>
                    <button
                        className={`${styles.chip} ${currentMode === 15 ? styles.activeChip : ''}`}
                        onClick={() => changeMode(15)}
                    >
                        <Icon name="star" style={{ marginRight: '6px' }} /> 15 min (TDAH)
                    </button>
                    <button
                        className={`${styles.chip} ${currentMode === 50 ? styles.activeChip : ''}`}
                        onClick={() => changeMode(50)}
                    >
                        <Icon name="fire" style={{ marginRight: '6px' }} /> 50 min (Avançado)
                    </button>
                </div>

                {/* Timer circular - LIMPO */}
                <div className={styles['big-timer']} style={{ 
                    background: `conic-gradient(var(--accent) ${progress}%, rgba(255,255,255,0.05) ${progress}%)`
                }}>
                    <div className={styles['timer-inner']}>
                        <div className={styles['big-timer-num']}>
                            {formatTime(timerSeconds)}
                        </div>
                        <div className={styles['big-timer-label']}>
                            {timerRunning ? 'Foco ativo...' : 'Pausado'}
                        </div>
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

                {/* Legenda da constelação atual */}
                <div className={styles.constellationBadge} style={{ opacity: Math.max(0.4, progress / 100) }}>
                    <Icon name="star" style={{ marginRight: '5px', fontSize: '0.7rem' }} />
                    {CONSTELLATIONS[constellationIdx % CONSTELLATIONS.length].name}
                </div>

                {/* Seção Modo Foco Avançado (Desbloqueado com Moedas) */}
                <div className={styles['dash-card']} style={{ marginTop: '20px', marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
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

            {/* Modo Pausa Guiada */}
            {showPauseMode && (
                <PauseMode
                    sessionMinutes={currentMode}
                    onPauseEnd={() => { setShowPauseMode(false); }}
                    onSkip={() => setShowPauseMode(false)}
                />
            )}
        </div>
    );
}