import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import styles from './styles.module.css';
import { playPurchaseSound, playErrorSound } from '../../utils/audioUtils';

// ── Partículas de confete CSS ───────────────────────────────────────────────
function ConfettiExplosion({ active }) {
    if (!active) return null;
    const pieces = Array.from({ length: 30 });
    const colors = ['#7c6cfa', '#4ecdc4', '#f7c59f', '#ff6b6b', '#ffd700', '#fff'];
    return (
        <div className={styles.confettiContainer} aria-hidden="true">
            {pieces.map((_, i) => (
                <div
                    key={i}
                    className={styles.confettiPiece}
                    style={{
                        left: `${Math.random() * 100}%`,
                        background: colors[Math.floor(Math.random() * colors.length)],
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${0.8 + Math.random() * 0.7}s`,
                        width: `${6 + Math.random() * 8}px`,
                        height: `${6 + Math.random() * 8}px`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    }}
                />
            ))}
        </div>
    );
}

// ── Dados dos itens da loja ─────────────────────────────────────────────────
const SHOP_ITEMS = [
    {
        id: 'focus_mode',
        icon: 'headphones',
        iconColor: '#4ecdc4',
        glowColor: 'rgba(78,205,196,0.2)',
        badgeColor: '#4ecdc4',
        badge: 'Foco & Imersão',
        title: 'Modo Foco Avançado',
        desc: 'Desbloqueie canais de áudio ambiente integrados no Temporizador: Música Lo-Fi, Sons de Chuva e Cafeteria para isolar distrações e entrar em flow.',
        benefit: 'Áudio Ambiente + Interface Minimalista',
        price: 50,
        priceLabel: '50 moedas',
        localKey: 'unlockedFocusMode',
        oneTime: true,
        navigateTo: '/timer',
        navigateLabel: 'Ir para o Temporizador →',
    },
    {
        id: 'extra_challenges',
        icon: 'star',
        iconColor: '#ffd700',
        glowColor: 'rgba(255,215,0,0.15)',
        badgeColor: '#ffd700',
        badge: 'Desafio Extra',
        title: 'Pacote de Desafios Bônus',
        desc: 'Desbloqueie 3 desafios semanais extras além dos padrões. Mais desafios significam mais oportunidades de ganhar moedas e manter o ritmo.',
        benefit: '+3 Desafios Semanais Adicionais',
        price: 75,
        priceLabel: '75 moedas',
        localKey: 'extraChallenges',
        oneTime: true,
        navigateTo: '/dashboard',
        navigateLabel: 'Ver Desafios →',
    },
    {
        id: 'pomodoro_long',
        icon: 'timer',
        iconColor: '#ff6b6b',
        glowColor: 'rgba(255,107,107,0.15)',
        badgeColor: '#ff6b6b',
        badge: 'Produtividade',
        title: 'Sessões Estendidas',
        desc: 'Desbloqueie modos de sessão de 45min e 60min no Temporizador para períodos de estudo mais longos e profundos.',
        benefit: 'Sessões de 45min e 60min desbloqueadas',
        price: 60,
        priceLabel: '60 moedas',
        localKey: 'extendedSessions',
        oneTime: true,
        navigateTo: '/timer',
        navigateLabel: 'Ir para o Temporizador →',
    },
    {
        id: 'weekly_report',
        icon: 'chart',
        iconColor: '#4ecdc4',
        glowColor: 'rgba(78,205,196,0.15)',
        badgeColor: '#4ecdc4',
        badge: 'Insights',
        title: 'Relatório Semanal da IA',
        desc: 'A cada domingo, o FocusBot gera automaticamente um relatório com análise dos seus padrões de estudo, pontos fortes e sugestões de melhoria.',
        benefit: 'Análise semanal automática por IA',
        price: 120,
        priceLabel: '120 moedas',
        localKey: 'weeklyReport',
        oneTime: true,
        navigateTo: '/chat',
        navigateLabel: 'Abrir FocusBot →',
    },
    {
        id: 'ia_credits',
        icon: 'bot',
        iconColor: '#7c6cfa',
        glowColor: 'rgba(124,108,250,0.2)',
        badgeColor: '#7c6cfa',
        badge: 'Apoio Cognitivo',
        title: 'Consulta VIP com a IA',
        desc: 'Ganhe 5 créditos para solicitar análises detalhadas ao FocusBot sobre seu progresso, hábitos e plano de estudos personalizado.',
        benefit: '+5 Análises Avançadas de Rotina',
        price: 100,
        priceLabel: '100 moedas',
        localKey: 'premiumCredits',
        oneTime: false,
        isCredits: true,
        creditAmount: 5,
        navigateTo: '/chat',
        navigateLabel: 'Abrir FocusBot →',
    },
    {
        id: 'streak_shield',
        icon: 'fire',
        iconColor: '#f7c59f',
        glowColor: 'rgba(247,197,159,0.15)',
        badgeColor: '#f7c59f',
        badge: 'Proteção',
        title: 'Escudo de Streak',
        desc: 'Protege sua sequência de dias ativos por 1 dia. Se você esquecer de estudar, o escudo é consumido e sua streak continua intacta.',
        benefit: '1 dia de proteção contra perda de streak',
        price: 40,
        priceLabel: '40 moedas',
        localKey: 'streakShields',
        oneTime: false,
        isCredits: true,
        creditAmount: 1,
    },
];

// ── Componente Principal ────────────────────────────────────────────────────
export default function LojaRecompensas() {
    const { userId } = useAuth();
    const navigate = useNavigate();

    const [pontos, setPontos] = useState(0);
    const [ownedItems, setOwnedItems] = useState({});
    const [creditItems, setCreditItems] = useState({});
    const [loadingId, setLoadingId] = useState(null);
    const [confettiItem, setConfettiItem] = useState(null);

    // Carrega perfil e estados locais
    const loadProfile = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`);
            if (res.ok) {
                const data = await res.json();
                setPontos(data.pontos);
            }

            // Carrega estados de compra do localStorage
            const owned = {};
            const credits = {};
            SHOP_ITEMS.forEach(item => {
                if (item.oneTime) {
                    owned[item.localKey] = localStorage.getItem(`@FocusMind:${item.localKey}:${userId}`) === 'true';
                }
                if (item.isCredits) {
                    credits[item.localKey] = parseInt(localStorage.getItem(`@FocusMind:${item.localKey}:${userId}`) || '0', 10);
                }
            });
            setOwnedItems(owned);
            setCreditItems(credits);
        } catch {
            console.error("Erro ao carregar loja.");
        }
    }, [userId]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const triggerConfetti = (itemId) => {
        setConfettiItem(itemId);
        setTimeout(() => setConfettiItem(null), 1500);
    };

    const handleBuy = async (item) => {
        if (item.oneTime && ownedItems[item.localKey]) return;

        if (pontos < item.price) {
            playErrorSound();
            toast.error(`Você precisa de ${item.price} moedas! Faltam ${item.price - pontos}.`, {
                icon: <Icon name="coins" style={{ color: '#f7c59f' }} />,
                style: { background: '#1e2330', color: '#fff', border: '1px solid rgba(255,107,107,0.4)' }
            });
            return;
        }

        setLoadingId(item.id);
        try {
            const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/gastar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preco: item.price, item: item.title }),
            });

            if (res.ok) {
                const data = await res.json();
                setPontos(data.pontos);

                if (item.oneTime) {
                    localStorage.setItem(`@FocusMind:${item.localKey}:${userId}`, 'true');
                    setOwnedItems(prev => ({ ...prev, [item.localKey]: true }));
                }

                if (item.isCredits) {
                    const current = creditItems[item.localKey] || 0;
                    const next = current + item.creditAmount;
                    localStorage.setItem(`@FocusMind:${item.localKey}:${userId}`, next.toString());
                    setCreditItems(prev => ({ ...prev, [item.localKey]: next }));
                }

                playPurchaseSound();
                triggerConfetti(item.id);
                toast.success(
                    <span>{item.title} {item.oneTime ? 'desbloqueado' : 'adquirido'}! <Icon name={item.icon} style={{ marginLeft: '4px' }} /></span>,
                    { duration: 4000, style: { background: '#1e2330', color: '#fff', border: '1px solid rgba(78,205,196,0.4)' } }
                );
            } else {
                playErrorSound();
                toast.error("Erro ao realizar compra. Tente novamente.");
            }
        } catch {
            playErrorSound();
            toast.error("Sem conexão com o servidor.");
        } finally {
            setLoadingId(null);
        }
    };

    const isOwned = (item) => item.oneTime && ownedItems[item.localKey];
    const canAfford = (item) => pontos >= item.price;
    const getCredits = (item) => item.isCredits ? (creditItems[item.localKey] || 0) : 0;

    const oneTimeItems = SHOP_ITEMS.filter(i => i.oneTime);
    const consumableItems = SHOP_ITEMS.filter(i => !i.oneTime);

    return (
        <div className={styles.page}>

            {/* ── Hero Header ── */}
            <div className={styles.hero}>
                <div className={styles.heroGlow} aria-hidden />
                <div>
                    <div className={styles.heroBadge}><Icon name="shop" /> Loja de Recompensas</div>
                    <h1 className={styles.heroTitle}>Transforme foco em recursos reais</h1>
                    <p className={styles.heroSub}>
                        Cada moeda que você acumula representa tempo de estudo real. Invista em ferramentas que tornam o próximo estudo ainda mais eficiente.
                    </p>
                </div>
                <div className={styles.balanceCard}>
                    <div className={styles.balanceLabel}>Seu Saldo</div>
                    <div className={styles.balanceValue}>
                        <span className={styles.coinIcon}><Icon name="coins" /></span>
                        <span className={styles.balanceNum}>{pontos}</span>
                        <span className={styles.balanceText}>moedas</span>
                    </div>
                    <div className={styles.balanceTip}>
                        Ganhe mais completando metas e sessões Pomodoro
                    </div>
                </div>
            </div>

            {/* ── Seção: Desbloqueáveis ── */}
            <div className={styles.sectionLabel}>
                <Icon name="lock" style={{ color: '#7c6cfa' }} />
                <span>Desbloqueáveis</span>
                <span className={styles.sectionHint}>Compre uma vez, use para sempre</span>
            </div>
            <div className={styles.grid}>
                {oneTimeItems.map((item) => {
                    const owned = isOwned(item);
                    const affordable = canAfford(item);
                    const loading = loadingId === item.id;

                    return (
                        <div
                            key={item.id}
                            className={`${styles.card} ${owned ? styles.cardOwned : ''} ${!affordable && !owned ? styles.cardLocked : ''}`}
                            style={{ '--glow': item.glowColor }}
                        >
                            <ConfettiExplosion active={confettiItem === item.id} />

                            <div className={styles.cardIconWrap} style={{ background: item.glowColor, color: item.iconColor }}>
                                <Icon name={item.icon} />
                            </div>

                            <div className={styles.badge} style={{ color: item.badgeColor, borderColor: item.badgeColor + '55', background: item.glowColor }}>
                                {item.badge}
                            </div>

                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDesc}>{item.desc}</p>

                            <div className={styles.benefitRow}>
                                <Icon name="check" style={{ color: item.iconColor, flexShrink: 0 }} />
                                <span>{item.benefit}</span>
                            </div>

                            <div className={styles.divider} />

                            <div className={styles.cardFooter}>
                                <div className={styles.priceTag}>
                                    <span><Icon name="coins" /></span>
                                    <span className={styles.priceNum}>{item.priceLabel}</span>
                                </div>
                                <button
                                    className={`${styles.buyBtn} ${owned ? styles.buyBtnOwned : ''} ${!affordable && !owned ? styles.buyBtnLocked : ''}`}
                                    onClick={() => handleBuy(item)}
                                    disabled={owned || loading}
                                >
                                    {loading ? (
                                        <span className={styles.spinner} />
                                    ) : owned ? (
                                        <><Icon name="check" /> Desbloqueado</>
                                    ) : affordable ? (
                                        'Comprar agora →'
                                    ) : (
                                        <>Faltam {item.price - pontos} <Icon name="coins" style={{ marginLeft: '4px' }} /></>
                                    )}
                                </button>
                            </div>

                            {owned && item.navigateTo && (
                                <button className={styles.goBtn} onClick={() => navigate(item.navigateTo)}>
                                    {item.navigateLabel}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Seção: Consumíveis ── */}
            <div className={styles.sectionLabel}>
                <Icon name="redo" style={{ color: '#f7c59f' }} />
                <span>Consumíveis</span>
                <span className={styles.sectionHint}>Compre quantas vezes quiser</span>
            </div>
            <div className={styles.grid}>
                {consumableItems.map((item) => {
                    const affordable = canAfford(item);
                    const loading = loadingId === item.id;
                    const credits = getCredits(item);

                    return (
                        <div
                            key={item.id}
                            className={`${styles.card} ${!affordable ? styles.cardLocked : ''}`}
                            style={{ '--glow': item.glowColor }}
                        >
                            <ConfettiExplosion active={confettiItem === item.id} />

                            <div className={styles.cardIconWrap} style={{ background: item.glowColor, color: item.iconColor }}>
                                <Icon name={item.icon} />
                            </div>

                            <div className={styles.badge} style={{ color: item.badgeColor, borderColor: item.badgeColor + '55', background: item.glowColor }}>
                                {item.badge}
                            </div>

                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDesc}>{item.desc}</p>

                            <div className={styles.benefitRow}>
                                <Icon name="check" style={{ color: item.iconColor, flexShrink: 0 }} />
                                <span>{item.benefit}</span>
                                {credits > 0 && (
                                    <span className={styles.creditsBadge}>{credits} {credits === 1 ? 'unidade' : 'unidades'}</span>
                                )}
                            </div>

                            <div className={styles.divider} />

                            <div className={styles.cardFooter}>
                                <div className={styles.priceTag}>
                                    <span><Icon name="coins" /></span>
                                    <span className={styles.priceNum}>{item.priceLabel}</span>
                                </div>
                                <button
                                    className={`${styles.buyBtn} ${!affordable ? styles.buyBtnLocked : ''}`}
                                    onClick={() => handleBuy(item)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className={styles.spinner} />
                                    ) : affordable ? (
                                        'Comprar agora →'
                                    ) : (
                                        <>Faltam {item.price - pontos} <Icon name="coins" style={{ marginLeft: '4px' }} /></>
                                    )}
                                </button>
                            </div>

                            {credits > 0 && item.navigateTo && (
                                <button className={styles.goBtn} onClick={() => navigate(item.navigateTo)}>
                                    {item.navigateLabel}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Dica de como ganhar moedas ── */}
            <div className={styles.tipBox}>
                <div className={styles.tipTitle}><Icon name="info" /> Como ganhar moedas</div>
                <div className={styles.tipGrid}>
                    <div className={styles.tipItem}><span><Icon name="timer" /></span><span>Concluir sessão Pomodoro</span><strong>+3</strong></div>
                    <div className={styles.tipItem}><span><Icon name="target" /></span><span>Concluir uma meta</span><strong>+5</strong></div>
                    <div className={styles.tipItem}><span><Icon name="calendar" /></span><span>Revisão Semanal completa</span><strong>+10</strong></div>
                    <div className={styles.tipItem}><span><Icon name="fire" /></span><span>Manter streak diária</span><strong>+2/dia</strong></div>
                </div>
            </div>

        </div>
    );
}
