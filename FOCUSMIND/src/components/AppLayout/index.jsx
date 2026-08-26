import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../Icon';
import StreakModal from '../StreakModal';
import QuickNotes from '../QuickNotes';
import styles from './styles.module.css';

const PAGE_TITLES = {
    '/dashboard': 'Início',
    '/timer': 'Temporizador de Foco',
    '/timeblocking': 'Bloqueio de Tempo',
    '/revisao': 'Revisão Semanal',
    '/chat': 'FocusBot — IA',
    '/loja': 'Loja de Recompensas',
    '/profile': 'Meu Perfil',
    '/quiz': 'Quiz Diário',
    '/jornada': 'Jornada',
};

const NAV = [
    { to: '/dashboard', icon: 'dashboard', label: 'Início', tooltip: 'Painel geral com resumo de rotina' },
    { to: '/timer', icon: 'timer', label: 'Temporizador', tooltip: 'Temporizador Pomodoro para foco' },
    { to: '/timeblocking', icon: 'calendar', label: 'Grade Horária', tooltip: 'Planejamento semanal de tempo' },
    { to: '/revisao', icon: 'review', label: 'Revisão Semanal', tooltip: 'Autoavaliação e reflexão semanal' },
    { to: '/quiz', icon: 'brain', label: 'Quiz Diário', tooltip: 'Teste seus conhecimentos gerados por IA' },
    { to: '/jornada', icon: 'star', label: 'Jornada', tooltip: 'Acompanhe seu Modo História e mapa visual' },
    { to: '/chat', icon: 'bot', label: 'FocusBot', tooltip: 'Conversa com inteligência artificial' },
    { to: '/loja', icon: 'shop', label: 'Loja', tooltip: 'Resgatar recompensas com moedas' },
    { to: '/profile', icon: 'user', label: 'Meu Perfil', tooltip: 'Configurações e estatísticas da sua conta' },
];

export default function AppLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState({ pontos: 0, streakDias: 0 });
    const [showStreakModal, setShowStreakModal] = useState(false);

    const pageTitle = PAGE_TITLES[location.pathname] || 'FocusMind';

    useEffect(() => {
        if (!userId) return;
        fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setProfile({ pontos: data.pontos, streakDias: data.streakDias });

                    // Lógica para abrir o modal automaticamente
                    const todayStr = new Date().toLocaleDateString();
                    const lastDate = localStorage.getItem('lastStreakPopupDate');
                    const lastStreakCount = parseInt(localStorage.getItem('lastStreakCount') || '0', 10);

                    // Abre se for um novo dia e a streak > 0
                    if (data.streakDias > 0 && lastDate !== todayStr) {
                        setShowStreakModal(true);
                        localStorage.setItem('lastStreakPopupDate', todayStr);
                    }
                    // Abre se o usuário tinha uma streak e perdeu ela (caiu pra 0)
                    else if (data.streakDias === 0 && lastStreakCount > 0) {
                        setShowStreakModal(true);
                        localStorage.setItem('lastStreakPopupDate', todayStr);
                    }

                    // Salva a streak atual para checar no futuro se o usuário a perdeu
                    localStorage.setItem('lastStreakCount', data.streakDias.toString());
                }
            })
            .catch(console.error);
    }, [userId, location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className={styles.workspace}>

            {/* Mobile overlay */}
            <div
                className={`${styles.overlay} ${sidebarOpen ? styles.open : ''}`}
                onClick={closeSidebar}
            />

            {/* ===== SIDEBAR ===== */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
                {/* Logo */}
                <div className={styles.sidebarLogo}>
                    <div className={styles.sidebarLogoIcon}><Icon name="target" /></div>
                    <span className={styles.sidebarLogoText}>
                        Focus<span>Mind</span>
                    </span>
                </div>

                {/* Nav items */}
                <nav className={styles.nav}>
                    <div className={styles.navSection}>Navegação</div>
                    {NAV.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                            onClick={closeSidebar}
                            data-tooltip={item.tooltip}
                        >
                            <span className={styles.navIcon}><Icon name={item.icon} /></span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer com stats + logout */}
                <div className={styles.sidebarFooter}>
                    <div className={styles.statsChip} style={{ cursor: 'pointer' }} onClick={() => setShowStreakModal(true)}>
                        <span><Icon name="fire" style={{ color: '#ff6b6b', marginRight: '6px' }} /> Sequência</span>
                        <span className={styles.statsChipMuted}>{profile.streakDias} dias</span>
                    </div>
                    <div className={styles.statsChip}>
                        <span><Icon name="coins" style={{ color: '#f7c59f', marginRight: '6px' }} /> Moedas</span>
                        <span className={styles.statsChipMuted}>{profile.pontos} pts</span>
                    </div>
                    <button className={styles.btnLogout} onClick={handleLogout}>
                        <Icon name="logout" style={{ marginRight: '6px' }} /> Sair da conta
                    </button>
                </div>
            </aside>

            {/* ===== MAIN AREA ===== */}
            <div className={styles.main}>
                {/* Top bar */}
                <div className={styles.topbar}>
                    <button
                        className={styles.hamburger}
                        onClick={() => setSidebarOpen(v => !v)}
                        aria-label="Abrir menu"
                    >
                        <Icon name="fa-solid fa-bars" />
                    </button>
                    <span className={styles.topbarTitle}>{pageTitle}</span>

                </div>

                {/* Page content */}
                <div className={styles.content}>
                    {children}
                </div>
            </div>

            {/* Modal de Streak */}
            {showStreakModal && (
                <StreakModal streak={profile.streakDias} onClose={() => setShowStreakModal(false)} />
            )}

            {/* Notas Rápidas — disponível em todas as páginas via Ctrl+N */}
            <QuickNotes />
        </div>
    );
}
