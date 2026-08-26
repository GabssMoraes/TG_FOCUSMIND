import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/Icon';
import ProgressChart from '../../components/ProgressChart';
import styles from './styles.module.css';
import { useTilt } from '../../hooks/useTilt';
import SkeletonPulse from '../../components/SkeletonPulse';

export default function Profile() {
    const navigate = useNavigate();
    const { userId } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [metasConcluidas, setMetasConcluidas] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [toggles, setToggles] = useState({
        lembretes: true,
        musica: true,
        noturno: true,
        relatorio: false,
        sugestoes: true
    });

    const tiltHeader = useTilt({ maxTilt: 1, scale: 1, glowOpacity: 0.05 });
    const tiltBadges = useTilt({ maxTilt: 1.5, scale: 1, glowOpacity: 0.03 });
    const tiltProgress = useTilt({ maxTilt: 1, scale: 1, glowOpacity: 0.03 });
    const tiltPrefs = useTilt({ maxTilt: 2, scale: 1, glowOpacity: 0.03 });
    const tiltSubjects = useTilt({ maxTilt: 2, scale: 1, glowOpacity: 0.03 });

    // Gera as iniciais do nome para o avatar
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const loadProfileData = async () => {
        if (!userId) return;
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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
            icon: 'check', 
            name: 'Iniciante Focado', 
            desc: 'Concluiu a 1ª meta.', 
            unlocked: metasConcluidas >= 1,
            color: '#4ecdc4'
        },
        { 
            id: 'fogo', 
            icon: 'fire', 
            name: 'Foco de Ferro', 
            desc: 'Atingiu 3 dias de streak.', 
            unlocked: profile?.streakDias >= 3,
            color: '#ff6b6b'
        },
        { 
            id: 'tesouro', 
            icon: 'coins', 
            name: 'Caçador de Recompensas', 
            desc: 'Acumulou 100 moedas.', 
            unlocked: profile?.pontos >= 100,
            color: '#f7c59f'
        },
        { 
            id: 'mestre', 
            icon: 'star', 
            name: 'Mestre do Tempo', 
            desc: 'Concluiu 10 metas.', 
            unlocked: metasConcluidas >= 10,
            color: '#ffd700'
        }
    ];

    if (isLoading || !profile) {
        return (
            <div className={`page-enter ${styles.page}`}>
                <SkeletonPulse.Group>
                    <SkeletonPulse height={140} radius={22} />
                    <SkeletonPulse height={250} radius={22} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <SkeletonPulse height={200} radius={22} />
                        <SkeletonPulse height={200} radius={22} />
                    </div>
                </SkeletonPulse.Group>
            </div>
        );
    }

    const badgesUnlockedCount = conquistas.filter(c => c.unlocked).length;

    return (
        <div className={`page-enter ${styles.page}`}>
            
            {/* Botão de voltar sutil */}
            <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
                <Icon name="chevron-left" /> Voltar ao Início
            </button>

            {/* Header / Avatar */}
            <div {...tiltHeader.props} className={styles.headerCard}>
                <div className={styles.headerGlow} aria-hidden />
                <div className={styles.headerLeft}>
                    <div className={styles.avatarWrap}>
                        <div className={styles.avatarInitials}>
                            {getInitials(profile.name)}
                        </div>
                        <div className={styles.avatarOnline} title="Online" />
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.userName}>{profile.name}</h1>
                        <span className={styles.userEmail}>{profile.email || 'estudante@focusmind.com'}</span>
                        <div className={styles.memberBadge}><Icon name="fa-solid fa-graduation-cap" /> Estudante FocusMind</div>
                    </div>
                </div>

                <div className={styles.statsContainer}>
                    <div className={styles.statItem}>
                        <div className={styles.statEmoji}><Icon name="fire" /></div>
                        <div className={styles.statValue} style={{ color: '#7c6cfa' }}>{profile.streakDias}</div>
                        <div className={styles.statLabel}>Dias Seguidos</div>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <div className={styles.statEmoji}><Icon name="coins" /></div>
                        <div className={styles.statValue} style={{ color: '#f7c59f' }}>{profile.pontos}</div>
                        <div className={styles.statLabel}>Moedas</div>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <div className={styles.statEmoji}><Icon name="trophy" /></div>
                        <div className={styles.statValue} style={{ color: '#4ecdc4' }}>{badgesUnlockedCount}</div>
                        <div className={styles.statLabel}>Conquistas</div>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Conquistas */}
                <div {...tiltBadges.props} className={styles.sectionCard} style={{ gridColumn: 'span 2' }}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}><Icon name="star" /></div>
                        <h2>Minhas Conquistas (Badges)</h2>
                    </div>
                    <div className={styles.badgesGrid}>
                        {conquistas.map((badge) => (
                            <div 
                                key={badge.id} 
                                className={`${styles.badgeItem} ${badge.unlocked ? styles.unlocked : styles.locked}`}
                            >
                                <div 
                                    className={styles.badgeIconWrap} 
                                    style={badge.unlocked ? { color: badge.color, boxShadow: `0 0 15px ${badge.color}40` } : {}}
                                >
                                    <Icon name={badge.icon} />
                                </div>
                                <div className={styles.badgeInfo}>
                                    <h4>{badge.name}</h4>
                                    <p>{badge.desc}</p>
                                </div>
                                {!badge.unlocked && <div className={styles.lockOverlay}><Icon name="lock" /></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progresso Semanal */}
                <div {...tiltProgress.props} className={styles.sectionCard} style={{ gridColumn: 'span 2' }}>
                    <ProgressChart userId={userId} />
                </div>

                {/* Preferências */}
                <div {...tiltPrefs.props} className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}><Icon name="settings" /></div>
                        <h2>Preferências</h2>
                    </div>
                    <div className={styles.togglesList}>
                        {Object.keys(toggles).map((key) => (
                            <div key={key} className={styles.toggleRow} onClick={() => handleToggle(key)}>
                                <span className={styles.toggleLabel}>{key}</span>
                                <div className={`${styles.toggleTrack} ${toggles[key] ? styles.toggleOn : ''}`}>
                                    <div className={styles.toggleThumb} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Matérias */}
                <div {...tiltSubjects.props} className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}><Icon name="book" /></div>
                        <h2>Matéria Principal</h2>
                    </div>
                    <div className={styles.subjectsContainer}>
                        {profile.materiaEstudo ? (
                            <div className={styles.subjectChip}>
                                <div className={styles.subjectDot} />
                                {profile.materiaEstudo}
                            </div>
                        ) : (
                            <div className={styles.subjectEmpty}>
                                <Icon name="plus" /> Adicionar Matéria
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
}