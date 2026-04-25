import AxiosInstance from '../utils/AxiosInstance'
import { React, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { chapterOrders, topicOrders } from "../data/ListOrders";
import '../styles/MenuDropdown.scss'
import { PencilLine } from 'lucide-react';

const Practice = () => {
  const { subject } = useParams();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
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
        setChapters([]);
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

        setChapters(sortedChapters);
        setTopics(topicsObject);

      } catch (err) {
        console.error("Failed to load practice page data:", err);
        setChapters([]);
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
          {subject.charAt(0).toUpperCase() + subject.slice(1)} Practice {subjectEmojis[subject.toLowerCase()] || "📚"}
        </h1>
        <p className="practice-description">
          This section provides a range of practice questions, from easy to exam-level and occasionally beyond, to test your understanding of the topic.
        </p>
        <p className="side-note-practice">
          There isn’t always just one way to solve a problem.
        </p>
        <p className="contact-question-practice">
          <strong>Do let us know if you had any questions! We'll do our best to help.</strong>
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
          <div className="loader-overlay">
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
