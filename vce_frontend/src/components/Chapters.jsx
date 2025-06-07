import AxiosInstance from "./AxiosInstance";
import { React, useEffect, useState } from 'react';
import { Box, Button, Collapse, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { chapterOrders, topicOrders } from "../constants/ListOrders";

const Chapters = () => {
  const { subject } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [topics, setTopics] = useState({});

  const GetChapter = () => {
    AxiosInstance.get(`api/chapters`).then((res) => {
      const filtered = res.data.filter(item =>
        item.subject && item.subject.toLowerCase() === subject.toLowerCase()
      );

      const sorted = filtered.sort((a, b) =>
        chapterOrders.indexOf(a.chapter_name) - chapterOrders.indexOf(b.chapter_name)
      );

      setChapter(sorted);
      setLoading(false);
    });
  };

  const fetchTopics = async (slug) => {
    if (topics[slug]) return;

    try {
      const res = await AxiosInstance.get(`api/chapters/${slug}/topics/`);
      const desiredOrder = topicOrders[subject?.toLowerCase()]?.[slug] || [];

      const sortedTopics = res.data.sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.topic_name);
        const indexB = desiredOrder.indexOf(b.topic_name);
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
      });

      setTopics((prev) => ({ ...prev, [slug]: sortedTopics }));
    } catch (err) {
      console.error("Failed to load topics for", slug, err);
    }
  };

  const toggleExpand = (slug) => {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
    if (!topics[slug]) {
      fetchTopics(slug);
    }
  };

  const handleTopicClick = (chapterSlug, topicSlug) => {
    navigate(`/summaries/${subject}/${chapterSlug}/${topicSlug}`);
  };

  useEffect(() => {
    const validSubjects = ['physics', 'chemistry', 'biology'];
    if (!validSubjects.includes(subject?.toLowerCase())) {
      navigate('/');
    } else {
      GetChapter();
    }
  }, [subject]);

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
        {subject?.charAt(0).toUpperCase() + subject?.slice(1)} Chapters
      </Typography>
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}>
          <div className="loader"></div>
        </div>
      ) : (
        <div>
          {chapter
            .slice()
            .sort((a, b) => chapterOrders.indexOf(a.chapter_name) - chapterOrders.indexOf(b.chapter_name))
            .map((item) => (
              <Box key={item.chapter_uid} sx={{ p: 2, m: 2, boxShadow: 3 }}>
                <Typography variant="h6">{item.chapter_name}</Typography>
                <Typography variant="body2">{item.chapter_description}</Typography>
                <Button
                  onClick={() => toggleExpand(item.slug)}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  {expanded[item.slug] ? "Hide Topics" : "Show Topics"}
                </Button>
                <Collapse in={expanded[item.slug]}>
                  <Box sx={{ mt: 1, pl: 2 }}>
                    {topics[item.slug] ? (
                      topics[item.slug].map((topic, i) => (
                        <Typography
                          key={i}
                          variant="body2"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleTopicClick(item.slug, topic.slug)}
                        >
                          • {topic.topic_name}
                        </Typography>
                      ))
                    ) : (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100px'
                      }}>
                        <div className="loader"></div>
                      </div>
                    )}
                  </Box>
                </Collapse>
              </Box>
            ))}
        </div>
      )}
    </div>
  );
};

export default Chapters;
