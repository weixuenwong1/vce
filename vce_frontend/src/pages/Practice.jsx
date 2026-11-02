import ResourceGuideFooter from '../components/ResourceGuideFooter';
import ResourceCatalogueLoading from '../components/ResourceCatalogueLoading';
import ResourceCatalogueError from '../components/ResourceCatalogueError';
import SubjectHubGuide from '../components/SubjectHubGuide';
import { React, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getResourceCatalogue } from '../utils/resourceCatalogue';
import '../styles/MenuDropdown.scss'

const Practice = () => {
  const { subject } = useParams(); 
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();

  const subjectEmojis = {
    physics: "🚀",
    chemistry: "🧪",
    biology: "🧬"
  };

  const getChapters = useCallback(async ({ force = false } = {}) => {
    setLoading(true);
    setLoadError(false);
    try {
      setChapters(await getResourceCatalogue(subject.toLowerCase(), { force }));
    } catch (err) {
      setLoadError(true);
      console.error("Error fetching chapters:", err);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    const validSubjects = ['physics', 'chemistry', 'biology'];
    if (!validSubjects.includes(subject.toLowerCase())) {
      navigate('/404');
    } else {
      void getChapters();
    }
  }, [getChapters, navigate, subject]);

  return (
    <div className={`practice-page subject-theme subject-theme--${subject.toLowerCase()}`}>
      <div className="practice-container">
        <h1>
          <span>Free VCE {subject.charAt(0).toUpperCase() + subject.slice(1)} Units 3/4</span>
          <span>Practice Questions {subjectEmojis[subject.toLowerCase()] || "📚"}</span>
        </h1>
        <SubjectHubGuide subject={subject.toLowerCase()} section="practice" />

        <hr className="dividerMenu" />

        {loading ? (
          <ResourceCatalogueLoading label={`Loading ${subject} practice topics`} />
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
                        {item.topics.map((topic) => (
                          <tr key={topic.topic_uid}>
                            <td>
                              <Link
                                className="topic-row"
                                to={`/practice/${subject}/${item.slug}/${topic.slug}/`}
                                aria-label={`Go to ${topic.topic_name} practice`}
                              >
                                <span className="topic-text">{topic.topic_name}</span>
                              </Link>
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

        {!loading && loadError && (
          <ResourceCatalogueError onRetry={() => getChapters({ force: true })} />
        )}
        {!loading && !loadError && chapters.length === 0 && (
          <div className="coming-soon">
            <span className="flipping-hourglass">⏳</span> {subject.charAt(0).toUpperCase() + subject.slice(1)} Practice Questions Coming Soon!
          </div>
        )}
        {!loading && !loadError && <ResourceGuideFooter />}
      </div>
    </div>
  )
}

export default Practice;
