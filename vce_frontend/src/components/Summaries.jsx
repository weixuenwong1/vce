import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { topicOrders } from '../constants/ListOrders';
import 'katex/dist/katex.min.css';

const Summaries = () => {
  const { subject, chapter_slug, topic_slug } = useParams();
  const navigate = useNavigate()
  const [content, setContent] = useState('');
  const [topicName, setTopicName] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [minDelayPassed, setMinDelayPassed] = useState(false);
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
    setMinDelayPassed(false);
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

    const timer = setTimeout(() => {
      setMinDelayPassed(true);
    }, 2500);

    return () => clearTimeout(timer);
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


  if (!dataLoaded || !minDelayPassed) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh'
      }}>
        <div className="loader2"></div>
      </div>
    );
  }


  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={renderers}
      />
      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {prevTopic && (
          <button onClick={() => navigate(`/summaries/${subject}/${chapter_slug}/${slugify(prevTopic)}`)}>
            ← Previous: {prevTopic}
          </button>
        )}
        <button onClick={() => navigate(`/practice/${subject}/${chapter_slug}/${topic_slug}`)}>
          🎯 Practice Questions
        </button>
        {nextTopic && (
          <button onClick={() => navigate(`/summaries/${subject}/${chapter_slug}/${slugify(nextTopic)}`)}>
            Next: {nextTopic} →
          </button>
        )}
      </div>
    </div>
  );
};

export default Summaries;
