import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './styles.module.css';

export default function Chat() {
    const navigate = useNavigate();

    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Oi! Como posso te ajudar hoje?' }
    ]);

    const chatBottomRef = useRef(null);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;

        setMessages((prev) => [
            ...prev,
            { sender: 'user', text: chatInput }
        ]);

        setChatInput('');

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { sender: 'ai', text: 'Resposta automática da IA 🤖' }
            ]);
        }, 1000);
    };

    return (
        <div className={styles.page}>
            <div className={styles['chat-layout']}>
                <div className={styles['chat-sidebar']}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '.9rem' }}>
                            Conversas
                        </span>

                        <button
                            className={styles['btn-primary']}
                            style={{ padding: '6px 12px', fontSize: '.78rem' }}
                        >
                            + Nova
                        </button>
                    </div>

                    <div className={`${styles['chat-history-item']} ${styles.active}`}>
                        🎯 Plano de estudos hoje
                    </div>


                    <div
                        className={styles['chat-history-item']}
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Voltar
                    </div>
                </div>

                <div className={styles['chat-main']}>

                    <div className={styles['chat-header']}>
                        <div className={styles['ai-avatar']}>🤖</div>
                        <div>
                            <div style={{ fontFamily: 'Syne', fontWeight: 700 }}>
                                FocusAI
                            </div>
                            <div style={{ fontSize: '.78rem', color: 'var(--accent)' }}>
                                ● Online
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
                                    {msg.sender === 'ai' ? '🤖' : 'A'}
                                </div>

                                <div
                                    className={styles['msg-bubble']}
                                    dangerouslySetInnerHTML={{ __html: msg.text }}
                                />
                            </div>
                        ))}
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
                                placeholder="Escreva sua mensagem..."
                                rows="1"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
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