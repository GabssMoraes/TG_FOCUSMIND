import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import styles from './styles.module.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const { userId } = useAuth();

    const [profile, setProfile] = useState({ name: 'Estudante', pontos: 0, streakDias: 0 });
    const [tasks, setTasks] = useState([]);
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
    const [totalFocusTime, setTotalFocusTime] = useState('0m');

    const loadData = async () => {
        if (!userId) return;
        try {
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
        setIsLoadingSuggestion(true);
        try {
            const response = await fetch('http://localhost:8080/api/chat/perguntar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    mensagem: "Analise minhas metas pendentes e rotina hoje. Dê uma única recomendação prática e curta (máximo 2 linhas)."
                })
            });
            if (response.ok) {
                const data = await response.json();
                setAiSuggestion(data.resposta);
            } else {
                setAiSuggestion("Crie metas abaixo para receber orientações do FocusBot!");
            }
        } catch {
            setAiSuggestion("Não consegui contatar o assistente. Verifique se o backend está ativo.");
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

    const handleCompleteTask = async (id) => {
        try {
            const res = await fetch(`http://localhost:8080/api/metas/${id}/concluir`, { method: 'PUT' });
            if (res.ok) { toast.success("Meta concluída! +5 moedas 🪙"); loadData(); }
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

    return (
        <div className={styles.page}>
            {/* Saudação */}
            <div className={styles.greeting}>
                <h2 className={styles.greetingTitle}>Olá, {profile.name} <Icon name="handWave" className="wave-animation" style={{ color: '#f7d541ff' }} /></h2>
                <p className={styles.greetingSubtitle}>
                    {activeTasks.length > 0
                        ? <span>Você tem {activeTasks.length} tarefa{activeTasks.length !== 1 ? 's' : ''} ativa{activeTasks.length !== 1 ? 's' : ''}. Sequência: {profile.streakDias} dias <Icon name="fire" style={{ color: '#ff6b6b' }} /></span>
                        : <span>Sua sequência está em {profile.streakDias} dias <Icon name="fire" style={{ color: '#ff6b6b' }} /> — vamos adicionar uma meta hoje!</span>}
                </p>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(78,205,196,.12)' }}><Icon name="timer" style={{ color: '#4ecdc4' }} /></div>
                    <div className={styles.statVal}>{totalFocusTime}</div>
                    <div className={styles.statLabel}>Foco hoje</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(124,108,250,.12)' }}><Icon name="check" style={{ color: '#7c6cfa' }} /></div>
                    <div className={styles.statVal}>{completionRate}%</div>
                    <div className={styles.statLabel}>Conclusão</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(247,197,159,.12)' }}><Icon name="coins" style={{ color: '#f7c59f' }} /></div>
                    <div className={styles.statVal}>{profile.pontos}</div>
                    <div className={styles.statLabel}>Moedas</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(255,107,107,.1)' }}><Icon name="fire" style={{ color: '#ff6b6b' }} /></div>
                    <div className={styles.statVal}>{profile.streakDias}d</div>
                    <div className={styles.statLabel}>Sequência</div>
                </div>
            </div>

            {/* Grid principal */}
            <div className={styles.mainGrid}>

                {/* Metas */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}><Icon name="target" style={{ marginRight: '8px', color: '#7c6cfa' }} /> Metas de Estudo</h3>
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
                            <p className={styles.emptyState}>Nenhuma meta ainda. Defina uma acima!</p>
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
                                            <button className={styles.btnComplete} onClick={() => handleCompleteTask(task.id)}>
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
                        <h3 className={styles.cardTitle}><Icon name="bot" style={{ marginRight: '8px', color: '#7c6cfa' }} /> FocusBot — Sugestão</h3>
                    </div>

                    <div className={styles.aiBubble}>
                        {isLoadingSuggestion ? (
                            <span className={styles.loading}>Analisando sua rotina...</span>
                        ) : (
                            aiSuggestion || "Aguardando dados para gerar sugestão..."
                        )}
                    </div>

                    <button className={styles.btnChat} onClick={() => navigate('/chat')}>
                        Abrir chat completo →
                    </button>
                </div>

            </div>

            {/* Quick actions */}
            <div className={styles.quickActions}>
                <button
                    className={styles.quickBtn}
                    onClick={() => navigate('/timer')}
                    data-tooltip="Cronômetro com ciclos de foco e pausa"
                >
                    <Icon name="timer" style={{ marginRight: '6px' }} /> Iniciar Pomodoro
                </button>
                <button
                    className={styles.quickBtn}
                    onClick={() => navigate('/timeblocking')}
                    data-tooltip="Acesse sua grade horária de bloqueio de tempo"
                >
                    <Icon name="calendar" style={{ marginRight: '6px' }} /> Grade Semanal
                </button>
                <button
                    className={styles.quickBtn}
                    onClick={() => navigate('/revisao')}
                    data-tooltip="Faça sua autoavaliação metacognitiva da semana"
                >
                    <Icon name="review" style={{ marginRight: '6px' }} /> Revisão Semanal
                </button>
                <button
                    className={styles.quickBtn}
                    onClick={() => navigate('/loja')}
                    data-tooltip="Use suas moedas acumuladas para resgatar recompensas"
                >
                    <Icon name="coins" style={{ marginRight: '6px' }} /> Loja
                </button>
            </div>
        </div>
    );
}