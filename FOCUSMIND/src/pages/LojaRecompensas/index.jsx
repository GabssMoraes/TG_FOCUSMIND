import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import styles from './styles.module.css';

export default function LojaRecompensas() {
    const { userId } = useAuth();

    const [pontos, setPontos] = useState(0);
    const [isFocusModeUnlocked, setIsFocusModeUnlocked] = useState(false);
    const [premiumCredits, setPremiumCredits] = useState(0);

    const loadProfile = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`);
            if (res.ok) {
                const data = await res.json();
                setPontos(data.pontos);
            }

            // Checar travas locais
            const focusUnlocked = localStorage.getItem(`@FocusMind:unlockedFocusMode:${userId}`) === 'true';
            setIsFocusModeUnlocked(focusUnlocked);

            const credits = parseInt(localStorage.getItem(`@FocusMind:premiumCredits:${userId}`) || '0', 10);
            setPremiumCredits(credits);
        } catch (error) {
            console.error("Erro ao carregar dados da Loja:", error);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const handleBuyFocusMode = async () => {
        if (pontos < 50) {
            toast.error("Saldo de moedas insuficiente!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/usuarios/${userId}/gastar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preco: 50,
                    item: "Modo Foco Avançado"
                })
            });

            if (response.ok) {
                const data = await response.json();
                setPontos(data.pontos);
                localStorage.setItem(`@FocusMind:unlockedFocusMode:${userId}`, 'true');
                setIsFocusModeUnlocked(true);
                toast.success("Desbloqueado com sucesso! Vá ao temporizador para curtir lofi/chuva! 🎧🌧️");
            } else {
                toast.error("Erro ao realizar compra.");
            }
        } catch (error) {
            toast.error("Erro ao comunicar com o servidor.");
        }
    };

    const handleBuyPremiumChat = async () => {
        if (pontos < 30) {
            toast.error("Saldo de moedas insuficiente!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/usuarios/${userId}/gastar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preco: 30,
                    item: "Análise Avançada da IA"
                })
            });

            if (response.ok) {
                const data = await response.json();
                setPontos(data.pontos);
                const nextCredits = premiumCredits + 5;
                localStorage.setItem(`@FocusMind:premiumCredits:${userId}`, nextCredits.toString());
                setPremiumCredits(nextCredits);
                toast.success("Créditos adquiridos! +5 perguntas detalhadas de rotina liberadas! 🤖");
            } else {
                toast.error("Erro ao realizar compra.");
            }
        } catch (error) {
            toast.error("Erro ao comunicar com o servidor.");
        }
    };

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}><Icon name="coins" style={{ marginRight: '8px', color: '#f7c59f' }} /> Loja de Recompensas</h2>
                    <p className={styles.desc}>
                        Gaste as moedas acumuladas ao manter o foco para desbloquear novos recursos estéticos e cognitivos.
                    </p>
                </div>

                <div className={styles.balanceBox}>
                    <span>Seu Saldo:</span>
                    <span><Icon name="coins" style={{ marginRight: '6px', color: '#f7c59f' }} /> {pontos} moedas</span>
                </div>
            </div>

            <div className={styles.grid}>

                {/* Modo Foco */}
                <div className={styles.rewardCard}>
                    <div>
                        <div className={styles.rewardBadge}>Estética & Foco</div>
                        <h3 className={styles.rewardTitle}><Icon name="headphones" style={{ marginRight: '8px' }} /> Modo Foco Avançado</h3>
                        <p className={styles.rewardDesc}>
                            Desbloqueie no seu Temporizador de Foco a possibilidade de reproduzir canais integrados de áudio (Música Lo-Fi, Sons de Chuva ou Cafeteria) para isolar distrações.
                        </p>
                    </div>
                    <div className={styles.rewardFooter}>
                        <span className={styles.rewardPrice}><Icon name="coins" style={{ marginRight: '6px', color: '#f7c59f' }} /> 50 moedas</span>
                        <button
                            className={styles.btnBuy}
                            onClick={handleBuyFocusMode}
                            disabled={isFocusModeUnlocked || pontos < 50}
                        >
                            {isFocusModeUnlocked ? <span>Desbloqueado <Icon name="check" /></span> : 'Desbloquear'}
                        </button>
                    </div>
                </div>

                {/* Análise de IA */}
                <div className={styles.rewardCard}>
                    <div>
                        <div className={styles.rewardBadge}>Apoio Cognitivo</div>
                        <h3 className={styles.rewardTitle}><Icon name="bot" style={{ marginRight: '8px' }} /> Pacote de Análise IA</h3>
                        <p className={styles.rewardDesc}>
                            Ganhe 5 créditos extras para solicitar análises ultra-detalhadas sobre seu progresso, hábitos e rotina diretamente no chat com o FocusBot.
                        </p>
                    </div>
                    <div className={styles.rewardFooter}>
                        <span className={styles.rewardPrice}>
                            <span><Icon name="coins" style={{ marginRight: '6px', color: '#f7c59f' }} /> 30 moedas</span>
                            <span style={{ fontSize: '0.75rem', color: '#7a8099', fontWeight: 'normal', marginLeft: '6px' }}>
                                (Saldo atual: {premiumCredits})
                            </span>
                        </span>
                        <button
                            className={styles.btnBuy}
                            onClick={handleBuyPremiumChat}
                            disabled={pontos < 30}
                        >
                            Adquirir +5
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
