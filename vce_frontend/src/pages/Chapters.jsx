import AxiosInstance from '../utils/AxiosInstance'
import { React, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chapterOrders, topicOrders } from "../data/ListOrders";
import '../styles/MenuDropdown.scss';

const Chapters = () => {
    const { subject } = useParams();
    const navigate = useNavigate();

    const [chapter, setChapter] = useState([]);
    const [topics, setTopics] = useState({});
    const [loading, setLoading] = useState(true);

    const subjectEmojis = {
        physics: "🚀",
        chemistry: "🧪",
        biology: "🧬"
    };

    const GetChapter = async () => {
        try {
            const res = await AxiosInstance.get(`api/chapters`);
            const filtered = res.data.filter(item =>
                item.subject && item.subject.toLowerCase() === subject.toLowerCase()
            );

            const sorted = filtered.sort((a, b) => {
                const order = chapterOrders[subject.toLowerCase()] || [];
                return order.indexOf(a.chapter_name) - order.indexOf(b.chapter_name);
            });

            setChapter(sorted);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load chapters for", subject, err);
        }
    };

    const fetchTopics = async (slug) => {
        if (topics[slug]) return;

        try {
            const res = await AxiosInstance.get(`api/chapters/${slug}/topics/`);
            const desiredOrder = topicOrders[subject?.toLowerCase()]?.[slug] || [];

            const sortedTopics = res.data.sort((a, b) => {
            return desiredOrder.indexOf(a.topic_name) - desiredOrder.indexOf(b.topic_name);
            });

            setTopics((prev) => ({ ...prev, [slug]: sortedTopics }));
        } catch (err) {
            console.error("Failed to load topics for", slug, err);
        }
    };

    useEffect(() => {
        const validSubjects = ['physics', 'chemistry', 'biology'];
        if (!validSubjects.includes(subject?.toLowerCase())) {
            navigate('/404');
        } else {
            GetChapter();
        }
    }, [subject]);

    useEffect(() => {
        chapter.forEach(item => fetchTopics(item.slug));
    }, [chapter]);

    return (
        <div className="practice-page">
            <div className="practice-container">
                <h1>
                    {subject.charAt(0).toUpperCase() + subject.slice(1)} Summaries {subjectEmojis[subject.toLowerCase()] || "📚"}
                </h1>
                <p className="practice-description">
                    This section provides chapter and topic summaries, helping you understand key concepts efficiently and see how they are applied in assessments.
                </p>
                <p className="side-note">
                    Summaries are designed to complement your textbook — focus on understanding, not memorising.
                </p>

                 <hr className="dividerMenu"/>
                 
                {loading ? (
                    <div className="loader-wrapper">
                        <div className="loader2"></div>
                    </div>
                ) : (
                    <div className="chapter-section">
                        {chapter
                            .slice()
                            .sort((a, b) => {
                                const order = chapterOrders[subject.toLowerCase()] || [];
                                return (order.indexOf(a.chapter_name) - order.indexOf(b.chapter_name));
                            })
                            .map(item => (
                                <div key={item.chapter_uid}>
                                    <h4 className="chapter-heading">{item.chapter_name}</h4>
                                    <div className="chapter-wrapper">
                                        <div className="chapter-left-box">
                                            <h4 className="subtitle">Description</h4>
                                            <p className="chapter-description">{item.chapter_description}</p>
                                        </div>
                                        <div className="chapter-right-box">
                                            <table className="topics-table">
                                                <tbody>
                                                    {topics[item.slug]?.map((topic, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <div
                                                                className="topic-row"
                                                                tabIndex="0"
                                                                role="link"
                                                                aria-label={`Go to ${topic.topic_name} summary`}
                                                                onClick={() => navigate(`/summaries/${subject}/${item.slug}/${topic.slug}`)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                    navigate(`/summaries/${subject}/${item.slug}/${topic.slug}`);
                                                                    }
                                                                }}
                                                                >
                                                                <span className="topic-text">{topic.topic_name}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {chapter.length === 0 && !loading && (
                    <div className="coming-soon">
                        <span className="flipping-hourglass">⏳</span> {subject.charAt(0).toUpperCase() + subject.slice(1)} Summaries Coming Soon!
                    </div>   
                )}
            </div>
        </div>
    );
};

export default Chapters;