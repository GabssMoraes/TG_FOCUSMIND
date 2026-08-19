import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/Icon';
import styles from './styles.module.css';

export default function Profile() {
    const navigate = useNavigate();
    const { userId } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [metasConcluidas, setMetasConcluidas] = useState(0);

    const [toggles, setToggles] = useState({
        lembretes: true,
        musica: true,
        noturno: true,
        relatorio: false,
        sugestoes: true
    });

    const loadProfileData = async () => {
        if (!userId) return;
        try {
            const profileRes = await fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`);
            if (profileRes.ok) {
                setProfile(await profileRes.json());
            }

            const metasRes = await fetch(`http://localhost:8080/api/metas?userId=${userId}`);
            if (metasRes.ok) {
                const tasks = await metasRes.json();
                setMetasConcluidas(tasks.filter(t => t.status === 'C').length);
            }
        } catch (error) {
            console.error("Erro ao carregar dados do perfil:", error);
        }
    };

    useEffect(() => {
        loadProfileData();
    }, [userId]);

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Definição das Conquistas
    const conquistas = [
        { 
            id: 'iniciante', 
            icon: 'seedling', 
            name: 'Iniciante Focado', 
            desc: 'Concluiu a 1ª meta.', 
            unlocked: metasConcluidas >= 1 
        },
        { 
            id: 'fogo', 
            icon: 'fire', 
            name: 'Foco de Ferro', 
            desc: 'Atingiu 3 dias de streak.', 
            unlocked: profile?.streakDias >= 3 
        },
        { 
            id: 'tesouro', 
            icon: 'coins', 
            name: 'Caçador de Recompensas', 
            desc: 'Acumulou 100 moedas.', 
            unlocked: profile?.pontos >= 100 
        },
        { 
            id: 'mestre', 
            icon: 'crown', 
            name: 'Mestre do Tempo', 
            desc: 'Concluiu 10 metas.', 
            unlocked: metasConcluidas >= 10 
        }
    ];

    const badgesUnlockedCount = conquistas.filter(c => c.unlocked).length;

    if (!profile) {
        return <div className={styles.page}><p style={{color: 'white', textAlign: 'center'}}>Carregando perfil...</p></div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles['profile-page']}>

                <div className={styles['profile-header']}>
                    <div className={styles['profile-avatar-big']}>🧑‍🎓</div>
                    <div>
                        <div className={styles['profile-name']}>{profile.name}</div>
                        <div className={styles['profile-email']}>{profile.email || 'estudante@focusmind.com'}</div>
                    </div>

                    <div className={styles['profile-stats-container']}>
                        <div className={styles['profile-stats-row']}>
                            <div className={styles['profile-stat-item']}>
                                <div className={styles['profile-stat-val-1']}>{profile.streakDias}</div>
                                <div className={styles['profile-stat-label']}>dias seguidos</div>
                            </div>
                            <div className={styles['profile-stat-item']}>
                                <div className={styles['profile-stat-val-2']}>{profile.pontos}</div>
                                <div className={styles['profile-stat-label']}>moedas totais</div>
                            </div>
                            <div className={styles['profile-stat-item']}>
                                <div className={styles['profile-stat-val-3']}>{badgesUnlockedCount}</div>
                                <div className={styles['profile-stat-label']}>conquistas</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles['profile-grid']}>
                    
                    {/* Seção de Conquistas */}
                    <div className={styles['profile-section']} style={{ gridColumn: 'span 2' }}>
                        <h3>🏆 Minhas Conquistas (Badges)</h3>
                        <div className={styles['badges-container']}>
                            {conquistas.map((badge) => (
                                <div 
                                    key={badge.id} 
                                    className={`${styles.badgeCard} ${badge.unlocked ? styles.unlocked : styles.locked}`}
                                    title={badge.desc}
                                >
                                    <div className={styles.badgeIcon}>
                                        <Icon name={badge.icon} />
                                    </div>
                                    <div className={styles.badgeInfo}>
                                        <h4>{badge.name}</h4>
                                        <p>{badge.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles['profile-section']}>
                        <h3>⚙️ Preferências de estudo</h3>

                        {Object.keys(toggles).map((key) => (
                            <div key={key} className={styles['pref-toggle']}>
                                <span>{key}</span>
                                <div
                                    className={`${styles.toggle} ${toggles[key] ? styles.on : ''}`}
                                    onClick={() => handleToggle(key)}
                                ></div>
                            </div>
                        ))}
                    </div>

                    <div className={styles['profile-section']}>
                        <h3>📚 Minhas matérias</h3>
                        <div className={styles['subjects-container']}>
                            {profile.materiaEstudo ? (
                                <div className={styles.chip}>{profile.materiaEstudo}</div>
                            ) : (
                                <div className={styles.chip}>+ Adicionar Matéria</div>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    className={`${styles['btn-secondary']} ${styles['back-btn']}`}
                    onClick={() => navigate('/dashboard')}
                >
                    ← Voltar
                </button>
            </div>
        </div>
    );
}