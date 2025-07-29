import { useEffect, useState } from 'react';
import AxiosInstance from '../utils/AxiosInstance'
import { useParams, useNavigate } from 'react-router-dom';
import { MathJax, MathJaxContext } from 'better-react-mathjax';


const QuestionsForTopic = () => {
    const { subject, chapter_slug, topic_slug } = useParams();
    const [allQuestions, setAllQuestions] = useState([]);
    const [questionCycle, setQuestionCycle] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSolutions, setShowSolutions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [delayedLoading, setDelayedLoading] = useState(false);
    const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    const navigate = useNavigate();



    const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await AxiosInstance.get(`api/problems/${subject}/${chapter_slug}/${topic_slug}/?count=1`);
                const data = res.data;

                if (!data || data.length === 0) {
                    navigate(`/practice/${subject}`);
                    return;
                }

                const shuffled = shuffleArray(res.data);
                setAllQuestions(res.data);
                console.log(res.data)
                setQuestionCycle(shuffled);
                setCurrentIndex(0);
            } catch (err) {
                console.error("Failed to load questions", err);
                navigate(`/practice/${subject}`);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();

        const timer = setTimeout(() => {
            setMinimumLoadTimePassed(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, [chapter_slug, topic_slug]);


    const handleNextQuestion = () => {
        setShowSolutions(false);
        setDelayedLoading(true);

        setTimeout(() => {
            const nextIndex = currentIndex + 1;

            if (nextIndex >= questionCycle.length) {
                const reshuffled = shuffleArray(allQuestions);
                setQuestionCycle(prev => [...prev, ...reshuffled]);
            }

            setCurrentIndex(nextIndex); 
            setDelayedLoading(false);
            console.log(nextIndex + 1);
        }, 800);
    };

    const toggleShowSolutions = () => {
        setShowSolutions(prev => !prev);
    };

    useEffect(() => {
        if (!loading && minimumLoadTimePassed && !delayedLoading) {
            setTimeout(() => {
                setContentVisible(true);
            }, 10); 
        } else {
            setContentVisible(false); 
        }
    }, [loading, minimumLoadTimePassed, delayedLoading]);

    useEffect(() => {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise()
                .catch((err) => console.error("MathJax rendering error:", err));
        }
    }, [questionCycle, currentIndex, showSolutions]);

    if (loading || delayedLoading || !minimumLoadTimePassed) {
        return (
            <div className="loader-wrapper">
                <div className="loader2"></div>
            </div>
        );
    }
    if (questionCycle.length === 0) return <div className="no-questions">No questions available.</div>;

    const currentQuestion = questionCycle[currentIndex];

    const mathJaxConfig = {
            chtml: {
                displayAlign: 'left'
            }
        };

    const extractMarks = (text) => {
        const match = text.match(/([\s\S]*?)\s*\n?\s*(\(\d+\s*marks?\))\s*$/i);
        if (match) {
            return { body: match[1].trim(), marks: match[2].trim() };
        }
        return { body: text.trim(), marks: null };
    };


    
    return (
        <div style={{display: 'flex', justifyContent: 'center', padding: '2rem'}}>
            <div className={`fade-in ${contentVisible ? 'visible' : ''}`}
                style={{ maxWidth: '1300px', width: '100%', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', whiteSpace: 'pre-line'}}>
                {currentQuestion.question_text}
            </h3>
            <p style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.9rem',
                marginTop: '-1rem',
                marginBottom: '2rem'
            }}>
                <strong>Question ID:</strong> {currentQuestion.question_uid}
            </p>
            <div>
                {currentQuestion.orders.map(order => (
                    <div key={order.order_uid} style={{ marginBottom: '3.5rem' }}>
                        {order.content_type === "TEXT" && order.text_content && (
                            <div style={{ marginBottom: '1rem' }}>
                                {(() => {
                                    const { body, marks } = extractMarks(order.text_content);
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 550, fontSize: '1.1rem', whiteSpace: 'pre-line', margin: 0, flex: 1 }}>
                                                {body}
                                            </p>
                                            {marks && (
                                                <div style={{ textAlign: 'right', fontWeight: 500, fontSize: '1.1rem', marginLeft: '1rem', whiteSpace: 'nowrap' }}>
                                                    {marks}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {order.content_type === "IMAGE" && order.image_content && (
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                            <img src={order.image_content} alt="Question Image" style={{ maxWidth: '90%' }} />
                        </div>
                        )}

                        {showSolutions && order.solution && (
                            <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', marginTop: '1rem' }}>
                            {order.solution.solution_image && (
                                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center'  }}>
                                    <img src={order.solution.solution_image} alt="Solution Image" style={{ maxWidth: '90%' }} />
                                </div>
                            )}
                            {order.solution.solution_text && (
                            <MathJaxContext config={mathJaxConfig}>
                                <div className="scroll-math">
                                    <div style={{ minWidth: 'max-content' }}>
                                    <MathJax>
                                        {order.solution.solution_text.replace(/\\\\\(/g, "\\[")
                                                                           .replace(/\\\\\)/g, "\\]")
                                                                           .replace(/\\\\/g, "\\")}
                                    </MathJax>
                                    </div>
                                </div>
                            </MathJaxContext>
                            )}
                            </div>
                        )}
                        </div>
                    ))}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={toggleShowSolutions} style={{ width: '70%' }}>
                        {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
                    </button>
                </div>
            
            {showSolutions && !currentQuestion.orders.some(order => order.solution !== null) && currentQuestion.general_solution && (
                <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', marginTop: '2rem' }}>
                    {currentQuestion.general_solution.solution_text && (
                      <MathJaxContext config={mathJaxConfig}>
                                <div className="scroll-math">
                                    <div style={{ minWidth: 'max-content' }}>
                                    <MathJax>
                                        {currentQuestion.general_solution.solution_text.replace(/\\\\\(/g, "\\[")
                                                                           .replace(/\\\\\)/g, "\\]")
                                                                           .replace(/\\\\/g, "\\")}
                                    </MathJax>
                                </div>
                            </div>
                        </MathJaxContext>
                    )}
                    {currentQuestion.general_solution.solution_image && (
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                            <img src={currentQuestion.general_solution.solution_image} alt="Solution Image" style={{ maxWidth: '80%' }} />
                        </div>
                    )}
                </div>
            )}
                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <button
                    onClick={() => {
                        if (currentIndex > 0) {
                        setShowSolutions(false);
                        setCurrentIndex(prev => prev - 1);
                        }
                    }}
                    disabled={currentIndex === 0}
                    style={{ flex: 1 }}
                    >
                        Previous Question
                    </button>

                    <button
                    onClick={handleNextQuestion}
                    style={{ flex: 1 }}
                    >
                        Next Question
                    </button>
                </div>
            </div>
        </div>

        </div>
    );
};

export default QuestionsForTopic;