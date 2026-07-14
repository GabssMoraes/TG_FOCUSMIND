import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../Icon';
import styles from './styles.module.css';

const PAGE_TITLES = {
    '/dashboard':    'Início',
    '/timer':        'Temporizador de Foco',
    '/timeblocking': 'Bloqueio de Tempo',
    '/revisao':      'Revisão Semanal',
    '/chat':         'FocusBot — IA',
    '/loja':         'Loja de Recompensas',
    '/profile':      'Meu Perfil',
};

const NAV = [
    { to: '/dashboard',    icon: 'dashboard', label: 'Início', tooltip: 'Painel geral com resumo de rotina' },
    { to: '/timer',        icon: 'timer', label: 'Temporizador', tooltip: 'Temporizador Pomodoro para foco' },
    { to: '/timeblocking', icon: 'calendar', label: 'Grade Horária', tooltip: 'Planejamento semanal de tempo' },
    { to: '/revisao',      icon: 'review', label: 'Revisão Semanal', tooltip: 'Autoavaliação e reflexão semanal' },
    { to: '/chat',         icon: 'bot', label: 'FocusBot', tooltip: 'Conversa com inteligência artificial' },
    { to: '/loja',         icon: 'shop', label: 'Loja', tooltip: 'Resgatar recompensas com moedas' },
];

export default function AppLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState({ pontos: 0, streakDias: 0 });

    const pageTitle = PAGE_TITLES[location.pathname] || 'FocusMind';

    useEffect(() => {
        if (!userId) return;
        fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setProfile({ pontos: data.pontos, streakDias: data.streakDias });
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
                    <div className={styles.statsChip}>
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

                    <div className={styles.topbarStats}>
                        <span className={`${styles.badge} ${styles.badgeStreak}`}>
                            <Icon name="fire" style={{ color: '#ff6b6b', marginRight: '4px' }} /> {profile.streakDias}d
                        </span>
                        <span className={`${styles.badge} ${styles.badgeCoins}`}>
                            <Icon name="coins" style={{ color: '#f7c59f', marginRight: '4px' }} /> {profile.pontos}
                        </span>
                    </div>
                </div>

                {/* Page content */}
                <div className={styles.content}>
                    {children}
                </div>
            </div>

        </div>
    );
}
