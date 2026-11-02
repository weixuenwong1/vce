import { React, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResourceGuideFooter from '../components/ResourceGuideFooter';
import ResourceCatalogueLoading from '../components/ResourceCatalogueLoading';
import ResourceCatalogueError from '../components/ResourceCatalogueError';
import SubjectHubGuide from '../components/SubjectHubGuide';
import { getResourceCatalogue } from '../utils/resourceCatalogue';
import '../styles/PracticeSAC.scss';

const PracticeSAC = () => {
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

    const handleChapterClick = (chapterSlug) => {
        navigate(`/practice-sac/${subject}/${chapterSlug}/`);
    };

    useEffect(() => {
        const validSubjects = ['physics', 'chemistry', 'biology'];
        if (!validSubjects.includes(subject.toLowerCase())) {
            navigate('/404');
        } else {
            void getChapters();
        }
    }, [getChapters, navigate, subject]);

    return (
        <div className={`practice-page-sac subject-theme subject-theme--${subject.toLowerCase()}`}>
          <div className="practice-container-sac">
              <h1>
                  <span>Free VCE {subject.charAt(0).toUpperCase() + subject.slice(1)} Units 3/4</span>
                  <span>Practice SACs {subjectEmojis[subject.toLowerCase()] || "📚"}</span>
              </h1>
              <SubjectHubGuide subject={subject.toLowerCase()} section="practice-sac" />

              <hr className="dividerMenu"/>

              {loading ? (
                <ResourceCatalogueLoading label={`Loading ${subject} practice SACs`} />
            ) : (
                <div className="chapter-section">
                    {chapters.map(item => (
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

        {!loading && loadError && (
          <ResourceCatalogueError onRetry={() => getChapters({ force: true })} />
        )}
        {!loading && !loadError && chapters.length === 0 && (
                <div className="coming-soon">
                    <span className="flipping-hourglass">⏳</span> {subject.charAt(0).toUpperCase() + subject.slice(1)} Practice SAC Coming Soon!
                </div>  
            )}
            {!loading && !loadError && <ResourceGuideFooter />}
          </div>
      </div>
    );
};

export default PracticeSAC;
