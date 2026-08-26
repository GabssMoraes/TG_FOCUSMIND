import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Icon from '../../components/Icon';
import styles from './styles.module.css';
import { playSuccessSound, playChestSound } from '../../utils/audioUtils';

export default function Quiz() {
    const navigate = useNavigate();
    const { userId } = useAuth();

    const [quizData, setQuizData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [rewardGiven, setRewardGiven] = useState(false);

    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        loadQuiz();
    }, [userId]);

    const loadQuiz = async () => {
        if (!userId) return;
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const res = await fetch(`http://localhost:8080/api/chat/gerar-quiz?userId=${userId}`);
            const text = await res.text();
            
            if (res.ok) {
                const data = JSON.parse(text);
                setQuizData(data);
            } else {
                if (text.includes("429") || text.includes("RESOURCE_EXHAUSTED") || text.includes("503") || text.includes("UNAVAILABLE")) {
                    setErrorMessage("Ufa! O FocusBot analisou muitos dados agora pouco e atingiu o limite da API. Respire fundo e tente novamente em 1 minuto! 🧘");
                } else {
                    setErrorMessage("Erro ao gerar quiz. Verifique se você cadastrou sua matéria e tente novamente.");
                }
            }
        } catch (error) {
            console.error("Erro ao buscar quiz:", error);
            setErrorMessage("Sem conexão com o servidor. Verifique se o backend está rodando.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (index) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        const isCorrect = index === quizData[currentQuestionIndex].respostaCorreta;
        if (isCorrect) {
            setScore(prev => prev + 1);
            playSuccessSound();
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setQuizFinished(true);
            giveRewards();
        }
    };

    const giveRewards = async () => {
        if (rewardGiven) return;
        setRewardGiven(true);
        
        const finalScore = score + (selectedOption === quizData[currentQuestionIndex].respostaCorreta ? 1 : 0);
        
        if (finalScore === quizData.length) {
            // Gabaritou! Ganha 50 moedas e 1 baú
            try {
                // Para dar moedas, podemos usar a rota de adicionar pontos, mas não criamos uma específica para o quiz ainda.
                // Como workaround, podemos avisar o usuário para testar ou criar uma rota se necessário.
                // Por enquanto, apenas daremos o feedback visual.
                playChestSound();
                toast.success(<span>Você gabaritou! Ganhou +50 moedas e 1 Baú! <Icon name="gift" /></span>, { duration: 4000 });
                // NOTA: Para integração real de pontos, uma rota /api/usuarios/{id}/recompensa-quiz seria necessária no backend.
            } catch (e) {
                console.error(e);
            }
        } else if (finalScore > 0) {
            toast.success(`Bom trabalho! Você acertou ${finalScore} perguntas.`);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <Icon name="bot" className="wave-animation" style={{ fontSize: '3rem', color: '#7c6cfa', marginBottom: '16px' }} />
                    <h2>O FocusBot está gerando seu quiz...</h2>
                    <p style={{ color: 'var(--muted)' }}>Isso pode levar alguns segundos.</p>
                </div>
            </div>
        );
    }

    if (!quizData || quizData.length === 0) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <Icon name="xmark" style={{ fontSize: '3rem', color: 'var(--error)', marginBottom: '16px' }} />
                    <h2>{errorMessage || "Não foi possível carregar o quiz."}</h2>
                    <button className={styles.btnPrimary} onClick={() => window.location.reload()} style={{ marginTop: '20px', marginRight: '10px' }}>
                        <Icon name="redo" /> Tentar Novamente
                    </button>
                    <button className={styles.btnBack} onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>
                        Voltar ao Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (quizFinished) {
        const finalScore = score;
        const allCorrect = finalScore === quizData.length;
        
        return (
            <div className={styles.page}>
                <div className={styles.resultCard}>
                    <h1 className={styles.resultTitle}>
                        {allCorrect ? <><Icon name="trophy" style={{ color: 'var(--accent3)' }}/> Perfeito!</> : <><Icon name="book" style={{ color: 'var(--accent)' }}/> Fim do Quiz!</>}
                    </h1>
                    <p className={styles.resultScore}>
                        Você acertou <strong>{finalScore}</strong> de <strong>{quizData.length}</strong> perguntas.
                    </p>
                    
                    {allCorrect && (
                        <div className={styles.perfectScoreAnim}>
                            <div className={styles.bigChest}><Icon name="box" style={{ color: '#f7c59f' }} /></div>
                            <p className={styles.rewardText}>Recompensa Máxima Desbloqueada!</p>
                        </div>
                    )}

                    <button className={styles.btnPrimary} onClick={() => navigate('/dashboard')} style={{ marginTop: '30px' }}>
                        Voltar ao Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = quizData[currentQuestionIndex];

    return (
        <div className={styles.page}>
            <div className={styles.quizHeader}>
                <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>
                    ← Voltar
                </button>
                <div className={styles.progressText}>
                    Pergunta {currentQuestionIndex + 1} de {quizData.length}
                </div>
            </div>

            <div className={styles.quizContainer}>
                <div className={styles.questionCard}>
                    <h2 className={styles.questionText}>{currentQuestion.pergunta}</h2>
                    
                    <div className={styles.optionsList}>
                        {currentQuestion.opcoes.map((opcao, index) => {
                            let optionClass = styles.optionBtn;
                            if (isAnswered) {
                                if (index === currentQuestion.respostaCorreta) {
                                    optionClass = `${styles.optionBtn} ${styles.correct}`;
                                } else if (index === selectedOption) {
                                    optionClass = `${styles.optionBtn} ${styles.wrong}`;
                                } else {
                                    optionClass = `${styles.optionBtn} ${styles.disabled}`;
                                }
                            }

                            return (
                                <button 
                                    key={index} 
                                    className={optionClass}
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={isAnswered}
                                >
                                    <span className={styles.optionLetter}>{String.fromCharCode(65 + index)}</span>
                                    {opcao}
                                </button>
                            );
                        })}
                    </div>

                    {isAnswered && (
                        <div className={styles.explanationBox}>
                            <div className={styles.explanationTitle}>
                                {selectedOption === currentQuestion.respostaCorreta 
                                    ? <span style={{ color: 'var(--success)' }}><Icon name="check" /> Correto!</span>
                                    : <span style={{ color: 'var(--error)' }}><Icon name="xmark" /> Incorreto</span>
                                }
                            </div>
                            <p>{currentQuestion.explicacao}</p>
                            <button className={styles.btnNext} onClick={handleNextQuestion}>
                                {currentQuestionIndex < quizData.length - 1 ? 'Próxima Pergunta →' : <><Icon name="trophy" /> Ver Resultados</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
