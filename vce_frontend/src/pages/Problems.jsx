import { useEffect, useState, useRef } from 'react';
import AxiosInstance from '../utils/AxiosInstance'
import { useParams, useNavigate } from 'react-router-dom';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import '../styles/Loader.scss';
import '../styles/Problems.scss';
import '../components/LoaderOverlay';


const QuestionsForTopic = () => {
    const { subject, chapter_slug, topic_slug } = useParams();

    const [current, setCurrent] = useState(null);
    const [history, setHistory] = useState([]);   
    const [cursor, setCursor] = useState(-1);   
    const [showSolutions, setShowSolutions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [contentVisible, setContentVisible] = useState(false);
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [navLock, setNavLock] = useState(false);

    const navigate = useNavigate();

    const nextUrl = `api/problems/${subject}/${chapter_slug}/${topic_slug}/`; 

    const prevDisabled = cursor <= 0 || navLock;
    const nextDisabled = navLock;

    async function fetchNextQuestion() {
        const res = await AxiosInstance.post(nextUrl); 
        return res.data; 
    }

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setContentVisible(false);
            setShowSolutions(false);
            setHistory([]);         
            setCursor(-1);
            setCurrent(null);

            try {
                const MIN_SPINNER_MS = 600;
                const spin = new Promise(r => setTimeout(r, MIN_SPINNER_MS));

                const { question, meta } = await fetchNextQuestion();
                if (cancelled) return;

                setTotalAvailable(meta?.total_available ?? 0);
                setHistory([question]);
                setCursor(0);
                setCurrent(question);

                await spin;
                setContentVisible(true);
            } catch (e) {
                if (e.response?.status === 404) {
                    navigate('/404');
                } else {
                    navigate('/500');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [subject, chapter_slug, topic_slug]);

    const handleNextQuestion = async () => {
        if (navLock) return;
        setNavLock(true);
        setShowSolutions(false);
        setContentVisible(false);

        const MIN_SPINNER_MS = 800;
        const spin = new Promise(r => setTimeout(r, MIN_SPINNER_MS));

        if (cursor < history.length - 1) {
            const newCursor = cursor + 1;
            setCursor(newCursor);
            setCurrent(history[newCursor]);
            await spin;
            setContentVisible(true);
            setNavLock(false);
            window.scrollTo(0, 0);
            return;
        }

        try {
            const { question, meta } = await fetchNextQuestion();
            setTotalAvailable(meta?.total_available ?? totalAvailable);

            setHistory(prev => [...prev, question]);
            setCursor(prev => prev + 1);
            setCurrent(question);

            await spin;
            setContentVisible(true);
            window.scrollTo(0, 0);
        } catch (e) {
            console.error("Failed to fetch next", e);
            navigate('/500');
        } finally {
            setNavLock(false);
        }
    };

    const handlePreviousQuestion = () => {
        if (navLock) return;
        if (cursor <= 0) return;             
        setShowSolutions(false);
        setContentVisible(false);

        const newCursor = cursor - 1;
        setCursor(newCursor);
        setCurrent(history[newCursor]);

        setTimeout(() => {
            setContentVisible(true);
            window.scrollTo(0, 0);
        }, 250);
    };

    const toggleShowSolutions = () => setShowSolutions(v => !v);

    useEffect(() => {
        if (window.MathJax?.typesetPromise) {
            window.MathJax.typesetPromise().catch(err => console.error("MathJax error:", err));
        }
    }, [current, showSolutions]);

    if (loading || !contentVisible || !current) {
        return (
            <div className="loader-overlay">
                <div className="loader2"></div>
            </div>
        );
    }

    const currentQuestion = current;

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
                    className={`question-link left ${prevDisabled ? 'disabled' : ''}`}
                    role="button"
                    tabIndex={prevDisabled ? -1 : 0}
                    onClick={!prevDisabled ? handlePreviousQuestion : undefined}
                    onKeyDown={
                    !prevDisabled
                        ? (e) => { if (e.key === 'Enter' || e.key === ' ') handlePreviousQuestion(); }
                        : undefined
                    }
                    aria-disabled={prevDisabled}
                    title={prevDisabled ? '' : 'Previous Question'}
                >
                    <ChevronLeft />
                    <span className="link-label-full">Previous Question</span>
                    <span className="link-label-short">Previous</span>
                </span>

                <span
                    className={`question-link right ${nextDisabled ? 'disabled' : ''}`}
                    role="button"
                    tabIndex={nextDisabled ? -1 : 0}
                    onClick={!nextDisabled ? handleNextQuestion : undefined}
                    onKeyDown={
                    !nextDisabled
                        ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleNextQuestion(); }
                        : undefined
                    }
                    aria-disabled={nextDisabled}
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