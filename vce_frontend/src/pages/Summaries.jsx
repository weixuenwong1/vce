import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from '../utils/AxiosInstance'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { topicOrders } from '../data/ListOrders';
import 'katex/dist/katex.min.css';
import '../styles/Summaries.scss';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import '../styles/Loader.scss';

const Summaries = () => {
  const { subject, chapter_slug, topic_slug } = useParams();
  const navigate = useNavigate()
  const [content, setContent] = useState('');
  const [topicName, setTopicName] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [prevTopic, setPrevTopic] = useState(null);
  const [nextTopic, setNextTopic] = useState(null);

  const slugify = (str) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  useEffect(() => {
    const topicList = topicOrders[subject]?.[chapter_slug];
    if (!topicList) return;

    const currentIndex = topicList.indexOf(topicName);
    if (currentIndex !== -1) {
      setPrevTopic(currentIndex > 0 ? topicList[currentIndex - 1] : null);
      setNextTopic(currentIndex < topicList.length - 1 ? topicList[currentIndex + 1] : null);
    }
  }, [subject, chapter_slug, topicName]);

  useEffect(() => {
    setDataLoaded(false); 
    
    AxiosInstance.get(`api/summary/${subject}/${chapter_slug}/${topic_slug}/`)
      .then(res => {
        setContent(res.data.content || '');
        setTopicName(res.data.topic_name || '');
      })
      .catch(() => {
        setContent('Failed to load content.');
      })
      .finally(() => {
        setDataLoaded(true);
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [subject, chapter_slug, topic_slug]);


  const renderers = {
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: '5px solid #555',
        paddingLeft: '1rem',
        margin: '1.5rem 0',
        background: '#f0f0f0',
      }}>
        {children}
      </blockquote>
    ),
    p: ({ children }) => (
      <p style={{ marginBottom: '1rem' }}>{children}</p>
    ),
    img: ({ ...props }) => (
      <img {...props} style={{ display: 'block', margin: '1.5rem auto', maxWidth: '100%' }} />
    ),
    hr: () => (
      <hr style={{ borderTop: '3px solid #666', margin: '2rem 0' }} />
    )
  };


  if (!dataLoaded) {
    return (
      <div className="loader-wrapper">
        <div className="loader2"></div>
      </div>
    );
  }


  return (
    <div className="summaries-page">
      <div className="summaries-page-container">
        <ReactMarkdown
          children={content}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={renderers}
        />
        <div className="summary-navigation">
          {prevTopic && (
            <span
              className="summary-link left"
              onClick={() => navigate(`/summaries/${subject}/${chapter_slug}/${slugify(prevTopic)}`)}
              title={prevTopic} 
            >
                <ChevronLeft />
                <span className="link-label-full">{prevTopic}</span>
                <span className="link-label-short">Previous</span>
              </span>
          )}
          
          <span
            className="summary-link practice-link"
            onClick={() => navigate(`/practice/${subject}/${chapter_slug}/${topic_slug}`)}
          >
            🎯 Practice Questions
          </span>

          {nextTopic && (
            <span
              className="summary-link right"
              onClick={() => navigate(`/summaries/${subject}/${chapter_slug}/${slugify(nextTopic)}`)}
              title={nextTopic}
            >
                <span className="link-label-short">Next</span>
                <span className="link-label-full">{nextTopic}</span>
                <ChevronRight />
              </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summaries;