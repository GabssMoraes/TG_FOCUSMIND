import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './styles.module.css';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const activePage = location.pathname;

    return (
        <nav className={styles.nav}>
            <a className={styles.logo} onClick={() => navigate('/')}>
                <div className={styles['logo-dot']}></div>
                FocusMind
            </a>

            <ul className={styles['nav-links']}>
                <li>
                    <button
                        onClick={() => navigate('/')}
                        className={activePage === '/' ? styles.active : ''}
                    >
                        Início
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={activePage === '/dashboard' ? styles.active : ''}
                    >
                        Dashboard
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => navigate('/timer')}
                        className={activePage === '/timer' ? styles.active : ''}
                    >
                        Temporizador
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => navigate('/chat')}
                        className={activePage === '/chat' ? styles.active : ''}
                    >
                        IA Assistente
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => navigate('/profile')}
                        className={activePage === '/profile' ? styles.active : ''}
                    >
                        Perfil
                    </button>
                </li>
                <li>
                    <button
                        className={styles['nav-cta']}
                        onClick={() => navigate('/dashboard')}
                    >
                        Entrar
                    </button>
                </li>
            </ul>
        </nav>
    );
}