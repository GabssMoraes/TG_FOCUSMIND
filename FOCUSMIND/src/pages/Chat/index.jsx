import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/Icon';
import styles from './styles.module.css';

// Função auxiliar para formatar a resposta do Gemini em HTML limpo e amigável
const formatMessage = (text) => {
    if (!text) return '';
    
    // Escapa tags HTML nativas para evitar XSS
    let escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Transforma negrito **texto** em <strong>texto</strong>
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Identifica e formata bullet points que começam com • ou *
    const lines = escaped.split('\n');
    const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('*')) {
            const content = trimmed.substring(1).trim();
            return `<li style="margin-left: 15px; margin-bottom: 4px;">${content}</li>`;
        }
        return line;
    });

    return formattedLines.join('<br />');
};

export default function Chat() {
    const { userId } = useAuth();

    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Oi! Como posso te ajudar hoje?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const chatBottomRef = useRef(null);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        const loadHistory = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`http://localhost:8080/api/chat/historico?userId=${userId}`);
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
            }
        };
        loadHistory();
    }, [userId]);

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mensagem: userMessage, userId })
            });

            if (!response.ok) {
                throw new Error('Falha na comunicação com o servidor.');
            }

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                { sender: 'ai', text: formatMessage(data.resposta) }
            ]);

        } catch (error) {
            console.error('Erro no chat:', error);
            setMessages((prev) => [
                ...prev,
                { 
                    sender: 'ai', 
                    text: '<span style="color: #ff6b6b; font-weight: 500;">⚠️ Ops! Não consegui me conectar ao assistente. Certifique-se de que o backend está rodando e com a chave da API do Gemini configurada em application-secret.properties.</span>' 
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles['chat-layout']}>

                <div className={styles['chat-main']}>

                    <div className={styles['chat-header']}>
                        <div className={styles['ai-avatar']}><Icon name="bot" /></div>
                        <div>
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