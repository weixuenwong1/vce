import AxiosInstance from '../utils/AxiosInstance'
import { React, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chapterOrders } from "../data/ListOrders";
import '../styles/PracticeSAC.scss';

const PracticeSAC = () => {
    const { subject } = useParams();
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const subjectEmojis = {
        physics: "🚀",
        chemistry: "🧪",
        biology: "🧬"
    };

    const getChapters = async () => {
        try {
            const res = await AxiosInstance.get(`api/chapters`);
            const filtered = res.data.filter(item =>
                item.subject?.toLowerCase() === subject.toLowerCase()
            );

            const sorted = filtered.sort((a, b) => {
                const order = chapterOrders[subject.toLowerCase()] || [];
                return order.indexOf(a.chapter_name) - order.indexOf(b.chapter_name);
            });

            setChapters(sorted);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching chapters:", err);
            setLoading(false);
        }
    };

    const handleChapterClick = (chapterSlug) => {
        navigate(`/practice-sac/${subject}/${chapterSlug}/`);
    };

    useEffect(() => {
        const validSubjects = ['physics', 'chemistry', 'biology'];
        if (!validSubjects.includes(subject.toLowerCase())) {
            navigate('/404');
        } else {
            getChapters();
        }
    }, [subject]);

    return (
        <div className="practice-page">
          <div className="practice-container">
              <h1>
                  {subject.charAt(0).toUpperCase() + subject.slice(1)} Practice SAC {subjectEmojis[subject.toLowerCase()] || "📚"}
              </h1>
              <p className="practice-description">
                  This section allows you to practice content by chapter in a SAC-style format — several questions on one page with total marks to gauge your performance.
              </p>
              <p className="side-note">
                  SAC structures vary by school in question count, difficulty, and format. Use this as a preparation tool, not a replica of your school's SAC.
              </p>

              <hr className="dividerMenu"/>

              {loading ? (
                <div className="loader-wrapper">
                    <div className="loader2"></div>
                </div>
            ) : (
                <div className="chapter-section">
                    {chapters
                        .slice()
                        .sort((a, b) => {
                            const order = chapterOrders[subject.toLowerCase()] || [];
                            const indexA = order.indexOf(a.chapter_name);
                            const indexB = order.indexOf(b.chapter_name);
                            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                        })
                        .map(item => (
                            <div className="sac-chapter-wrapper" key={item.slug}>
                                <div className="sac-left">
                                <h4 className="sac-chapter-heading">{item.chapter_name}</h4>
                                <p className="sac-chapter-description">{item.chapter_description}</p>
                                </div>
                                <div className="sac-right"
                                    role="button"
                                    tabIndex="0"
                                    aria-label={`Generate Practice SAC for ${item.chapter_name}`}
                                    onClick={() => handleChapterClick(item.slug)}
                                    onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleChapterClick(item.slug);
                                    }
                                    }}
                                >
                                <div className="generate-tab">
                                    <h2>Generate Practice SAC</h2>
                                </div>
                                </div>
                            </div>
                            ))}
                </div>
            )}

            {!loading && chapters.length === 0 && (
                <div className="coming-soon">
                    <span className="flipping-hourglass">⏳</span> {subject.charAt(0).toUpperCase() + subject.slice(1)} Practice SAC Coming Soon!
                </div>  
            )}
          </div>
      </div>
    );
};

export default PracticeSAC;
