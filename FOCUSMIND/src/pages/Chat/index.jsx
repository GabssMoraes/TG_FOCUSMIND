import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/Icon';
import { toast } from 'react-hot-toast';
import { formatMessage } from '../../utils/formatters';
import styles from './styles.module.css';

const DEFAULT_GREETING = { sender: 'ai', text: 'Oi! Como posso te ajudar hoje?' };

export default function Chat() {
    const { userId } = useAuth();

    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([DEFAULT_GREETING]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Novas states para sessões
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // para mobile

    const chatBottomRef = useRef(null);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Carregar todas as sessões do usuário
    const loadSessions = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/chat/sessoes?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
                // Opcional: auto-selecionar a sessão mais recente se não houver nenhuma ativa
                // if (data.length > 0 && !activeSessionId) {
                //    loadHistory(data[0].id);
                // }
            }
        } catch (err) {
            console.error("Erro ao carregar sessões:", err);
        }
    }, [userId]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // Carregar histórico de uma sessão específica
    const loadHistory = async (sessionId) => {
        setActiveSessionId(sessionId);
        setIsSidebarOpen(false); // fecha a sidebar no mobile
        setMessages([DEFAULT_GREETING]); // limpa enquanto carrega
        
        try {
            const res = await fetch(`http://localhost:8080/api/chat/historico?sessionId=${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    const formatted = data.map(msg => ({
                        sender: msg.sender,
                        text: formatMessage(msg.texto)
                    }));
                    setMessages(formatted);
                }
            }
        } catch (err) {
            console.error("Erro ao carregar histórico do chat:", err);
            toast.error("Erro ao carregar conversa.");
        }
    };

    const handleNewChat = () => {
        setActiveSessionId(null);
        setMessages([DEFAULT_GREETING]);
        setIsSidebarOpen(false);
    };

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation(); // Evita selecionar a sessão ao clicar na lixeira
        if (!window.confirm("Tem certeza que deseja apagar esta conversa?")) return;
        
        try {
            const res = await fetch(`http://localhost:8080/api/chat/sessoes/${sessionId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Conversa apagada.");
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                if (activeSessionId === sessionId) {
                    handleNewChat();
                }
            }
        } catch (err) {
            toast.error("Erro ao deletar conversa.");
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isLoading) return;

        const userMessage = chatInput;
        setMessages((prev) => [
            ...prev,
            { sender: 'user', text: formatMessage(userMessage) }
        ]);
        setChatInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/chat/perguntar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    mensagem: userMessage, 
                    userId,
                    sessionId: activeSessionId 
                })
            });

            if (!response.ok) throw new Error('Falha na comunicação.');

            const data = await response.json();

            // Se for uma nova sessão, atualiza o sessionId e recarrega a lista
            if (!activeSessionId && data.sessionId) {
                setActiveSessionId(data.sessionId);
                loadSessions();
            }

            setMessages((prev) => [
                ...prev,
                { sender: 'ai', text: formatMessage(data.resposta) }
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { sender: 'ai', text: '<span style="color: #ff6b6b; font-weight: 500;">⚠️ Ops! Não consegui me conectar ao assistente.</span>' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles['chat-layout']}>

                {/* ── Sidebar (Sessões) ── */}
                <div className={`${styles['chat-sidebar']} ${isSidebarOpen ? styles.open : ''}`}>
                    <div className={styles['sidebar-header']}>
                        <button className={styles['btn-new-chat']} onClick={handleNewChat}>
                            <Icon name="plus" /> Nova Conversa
                        </button>
                    </div>
                    
                    <div className={styles['sessions-list']}>
                        {sessions.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#7a8099', fontSize: '0.85rem', marginTop: '20px' }}>
                                Nenhuma conversa salva.
                            </div>
                        )}
                        {sessions.map(session => {
                            const data = new Date(session.dataCriacao);
                            return (
                                <div 
                                    key={session.id} 
                                    className={`${styles['session-item']} ${activeSessionId === session.id ? styles.active : ''}`}
                                    onClick={() => loadHistory(session.id)}
                                >
                                    <Icon name="message" style={{ fontSize: '0.9rem', color: activeSessionId === session.id ? '#c0b8f7' : 'inherit' }} />
                                    <div className={styles['session-info']}>
                                        <div className={styles['session-title']} title={session.titulo}>
                                            {session.titulo || "Nova Conversa"}
                                        </div>
                                        <div className={styles['session-date']}>
                                            {data.toLocaleDateString('pt-BR')} {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <button 
                                        className={styles['btn-delete-session']} 
                                        onClick={(e) => handleDeleteSession(e, session.id)}
                                        title="Apagar conversa"
                                    >
                                        <Icon name="delete" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Chat Principal ── */}
                <div className={styles['chat-main']}>
                    <div className={styles['chat-header']}>
                        <div className={styles['ai-avatar']}><Icon name="bot" /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'Syne', fontWeight: 700 }}>
                                FocusBot
                            </div>
                            <div style={{ fontSize: '.78rem', color: 'var(--accent)' }}>
                                ● Online — seu assistente de foco
                            </div>
                        </div>
                    </div>

                    <div className={styles['chat-messages']}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`${styles.msg} ${msg.sender === 'user' ? styles.user : ''}`}
                            >
                                <div className={`${styles['msg-avatar']} ${msg.sender === 'ai' ? styles['msg-ai-avatar'] : styles['msg-user-avatar']}`}>
                                    {msg.sender === 'ai' ? <Icon name="bot" /> : <Icon name="user" />}
                                </div>
                                <div
                                    className={styles['msg-bubble']}
                                    dangerouslySetInnerHTML={{ __html: msg.text }}
                                />
                            </div>
                        ))}
                        {isLoading && (
                            <div className={styles.msg}>
                                <div className={`${styles['msg-avatar']} ${styles['msg-ai-avatar']}`}>
                                    <Icon name="bot" />
                                </div>
                                <div className={styles['msg-bubble']}>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--muted)', animation: 'pulse 1.5s infinite' }}>FocusBot está pensando...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatBottomRef} />
                    </div>

                    <div className={styles['chat-input-area']}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            <div
                                className={styles.chip}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setChatInput('Como melhorar meu foco?')}
                            >
                                Como melhorar meu foco?
                            </div>
                            <div
                                className={styles.chip}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setChatInput('Criar rotina para amanhã')}
                            >
                                Criar rotina
                            </div>
                        </div>

                        <div className={styles['chat-input-wrap']}>
                            <textarea
                                className={styles['chat-input']}
                                placeholder={isLoading ? "Aguarde, FocusBot está digitando..." : "Escreva sua mensagem..."}
                                rows="1"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                disabled={isLoading}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <button
                                className={styles['chat-send']}
                                onClick={handleSendMessage}
                                disabled={isLoading}
                                style={{ opacity: isLoading ? 0.5 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}