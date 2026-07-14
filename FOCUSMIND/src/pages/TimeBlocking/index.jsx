import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import styles from './styles.module.css';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function TimeBlocking() {
    const { userId } = useAuth();

    const [blocks, setBlocks] = useState([]);
    const [materia, setMateria] = useState('');
    const [diaSemana, setDiaSemana] = useState('Segunda');
    const [horaInicio, setHoraInicio] = useState('09:00');
    const [horaFim, setHoraFim] = useState('10:00');

    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    const loadBlocks = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/timeblocking?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setBlocks(data);
            }
        } catch (error) {
            console.error("Erro ao carregar blocos de tempo:", error);
        }
    };

    useEffect(() => {
        loadBlocks();
    }, [userId]);

    const handleAddBlockLocal = (e) => {
        e.preventDefault();
        if (!materia.trim()) {
            toast.error("Por favor, digite a matéria ou atividade!");
            return;
        }

        // Criar bloco localmente
        const newBlock = {
            materia,
            diaSemana,
            horaInicio,
            horaFim
        };

        setBlocks(prev => [...prev, newBlock]);
        setMateria('');
        toast.success("Bloco adicionado localmente. Lembre-se de salvar!");
    };

    const handleDeleteBlockLocal = (indexToDelete) => {
        setBlocks(prev => prev.filter((_, idx) => idx !== indexToDelete));
    };

    const handleSaveBlocks = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:8080/api/timeblocking?userId=${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(blocks)
            });

            if (response.ok) {
                toast.success("Grade de Time Blocking salva com sucesso!");
                loadBlocks();
            } else {
                toast.error("Erro ao salvar a grade.");
            }
        } catch (error) {
            toast.error("Erro ao conectar com o servidor.");
        }
    };

    const handleRequestAiSuggestion = async () => {
        if (!userId) return;
        setIsLoadingAi(true);
        setAiSuggestion('FocusBot analisando suas tarefas e montando uma grade de estudos otimizada...');

        try {
            const response = await fetch(`http://localhost:8080/api/timeblocking/sugerir?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setAiSuggestion(data.sugestao);
            } else {
                setAiSuggestion('Ocorreu um erro ao obter sugestão da IA.');
            }
        } catch (error) {
            setAiSuggestion('Não foi possível conectar à IA. Verifique se o backend está ativo.');
        } finally {
            setIsLoadingAi(false);
        }
    };

    return (
        <div className={styles.page}>

                <div className={styles.header}>
                    <h2 className={styles.title}><Icon name="calendar" style={{ marginRight: '8px' }} /> Bloqueio de Tempo (Time Blocking)</h2>
                    <p className={styles.desc}>
                        Planeje seu dia em blocos dedicados de foco. Esta técnica reduz o cansaço mental e ajuda a combater distrações e procrastinação.
                    </p>
                </div>

                <div className={styles.layout}>

                    {/* Grade Semanal */}
                    <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                        <div className={styles.cardTitle}>
                            <span><Icon name="calendar" style={{ marginRight: '8px' }} /> Sua Grade Semanal</span>
                            <button className={styles.btnPrimary} onClick={handleSaveBlocks}>
                                <Icon name="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }} /> Salvar Grade no Servidor
                            </button>
                        </div>

                        <div className={styles.grid}>
                            {DIAS_SEMANA.map(day => {
                                const dayBlocks = blocks.filter(b => b.diaSemana === day);
                                return (
                                    <div key={day} className={styles.dayColumn}>
                                        <div className={styles.dayName}>{day}</div>
                                        {dayBlocks.length === 0 ? (
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '10px 0' }}>
                                                Livre
                                            </div>
                                        ) : (
                                            dayBlocks.map((b, idx) => {
                                                // Encontrar o index real no array original
                                                const originalIdx = blocks.findIndex(original => original === b);
                                                return (
                                                    <div key={idx} className={styles.blockItem}>
                                                        <div className={styles.blockTime}>{b.horaInicio} - {b.horaFim}</div>
                                                        <div className={styles.blockSubject}>{b.materia}</div>
                                                        <button 
                                                            className={styles.btnDeleteBlock}
                                                            onClick={() => handleDeleteBlockLocal(originalIdx)}
                                                        >
                                                            <Icon name="trash" />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Formulário para Adicionar Bloco */}
                        <form onSubmit={handleAddBlockLocal} className={styles.formAddBlock}>
                            <input
                                type="text"
                                className={styles.inputField}
                                placeholder="Matéria ou atividade (ex: Cálculo, Exercícios)"
                                value={materia}
                                onChange={(e) => setMateria(e.target.value)}
                            />

                            <select
                                className={styles.inputField}
                                value={diaSemana}
                                onChange={(e) => setDiaSemana(e.target.value)}
                            >
                                {DIAS_SEMANA.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>

                            <input
                                type="time"
                                className={styles.inputField}
                                value={horaInicio}
                                onChange={(e) => setHoraInicio(e.target.value)}
                            />

                            <input
                                type="time"
                                className={styles.inputField}
                                value={horaFim}
                                onChange={(e) => setHoraFim(e.target.value)}
                            />

                            <button type="submit" className={styles.btnPrimary}>
                                <Icon name="plus" /> Bloco
                            </button>
                        </form>
                    </div>

                    {/* Recomendação da IA */}
                    <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                        <div className={styles.cardTitle}>
                            <span><Icon name="bot" style={{ marginRight: '8px' }} /> Assistente de Planejamento FocusBot</span>
                            <button 
                                className={styles.btnSecondary}
                                onClick={handleRequestAiSuggestion}
                                disabled={isLoadingAi}
                            >
                                {isLoadingAi ? 'Analisando...' : <><Icon name="star" style={{ marginRight: '6px' }} /> Sugerir Grade Inteligente</>}
                            </button>
                        </div>

                        <div className={styles.aiCard}>
                            O FocusBot pode analisar suas metas de estudo ativas e gerar uma grade inteligente balanceada de Time Blocking, distribuindo matérias de forma otimizada para evitar exaustão.
                            
                            {aiSuggestion && (
                                <div className={styles.aiResponseBox}>
                                    <strong>Resumo da Sugestão da IA:</strong><br />
                                    {aiSuggestion}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

        </div>
    );
}
