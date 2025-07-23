import AxiosInstance from "./AxiosInstance"
import {React, useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { chapterOrders, topicOrders } from "../constants/ListOrders";
import '../styles/MenuDropdown.scss'

const Practice = () => {
    const { subject } = useParams(); 
    const [chapter, setChapter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState({});
    const navigate = useNavigate();

    const subjectEmojis = {
        physics: "🚀",
        chemistry: "🧪",
        biology: "🧬"
    };

    const GetChapter = () => {
        AxiosInstance.get(`api/chapters`).then((res) => {
            const filtered = res.data.filter(item =>
            item.subject && item.subject.toLowerCase() === subject.toLowerCase()
            );
            setChapter(filtered);
            setLoading(false);
        });
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
        if (!validSubjects.includes(subject.toLowerCase())) {
            navigate('/');
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
                    {subject.charAt(0).toUpperCase() + subject.slice(1)} Practice {subjectEmojis[subject.toLowerCase()] || "📚"}
                </h1>
                <p className="practice-description">
                    This section provides a range of practice questions, from easy to exam-level and occasionally beyond, to test your understanding of the topic.                 </p>
                <p className="side-note">
                    There isn’t always just one way to solve a problem.
                </p>

                <hr className="dividerMenu" />
                
                {loading ? (
                    <div className="loader-wrapper">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div className="chapter-section">
                        {chapter
                            .slice()
                            .sort((a, b) => {
                                const order = chapterOrders[subject.toLowerCase()] || [];
                                const indexA = order.indexOf(a.chapter_name);
                                const indexB = order.indexOf(b.chapter_name);
                                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
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
                                                    <tr key={index}
                                                        className="topic-row"
                                                        onClick={() => navigate(`/practice/${subject}/${item.slug}/${topic.slug}/`)}>
                                                        <td>
                                                            <span className="topic-text">{topic.topic_name}</span>
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
                    <p className="coming-soon">{subject.charAt(0).toUpperCase() + subject.slice(1)} Practice Questions Coming Soon!</p>
                )}
            </div>    
        </div>
    )
}

export default Practice