import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import MetaQuizModal from '../../components/MetaQuizModal';
import styles from './styles.module.css';
import { playSuccessSound, playChestSound } from '../../utils/audioUtils';

export default function Dashboard() {
    const navigate = useNavigate();
    const { userId } = useAuth();

    const [profile, setProfile] = useState({ name: 'Estudante', pontos: 0, streakDias: 0 });
    const [tasks, setTasks] = useState([]);
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
    const [totalFocusTime, setTotalFocusTime] = useState('0m');
    const [isOpeningChest, setIsOpeningChest] = useState(false);
    const [chestReward, setChestReward] = useState(null);
    const [metaToComplete, setMetaToComplete] = useState(null);

    const loadData = async () => {
        if (!userId) return;
        try {
            // Registrar acesso diário (para o Streak)
            await fetch(`http://localhost:8080/api/usuarios/${userId}/registrar-acesso`, { method: 'POST' });

            const profileRes = await fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`);
            if (profileRes.ok) setProfile(await profileRes.json());

            const metasRes = await fetch(`http://localhost:8080/api/metas?userId=${userId}`);
            if (metasRes.ok) setTasks(await metasRes.json());
        } catch (error) {
            console.error("Erro ao carregar dados do Dashboard:", error);
        }
    };

    const loadFocusTime = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/sessoes?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                const hojeStr = new Date().toISOString().split('T')[0];
                let totalMin = 0;
                data.forEach(s => {
                    if (s.foiConcluida && s.data.startsWith(hojeStr) && s.tempoReal) {
                        const parts = s.tempoReal.split(':');
                        totalMin += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                    }
                });
                setTotalFocusTime(totalMin >= 60 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m` : `${totalMin}m`);
            }
        } catch (e) { console.error(e); }
    };

    const loadAiSuggestion = async () => {
        if (!userId || isLoadingSuggestion) return;
        
        const cacheKey = `@FocusMind:aiSuggestion_${userId}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            const parsedCache = JSON.parse(cached);
            const now = Date.now();
            const sixHours = 6 * 60 * 60 * 1000;
            
            if (now - parsedCache.timestamp < sixHours) {
                setAiSuggestion(parsedCache.sugestao);
                return;
            }
        }

        setIsLoadingSuggestion(true);
        try {
            const response = await fetch('http://localhost:8080/api/chat/perguntar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    mensagem: "Analise minhas metas pendentes e rotina hoje. Dê uma única recomendação prática e curta (máximo 2 linhas).",
                    salvarNoHistorico: false
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.resposta && data.resposta.includes("429") && data.resposta.includes("Quota exceeded")) {
                    setAiSuggestion("Estou analisando muitos dados agora. Respire fundo e tente novamente em alguns segundos!");
                } else {
                    setAiSuggestion(data.resposta);
                    localStorage.setItem(cacheKey, JSON.stringify({
                        sugestao: data.resposta,
                        timestamp: Date.now()
                    }));
                }
            } else if (response.status === 429) {
                setAiSuggestion("Estou analisando muitos dados agora. Respire fundo e tente novamente em alguns segundos!");
            } else {
                setAiSuggestion("FocusBot precisou de uma pausa. Tente novamente mais tarde.");
            }
        } catch {
            setAiSuggestion("Não consegui contatar o assistente. Verifique sua conexão.");
        } finally {
            setIsLoadingSuggestion(false);
        }
    };

    useEffect(() => { loadData(); loadFocusTime(); }, [userId]);
    useEffect(() => {
        if (userId && tasks.length > 0) loadAiSuggestion();
        else if (userId && tasks.length === 0) setAiSuggestion("Você ainda não tem metas criadas. Cadastre uma tarefa abaixo para começar!");
    }, [userId, tasks.length]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskDesc.trim()) return;
        try {
            const res = await fetch('http://localhost:8080/api/metas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, descricao: newTaskDesc })
            });
            if (res.ok) { toast.success("Meta adicionada!"); setNewTaskDesc(''); loadData(); }
            else toast.error("Erro ao adicionar meta.");
        } catch { toast.error("Erro ao conectar ao servidor."); }
    };

    const initiateCompleteTask = (task) => {
        setMetaToComplete(task);
    };

    const confirmCompleteTask = async (id) => {
        setMetaToComplete(null);
        try {
            const res = await fetch(`http://localhost:8080/api/metas/${id}/concluir`, { method: 'PUT' });
            if (res.ok) { 
                playSuccessSound();
                toast.success("Meta concluída! +5 moedas 🪙"); 
                loadData(); 
            }
            else toast.error(await res.text() || "Erro ao concluir meta.");
        } catch { toast.error("Erro ao conectar."); }
    };

    const handleDeleteTask = async (id) => {
        try {
            const res = await fetch(`http://localhost:8080/api/metas/${id}`, { method: 'DELETE' });
            if (res.ok) { toast.success("Meta excluída."); loadData(); }
            else toast.error("Erro ao excluir meta.");
        } catch { toast.error("Erro ao conectar."); }
    };

    const totalTasks = tasks.length;
    const completedCount = tasks.filter(t => t.status === 'C').length;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    const activeTasks = tasks.filter(t => t.status === 'A');

    const achievementsCount = [
        tasks.filter(t => t.status === 'C').length >= 1,
        profile.streakDias >= 3,
        profile.pontos >= 100,
        tasks.filter(t => t.status === 'C').length >= 10
    ].filter(Boolean).length;

    const handleOpenChest = async () => {
        if (isOpeningChest) return;
        setIsOpeningChest(true);
        
        try {
            const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/abrir-bau`, { method: 'POST' });
            if (res.ok) {
                const moedas = await res.json();
                
                // Toca som e espera 1.5s (animação de shake/abrir antes de revelar)
                setTimeout(() => {
                    playChestSound();
                    setChestReward(moedas);
                    
                    // Atualiza pontuação em tempo real na tela
                    setProfile(prev => ({
                        ...prev,
                        bausDisponiveis: prev.bausDisponiveis - 1,
                        pontos: prev.pontos + moedas
                    }));
                }, 1500);

                // Fecha o modal depois de alguns segundos
                setTimeout(() => {
                    setChestReward(null);
                    setIsOpeningChest(false);
                }, 4500);
            } else {
                setIsOpeningChest(false);
                toast.error("Erro ao abrir baú!");
            }
        } catch {
            setIsOpeningChest(false);
            toast.error("Sem conexão.");
        }
    };

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    return (
        <div className={styles.page}>

            {/* Hero / Saudação */}
            <div className={styles.hero}>
                <div className={styles.heroLeft}>
                    <p className={styles.heroGreeting}>{greeting} 👋</p>
                    <h1 className={styles.heroName}>{profile.name}</h1>
                    <p className={styles.heroSubtitle}>
                        {activeTasks.length > 0
                            ? `Você tem ${activeTasks.length} tarefa${activeTasks.length !== 1 ? 's' : ''} ativa${activeTasks.length !== 1 ? 's' : ''} para hoje.`
                            : 'Nenhuma meta ativa. Que tal definir uma nova?'}
                    </p>
                </div>
                <div className={styles.heroRight}>
                    <div className={styles.heroStatChip}>
                        <Icon name="fire" style={{ color: profile.streakDias > 0 ? '#ff6b6b' : '#555' }} />
                        <span>{profile.streakDias} dias de sequência</span>
                    </div>
                    <div className={styles.progressRing}>
                        <svg viewBox="0 0 64 64" className={styles.progressSvg}>
                            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                            <circle
                                cx="32" cy="32" r="28" fill="none"
                                stroke="#7c6cfa" strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionRate / 100)}`}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.8s ease' }}
                            />
                        </svg>
                        <div className={styles.progressLabel}>
                            <span className={styles.progressVal}>{completionRate}%</span>
                            <span className={styles.progressSub}>metas</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(78,205,196,.12)' }}>
                        <Icon name="timer" style={{ color: '#4ecdc4' }} />
                    </div>
                    <div className={styles.statVal}>{totalFocusTime}</div>
                    <div className={styles.statLabel}>Foco hoje</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(247,197,159,.12)' }}>
                        <Icon name="coins" style={{ color: '#f7c59f' }} />
                    </div>
                    <div className={styles.statVal}>{profile.pontos}</div>
                    <div className={styles.statLabel}>Moedas</div>
                </div>
                <div className={styles.statCard} onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                    <div className={styles.statIcon} style={{ background: 'rgba(255,215,0,.12)' }}>
                        <Icon name="trophy" style={{ color: '#ffd700' }} />
                    </div>
                    <div className={styles.statVal}>{achievementsCount}</div>
                    <div className={styles.statLabel}>Conquistas</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(124,108,250,.12)' }}>
                        <Icon name="check" style={{ color: '#7c6cfa' }} />
                    </div>
                    <div className={styles.statVal}>{completedCount}/{totalTasks}</div>
                    <div className={styles.statLabel}>Concluídas</div>
                </div>
            </div>

            {/* Baú Flutuante */}
            {profile.bausDisponiveis > 0 && !isOpeningChest && (
                <div className={styles.floatingChestBtn} onClick={handleOpenChest} data-tooltip="Abrir Baú Misterioso!">
                    <div className={styles.chestBadge}>{profile.bausDisponiveis}</div>
                    <Icon name="gift" />
                </div>
            )}

            {/* Modal do Baú Sendo Aberto */}
            {isOpeningChest && (
                <div className={styles.chestModalOverlay}>
                    <div className={styles.chestModalContent}>
                        {!chestReward ? (
                            <div className={styles.openingAnimation}>
                                <div className={styles.bigChest}><Icon name="box" style={{ color: '#f7c59f' }} /></div>
                                <h2>Abrindo...</h2>
                            </div>
                        ) : (
                            <div className={styles.rewardAnimation}>
                                <h2>Você ganhou!</h2>
                                <div className={styles.hugeCoins}>+{chestReward}</div>
                                <p>Moedas adicionadas ao seu saldo.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Grid principal */}
            <div className={styles.mainGrid}>

                {/* Metas */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>
                            <Icon name="target" style={{ marginRight: '8px', color: '#7c6cfa' }} />
                            Metas de Estudo
                        </h3>
                        <span className={styles.taskBadge}>{activeTasks.length} ativas</span>
                    </div>

                    <form onSubmit={handleAddTask} className={styles.addTaskForm}>
                        <input
                            type="text"
                            className={styles.taskInput}
                            placeholder="ex: Ler capítulo 3 de Cálculo..."
                            value={newTaskDesc}
                            onChange={(e) => setNewTaskDesc(e.target.value)}
                        />
                        <button type="submit" className={styles.btnAdd}><Icon name="plus" /></button>
                    </form>

                    <div className={styles.taskList}>
                        {tasks.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Icon name="target" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '8px' }} />
                                <p>Nenhuma meta ainda. Defina uma acima!</p>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`${styles.taskItem} ${task.status === 'C' ? styles.taskDone : ''}`}
                                >
                                    <div className={styles.taskBar} style={{ background: task.status === 'C' ? '#4ecdc4' : '#7c6cfa' }} />
                                    <span className={styles.taskDesc}>{task.descricao}</span>
                                    <div className={styles.taskActions}>
                                        {task.status !== 'C' && (
                                            <button className={styles.btnComplete} onClick={() => initiateCompleteTask(task)}>
                                                <Icon name="check" />
                                            </button>
                                        )}
                                        <button className={styles.btnDelete} onClick={() => handleDeleteTask(task.id)}>
                                            <Icon name="delete" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* FocusBot */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>
                            <Icon name="bot" style={{ marginRight: '8px', color: '#7c6cfa' }} />
                            FocusBot
                        </h3>
                        <span className={styles.aiPill}>IA</span>
                    </div>

                    <div className={styles.aiBubble}>
                        {isLoadingSuggestion ? (
                            <div className={styles.loadingDots}>
                                <span></span><span></span><span></span>
                            </div>
                        ) : (
                            <p>{aiSuggestion || "Aguardando dados para gerar sugestão..."}</p>
                        )}
                    </div>

                    <button className={styles.btnChat} onClick={() => navigate('/chat')}>
                        <Icon name="bot" style={{ marginRight: '6px' }} />
                        Abrir chat completo
                    </button>
                </div>

            </div>

            {/* Modal de Quiz para Meta */}
            {metaToComplete && (
                <MetaQuizModal 
                    task={metaToComplete}
                    onSuccess={() => confirmCompleteTask(metaToComplete.id)}
                    onClose={() => setMetaToComplete(null)}
                />
            )}

        </div>
    );
}