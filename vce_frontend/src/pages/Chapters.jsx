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

    useEffect(() => {
        const validSubjects = ['physics', 'chemistry', 'biology'];

        if (!subject || !validSubjects.includes(subject.toLowerCase())) {
            navigate('/404');
            return;
        }

        const loadPageData = async () => {
            try {
                setLoading(true);
                setChapter([]);
                setTopics({});

                const chapterRes = await AxiosInstance.get(`api/chapters/`);

                const filtered = chapterRes.data.filter(item =>
                    item.subject &&
                    item.subject.toLowerCase() === subject.toLowerCase()
                );

                const sortedChapters = filtered.sort((a, b) => {
                    const order = chapterOrders[subject.toLowerCase()] || [];
                    return order.indexOf(a.chapter_name) - order.indexOf(b.chapter_name);
                });

                const topicResults = await Promise.all(
                    sortedChapters.map(async (chapterItem) => {
                        const topicRes = await AxiosInstance.get(
                            `api/chapters/${chapterItem.slug}/topics/`
                        );

                        const desiredOrder =
                            topicOrders[subject.toLowerCase()]?.[chapterItem.slug] || [];

                        const sortedTopics = topicRes.data.sort((a, b) => {
                            return (
                                desiredOrder.indexOf(a.topic_name) -
                                desiredOrder.indexOf(b.topic_name)
                            );
                        });

                        return {
                            slug: chapterItem.slug,
                            topics: sortedTopics
                        };
                    })
                );

                const topicsObject = {};
                topicResults.forEach(item => {
                    topicsObject[item.slug] = item.topics;
                });

                setChapter(sortedChapters);
                setTopics(topicsObject);

            } catch (err) {
                console.error("Failed to load page data", err);
                setChapter([]);
                setTopics({});
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, [subject, navigate]);

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
                    Summaries are designed to complement your textbook — try to focus on understanding the content, not memorising.
                </p>
                <p className="contact-question">
                    <strong>Do let us know if you have any questions about the content.</strong>
                </p>

                 <hr className="dividerMenu"/>
                 
                {loading ? (
                    <div className="loader-overlay">
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

                {!loading  && chapter.length === 0 && (
                    <div className="coming-soon">
                        <span className="flipping-hourglass">⏳</span> {subject.charAt(0).toUpperCase() + subject.slice(1)} Summaries Coming Soon!
                    </div>   
                )}
            </div>
        </div>
    );
};

export default Chapters;