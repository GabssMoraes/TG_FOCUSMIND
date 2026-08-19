import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/Icon';
import styles from './styles.module.css';
import { toast } from 'react-hot-toast';
import { playChestSound } from '../../utils/audioUtils';

export default function Jornada() {
    const navigate = useNavigate();
    const { userId } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeNodeIndex, setActiveNodeIndex] = useState(null);

    const loadProfileData = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const profileRes = await fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`);
            if (profileRes.ok) {
                setProfile(await profileRes.json());
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfileData();
    }, [userId]);

    // Definição dos nós da trilha (níveis da história)
    const nodes = [
        { id: 1, title: 'O Despertar', reqPoints: 0, lore: 'Você decidiu mudar. O caminho para a genialidade começa com o primeiro passo.', reward: 'N/A' },
        { id: 2, title: 'Floresta da Procrastinação', reqPoints: 50, lore: 'As distrações espreitam em cada notificação. Você usou o Pomodoro para passar ileso.', reward: 'Baú de Bronze' },
        { id: 3, title: 'Vale do Foco Profundo', reqPoints: 150, lore: 'O ruído do mundo não te afeta mais. Suas sessões de estudo são puras e contínuas.', reward: 'Baú de Prata' },
        { id: 4, title: 'Montanha da Retenção', reqPoints: 300, lore: 'Sua memória se tornou um cofre. O que você lê, você absorve e domina.', reward: 'Baú de Ouro' },
        { id: 5, title: 'Templo da Genialidade', reqPoints: 500, lore: 'Você atingiu o ápice da disciplina. O FocusMind é parte da sua essência.', reward: 'Baú Diamante' },
    ];

    const handleNodeClick = (node, isUnlocked) => {
        if (isUnlocked) {
            setActiveNodeIndex(node.id);
        } else {
            toast.error(`Você precisa de ${node.reqPoints} moedas para desbloquear este nível!`);
        }
    };

    if (isLoading) {
        return <div className={styles.page}><p style={{color: 'white', textAlign: 'center', marginTop: '40px'}}>Carregando mapa da jornada...</p></div>;
    }

    const currentPoints = profile?.pontos || 0;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>
                    ← Voltar
                </button>
                <div className={styles.pointsBadge}>
                    <Icon name="coins" style={{ color: '#f7c59f', marginRight: '6px' }} />
                    {currentPoints} Moedas
                </div>
            </div>

            <div className={styles.titleContainer}>
                <h1 className={styles.title}><Icon name="star" /> Jornada do Estudante</h1>
                <p className={styles.subtitle}>
                    Acompanhe seu progresso através da história. Acumule moedas para desbloquear novos capítulos e recompensas!
                </p>
            </div>

            <div className={styles.mapContainer}>
                <div className={styles.pathLine}></div>
                
                {nodes.map((node, index) => {
                    const isUnlocked = currentPoints >= node.reqPoints;
                    const isNextToUnlock = !isUnlocked && (index === 0 || currentPoints >= nodes[index - 1].reqPoints);
                    const isActive = activeNodeIndex === node.id;
                    
                    let nodeClass = styles.node;
                    if (isUnlocked) nodeClass += ` ${styles.unlocked}`;
                    if (isNextToUnlock) nodeClass += ` ${styles.next}`;
                    if (isActive) nodeClass += ` ${styles.active}`;

                    return (
                        <div key={node.id} className={styles.nodeWrapper}>
                            <div className={nodeClass} onClick={() => handleNodeClick(node, isUnlocked)}>
                                {isUnlocked ? <Icon name="check" /> : <Icon name="lock" className="fa-solid fa-lock" />}
                            </div>
                            
                            <div className={styles.nodeInfo}>
                                <h3 className={styles.nodeTitle}>{node.title}</h3>
                                {isUnlocked ? (
                                    <p className={styles.nodeReq}>Desbloqueado!</p>
                                ) : (
                                    <p className={styles.nodeReq}>Requer {node.reqPoints} moedas</p>
                                )}
                            </div>

                            {isActive && (
                                <div className={styles.loreCard}>
                                    <div className={styles.loreHeader}>
                                        <Icon name="book" /> Capítulo {node.id}
                                    </div>
                                    <p className={styles.loreText}>{node.lore}</p>
                                    <div className={styles.loreReward}>
                                        <Icon name="gift" /> Recompensa do Nível: {node.reward}
                                    </div>
                                    <button className={styles.btnLoreClose} onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveNodeIndex(null);
                                    }}>
                                        Fechar
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
