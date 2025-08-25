import { useEffect, useState, useRef } from 'react';
import AxiosInstance from '../utils/AxiosInstance'
import { useParams, useNavigate } from 'react-router-dom';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import '../styles/Problems.scss'


const QuestionsForTopic = () => {
    const { subject, chapter_slug, topic_slug } = useParams();
    const [allQuestions, setAllQuestions] = useState([]);
    const [questionCycle, setQuestionCycle] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSolutions, setShowSolutions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [contentVisible, setContentVisible] = useState(false);
    const [totalAvailable, setTotalAvailable] = useState(0);


    const [topicId, setTopicId] = useState(null);

    const [seenQuestions, setSeenQuestions] = useState(new Set());
    const seenRef = useRef(new Set());
    const inFlight = useRef(new Set());
    const [navLock, setNavLock] = useState(false);

    const navigate = useNavigate();

    const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
    };

    const goTo = (i) => {
        const len = questionCycle.length;
        if (!len) return;
        const idx = Math.max(0, Math.min(i, len - 1));
        setCurrentIndex(idx);
    };

    const fetchQuestions = async () => {
        const MIN_SPINNER_MS = 1200;
        const spin = new Promise((res) => setTimeout(res, MIN_SPINNER_MS));
        try {
            const res = await AxiosInstance.get(`api/problems/${subject}/${chapter_slug}/${topic_slug}`);
            const data = res.data;

            if (!data?.questions?.length) {
            navigate('/404');
            return;
            }

            setTopicId(data.topic_id ?? null);

            setTotalAvailable(data.total_available || data.questions.length || 0);
            setAllQuestions(data.questions);
            setQuestionCycle(shuffleArray(data.questions));
            setCurrentIndex(0);


            seenRef.current = new Set();
            setSeenQuestions(new Set());

            await spin;
            setLoading(false);
            setContentVisible(true);
        } catch (err) {
            console.error("Failed to load questions", err);
            navigate('/500');
        }
    };

    useEffect(() => {
        setLoading(true);
        setContentVisible(false);
        fetchQuestions();
    }, [subject, chapter_slug, topic_slug]);

    const markSeen = async (questionUid) => {
        if (!questionUid) return;

        if (seenRef.current.has(questionUid) || inFlight.current.has(questionUid)) return;

        inFlight.current.add(questionUid);
        try {
            await AxiosInstance.post(`/api/mark-seen/`, { question_uid: questionUid });
            seenRef.current.add(questionUid);
            setSeenQuestions(new Set(seenRef.current));
        } catch (err) {
            console.error("Failed to mark question as seen", err);
        } finally {
            inFlight.current.delete(questionUid);
        }
    };

    const resetOnServerAndRefetch = async () => {
        if (!topicId) {
            const fullList = allQuestions.length ? allQuestions : questionCycle;
            setQuestionCycle(prev => [...prev, ...shuffleArray(fullList)]);
            return;
        }

        try {
            await AxiosInstance.delete(`/api/reset-seen/${topicId}/`);
            seenRef.current = new Set();
            setSeenQuestions(new Set());
            await fetchQuestions();
        } catch (err) {
            console.error("Failed to reset seen on server", err);
            const fullList = allQuestions.length ? allQuestions : questionCycle;
            setQuestionCycle(prev => [...prev, ...shuffleArray(fullList)]);
        }
    };

    const handleNextQuestion = async () => {
    if (!questionCycle.length || navLock) return;
    setNavLock(true);
    setShowSolutions(false);
    setContentVisible(false);

    const currentUid = questionCycle[currentIndex]?.question_uid;

    try { await markSeen(currentUid); } catch {}

    setTimeout(async () => {
        window.scrollTo(0, 0);

        const nextIndex = currentIndex + 1;
        if (nextIndex < questionCycle.length) {
            setCurrentIndex(nextIndex);
            setContentVisible(true);
            setNavLock(false);
            return;
        }

        if (totalAvailable > 0 && seenRef.current.size >= totalAvailable) {
            await resetOnServerAndRefetch();
            setNavLock(false);
            return;
        }

        try {
            const res = await AxiosInstance.get(`api/problems/${subject}/${chapter_slug}/${topic_slug}`);
            const data = res.data;

            if (!data?.questions?.length) {
                navigate('/404');
                return;
            }

            const cycleIds = new Set(questionCycle.map(q => q.question_uid));
            const newOnes = data.questions.filter(q => !cycleIds.has(q.question_uid));
            if (newOnes.length === 0) {
                const fullList = allQuestions.length ? allQuestions : data.questions;
                setQuestionCycle(prev => [...prev, ...shuffleArray(fullList)]);
                setCurrentIndex(prev => prev + 1);
                setContentVisible(true);
                setNavLock(false);
                return;
            }

            setTopicId(data.topic_id ?? topicId);
            setTotalAvailable(data.total_available || totalAvailable);
            setAllQuestions(prev => [...prev, ...newOnes]);
            setQuestionCycle(prev => [...prev, ...shuffleArray(newOnes)]);
            setCurrentIndex(prev => prev + 1);
            setContentVisible(true);
        } catch (err) {
            console.error("Failed to fetch", err);
            navigate('/500');
        } finally {
            setNavLock(false);
        }
    }, 800);
    };

    const handlePreviousQuestion = () => {
        if (currentIndex === 0 || navLock) return;
        setShowSolutions(false);
        setContentVisible(false);
        setTimeout(() => {
            goTo(currentIndex - 1);
            setContentVisible(true);
            window.scrollTo(0, 0);
        }, 800);
    };


    const toggleShowSolutions = () => {
        setShowSolutions(prev => !prev);
    };


    useEffect(() => {
        if (window.MathJax?.typesetPromise) {
            window.MathJax.typesetPromise()
            .catch(err => console.error("MathJax rendering error:", err));
        }
    }, [questionCycle, currentIndex, showSolutions]);

    if (loading || !contentVisible) {
        return (
            <div className="loader-wrapper">
                <div className="loader2"></div>
            </div>
        );
    }


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
       <main className="question-display-container">
        <div className= "inner-container">
            <div className="question-header">
                <div className="question-meta">
                    <h3>{currentQuestion.question_text}</h3>
                    <p><strong>Question ID:</strong> {currentQuestion.question_uid}</p>
                    <h4 className="difficulty">
                        <strong className="difficulty-label">Difficulty:</strong>{' '}
                        <span className={currentQuestion.difficulty === 'Easy' ? 'easy' : 'exam'}>
                            {currentQuestion.difficulty}
                        </span>
                    </h4>
                </div>

                <div className="button-wrapper">
                    <button
                    className="button-link toggle-button"
                    onClick={toggleShowSolutions}
                    title={showSolutions ? 'Hide Solutions' : 'Show Solutions'}
                    >
                    {showSolutions ? '🙈 Hide Solutions' : '🧠 Show Solutions'}
                    </button>
                </div>
            </div>
            <div>
            {currentQuestion.orders.map(order => (
                <div key={order.order_uid} className="order-block">
                {order.content_type === "TEXT" && order.text_content && (() => {
                    const { body, marks } = extractMarks(order.text_content);
                    return (
                        <div className={`text-order ${showSolutions ? 'has-solution' : ''}`}>
                            <div className="text-flex">
                                <p>{body}</p>
                                {marks && <div className="marks">{marks}</div>}
                            </div>
                        </div>
                    );
                })()}

                {order.content_type === "IMAGE" && order.image_content && (
                    <div className="image-order">
                    <picture>
                        <source srcSet={order.image_content.replace('.png', '.webp')} type="image/webp" />
                        <img src={order.image_content} alt="Question Image" loading="lazy" />
                    </picture>
                    </div>
                )}

                {showSolutions && order.solution && (
                    <div className="solution-container">
                    {order.solution.solution_image && (
                        <div className="solution-image">
                         <picture>
                            <source
                                srcSet={order.solution.solution_image?.replace(/\.png$/i, '.webp')}
                                type="image/webp"
                            />
                            <img
                                src={order.solution.solution_image}
                                alt="Solution Image"
                                loading="lazy"
                            />
                        </picture>
                        </div>
                    )}
                    {order.solution.solution_text && (
                        <MathJaxContext config={mathJaxConfig}>
                        <div className="scroll-math">
                            <div>
                            <MathJax>
                                {order.solution.solution_text
                                .replace(/\\\\\(/g, "\\[")
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

            {showSolutions &&
                !currentQuestion.orders.some(order => order.solution !== null) &&
                currentQuestion.general_solution && (
                <div className="general-solution">
                    {currentQuestion.general_solution.solution_text && (
                    <MathJaxContext config={mathJaxConfig}>
                        <div className="scroll-math">
                        <div>
                            <MathJax>
                            {currentQuestion.general_solution.solution_text
                                .replace(/\\\\\(/g, "\\[")
                                .replace(/\\\\\)/g, "\\]")
                                .replace(/\\\\/g, "\\")}
                            </MathJax>
                        </div>
                        </div>
                    </MathJaxContext>
                    )}
                    {currentQuestion.general_solution?.solution_image && (
                    <div className="solution-image">
                        <picture>
                        <source
                            srcSet={currentQuestion.general_solution.solution_image.replace(/\.png$/i, '.webp')}
                            type="image/webp"
                        />
                        <img
                            src={currentQuestion.general_solution.solution_image}
                            alt="Solution Image"
                            loading="lazy"
                        />
                        </picture>
                    </div>
                    )}
                </div>
                )}

            <div className="question-nav">
                <span
                    className={`question-link left ${currentIndex === 0 ? 'disabled' : ''}`}
                    role="button"
                    tabIndex={currentIndex === 0 ? -1 : 0}
                    onClick={currentIndex === 0 ? undefined : handlePreviousQuestion}
                    aria-disabled={currentIndex === 0}
                    title={currentIndex === 0 ? '' : 'Previous Question'}
                >
                    <ChevronLeft />
                    <span className="link-label-full">Previous Question</span>
                    <span className="link-label-short">Previous</span>
                </span>

                <span
                    className="question-link right"
                    role="button"
                    tabIndex={0}
                    onClick={handleNextQuestion}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleNextQuestion();
                    }}
                    title="Next Question"
                >
                    <span className="link-label-short">Next</span>
                    <span className="link-label-full">Next Question</span>
                    <ChevronRight />
                </span>
                </div>
            </div>
        </div>
    </main>
    );
};

export default QuestionsForTopic;