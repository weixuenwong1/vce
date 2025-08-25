import AxiosInstance from '../utils/AxiosInstance'
import { React, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { chapterOrders, topicOrders } from "../data/ListOrders";
import '../styles/MenuDropdown.scss'
import { PencilLine } from 'lucide-react';

const Practice = () => {
  const { subject } = useParams(); 
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState({});
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

  const fetchTopics = async (slug) => {
    if (topics[slug]) return; 

    try {
      const res = await AxiosInstance.get(`api/chapters/${slug}/topics/`);
      const desiredOrder = topicOrders[subject?.toLowerCase()]?.[slug] || [];

      const sortedTopics = res.data.sort((a, b) => {
        return desiredOrder.indexOf(a.topic_name) - desiredOrder.indexOf(b.topic_name);
      });

      setTopics(prev => ({ ...prev, [slug]: sortedTopics }));
    } catch (err) {
      console.error("Error fetching topics:", err);
    }
  };

  useEffect(() => {
    const validSubjects = ['physics', 'chemistry', 'biology'];
    if (!validSubjects.includes(subject.toLowerCase())) {
      navigate('/404');
    } else {
      getChapters();
    }
  }, [subject]);

  useEffect(() => {
    chapters.forEach(item => fetchTopics(item.slug));
  }, [chapters]);

  return (
    <div className="practice-page">
      <div className="practice-container">
        <h1>
          {subject.charAt(0).toUpperCase() + subject.slice(1)} Practice {subjectEmojis[subject.toLowerCase()] || "📚"}
        </h1>
        <p className="practice-description">
          This section provides a range of practice questions, from easy to exam-level and occasionally beyond, to test your understanding of the topic.
        </p>
        <p className="side-note-practice">
          There isn’t always just one way to solve a problem.
        </p>

        <div 
          className="contribute-box"
          onClick={() => navigate("/submit-question")}
        >
          <span className="pencil-icon-text">
            <PencilLine className="pencil-icon" />
            Got a problem you want to share with others?
          </span>
        </div>

        <hr className="dividerMenu" />

        {loading ? (
          <div className="loader-wrapper">
            <div className="loader2"></div>
          </div>
        ) : (
          <div className="chapter-section">
            {chapters.map(item => (
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
                                aria-label={`Go to ${topic.topic_name} practice`}
                                onClick={() => navigate(`/practice/${subject}/${item.slug}/${topic.slug}/`)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    navigate(`/practice/${subject}/${item.slug}/${topic.slug}/`);
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

        {!loading && chapters.length === 0 && (
          <div className="coming-soon">
            <span className="flipping-hourglass">⏳</span> {subject.charAt(0).toUpperCase() + subject.slice(1)} Practice Questions Coming Soon!
          </div>
        )}
      </div>
    </div>
  )
}

export default Practice;
