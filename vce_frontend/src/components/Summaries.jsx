import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Typography } from '@mui/material';

const Summaries = () => {
  const { subject, chapter_slug, topic_slug } = useParams();
  const [content, setContent] = useState('');
  const [topicName, setTopicName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AxiosInstance.get(`api/summary/${subject}/${chapter_slug}/${topic_slug}/`)
      .then(res => {
        setContent(res.data.content || '');
        setTopicName(res.data.topic_name || '');
      })
      .catch(() => {
        setContent('Failed to load content.');
      })
      .finally(() => setLoading(false));
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

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={renderers}
      />
    </div>
  );
};

export default Summaries;
