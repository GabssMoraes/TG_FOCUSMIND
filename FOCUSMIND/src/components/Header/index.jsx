import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

/**
 * Header simples — aparece apenas nas páginas públicas (Home, Login, Cadastro).
 * Nas páginas privadas, a navegação fica inteiramente no AppLayout (sidebar).
 */
export default function PublicHeader() {
    const navigate = useNavigate();

    return (
        <nav className={styles.nav}>
            <a className={styles.logo} onClick={() => navigate('/')}>
                <div className={styles.logoDot} />
                FocusMind
            </a>

            <div className={styles.navActions}>
                <button className={styles.btnGhost} onClick={() => navigate('/login')}>
                    Entrar
                </button>
                <button className={styles.btnCta} onClick={() => navigate('/register')}>
                    Criar conta
                </button>
            </div>
        </nav>
    );
}