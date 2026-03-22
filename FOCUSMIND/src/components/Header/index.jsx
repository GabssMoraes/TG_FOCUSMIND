import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const activePage = location.pathname;
    const { isAuthenticated, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        logout();
        navigate('/');
    };

    return (
        <nav className={styles.nav}>
            <a className={styles.logo} onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}>
                <div className={styles['logo-dot']}></div>
                FocusMind
            </a>

            <ul className={styles['nav-links']}>
                {isAuthenticated ? (
                    <>
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
                        <li className={styles['profile-menu']} ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={activePage === '/profile' ? styles.active : ''}
                            >
                                Minha Conta
                            </button>

                            {isDropdownOpen && (
                                <div className={styles.dropdown}>
                                    <button
                                        className={styles['dropdown-item']}
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            navigate('/profile');
                                        }}
                                    >
                                        Meu Perfil
                                    </button>
                                    <button
                                        className={`${styles['dropdown-item']} ${styles.danger}`}
                                        onClick={handleLogout}
                                    >
                                        Sair
                                    </button>
                                </div>
                            )}
                        </li>
                    </>
                ) : (
                    <>
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
                                onClick={() => navigate('/login')}
                                className={activePage === '/login' ? styles.active : ''}
                            >
                                Login
                            </button>
                            <button
                                className={styles['nav-cta']}
                                onClick={() => navigate('/register')}
                            >
                                Cadastro
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}