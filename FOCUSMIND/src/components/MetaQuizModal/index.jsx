import React, { useState, useEffect } from 'react';
import Icon from '../Icon';
import styles from './styles.module.css';

export default function MetaQuizModal({ task, onSuccess, onClose }) {
    const [quizData, setQuizData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        loadQuiz();
    }, [task]);

    const loadQuiz = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:8080/api/chat/gerar-quiz-meta?descricao=${encodeURIComponent(task.descricao)}`);
            const text = await res.text();

            if (res.ok) {
                const data = JSON.parse(text);
                setQuizData(data);
            } else {
                setError("Erro ao gerar as perguntas. Tente novamente mais tarde.");
            }
        } catch (e) {
            setError("Sem conexão com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (index) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        const isCorrect = index === quizData[currentIndex].respostaCorreta;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex < quizData.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    const handleFinish = () => {
        if (score >= 3) {
            onSuccess(); // Sucesso: Conclui a meta de fato
        } else {
            onClose(); // Fracasso: Apenas fecha o modal
        }
    };

    // ── Renders ──
    const renderLoading = () => (
        <div className={styles.loadingState}>
            <div className={styles.loadingIcon}><Icon name="bot" /></div>
            <h3>Gerando Quiz...</h3>
            <p>O FocusBot está criando 5 perguntas sobre "{task.descricao}" para validar seu conhecimento.</p>
        </div>
    );

    const renderError = () => (
        <div className={styles.errorState}>
            <p>{error}</p>
            <button className={styles.btnSecondary} onClick={onClose}>Fechar</button>
        </div>
    );

    const renderResult = () => {
        const passed = score >= 3;
        return (
            <div className={styles.resultState}>
                <div className={styles.resultIcon}>
                    {passed ? <Icon name="trophy" style={{ color: '#ffd700' }} /> : <Icon name="close" style={{ color: '#ff6b6b' }} />}
                </div>
                <h3 className={styles.resultTitle}>{passed ? "Muito bem!" : "Quase lá..."}</h3>
                <p className={styles.resultSubtitle}>Você acertou {score} de 5 perguntas.</p>
                
                {passed ? (
                    <p style={{ color: '#4ecdc4', marginTop: '10px' }}>Você validou seu conhecimento e a meta será concluída!</p>
                ) : (
                    <p style={{ color: '#ff6b6b', marginTop: '10px' }}>Para concluir essa meta, você precisa de pelo menos 3 acertos. Revise o material e tente de novo depois!</p>
                )}

                <button className={styles.btnPrimary} onClick={handleFinish} style={{ marginTop: '20px' }}>
                    {passed ? "Concluir Meta" : "Entendi"}
                </button>
            </div>
        );
    };

    const renderQuestion = () => {
        const question = quizData[currentIndex];
        const isCorrect = isAnswered && selectedOption === question.respostaCorreta;
        const isWrong = isAnswered && selectedOption !== question.respostaCorreta;

        return (
            <>
                <div className={styles.quizHeader}>
                    <h3 className={styles.quizTitle}>Questão {currentIndex + 1} de {quizData.length}</h3>
                    <div className={styles.quizProgress}>
                        {quizData.map((_, i) => (
                            <div 
                                key={i} 
                                className={`${styles.progressDot} ${i === currentIndex ? styles.progressDotActive : ''} ${i < currentIndex ? (/* simplificação visual: não temos array de acertos salvo, apenas score, então mostramos preenchido os passados */ styles.progressDotActive) : ''}`} 
                            />
                        ))}
                    </div>
                </div>

                <p className={styles.questionText}>{question.pergunta}</p>

                <div className={styles.optionsList}>
                    {question.opcoes.map((opt, idx) => {
                        let btnClass = styles.optionBtn;
                        if (isAnswered) {
                            if (idx === question.respostaCorreta) btnClass += ` ${styles.optionCorrect}`;
                            else if (idx === selectedOption) btnClass += ` ${styles.optionWrong}`;
                        } else if (idx === selectedOption) {
                            btnClass += ` ${styles.optionSelected}`;
                        }

                        return (
                            <button
                                key={idx}
                                className={btnClass}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={isAnswered}
                            >
                                <span style={{ fontWeight: 'bold', width: '20px' }}>{String.fromCharCode(65 + idx)}.</span>
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className={styles.feedbackBox}>
                        <div className={`${styles.feedbackTitle} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                            <Icon name={isCorrect ? "check" : "close"} />
                            {isCorrect ? "Correto!" : "Incorreto"}
                        </div>
                        <p className={styles.feedbackText}>{question.explicacao}</p>
                    </div>
                )}

                {isAnswered && (
                    <div className={styles.quizFooter}>
                        <button className={styles.btnPrimary} onClick={handleNextQuestion}>
                            {currentIndex < quizData.length - 1 ? "Próxima" : "Ver Resultado"}
                        </button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                {!isLoading && !isFinished && (
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <Icon name="close" />
                    </button>
                )}
                
                {isLoading && renderLoading()}
                {!isLoading && error && renderError()}
                {!isLoading && !error && !isFinished && quizData.length > 0 && renderQuestion()}
                {!isLoading && !error && isFinished && renderResult()}
            </div>
        </div>
    );
}
