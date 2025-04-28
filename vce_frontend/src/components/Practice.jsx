import AxiosInstance from "./AxiosInstance"
import {React, useEffect, useState} from 'react'
import {Box, Button, Collapse, Typography} from '@mui/material'
import { useNavigate } from 'react-router-dom';

const Practice = () => {
    const [chapter, setChapter] = useState()
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState({})
    const [topics, setTopics] = useState({})
    const navigate = useNavigate();

    const GetChapter = () => {
        AxiosInstance.get(`api/physics/chapters`).then((res) => {
            setChapter(res.data)
            setLoading(false)
        })
    }

    const fetchTopics = async (slug) => {
        if (topics[slug]) return; 
        try {
          const res = await AxiosInstance.get(`api/physics/chapters/${slug}/topics/`);
          const sortedTopics = res.data.sort((a, b) => {
            if (a.topic_name === 'Newton\'s Laws of Motion') return -1;
            if (b.topic_name === 'Newton\'s Laws of Motion') return 1;
            if (a.topic_name === 'Graphical Analysis of Motion') return -1;
            if (b.topic_name === 'Graphical Analysis of Motion') return 1;
            return 0; 
            });
          setTopics((prev) => ({ ...prev, [slug]: sortedTopics }));
        } catch (err) {
          console.error("Failed to load topics for", slug, err);
        }
      };

    const toggleExpand = (slug) => {
        setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
        if (!topics[slug]) {
          fetchTopics(slug)
        }
      };
    
    const handleTopicClick = (chapterSlug, topicSlug) => {
        navigate(`/practice/physics/${chapterSlug}/${topicSlug}/`);
    };

    useEffect(() => {
        GetChapter();
    }, [])

    return(
        <div>
            <Typography variant="h4" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                Practice Problems
            </Typography>
            { loading ?  <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '80vh'
                        }}>
                            <div className="loader"></div>
                        </div> :
            <div>
                {chapter
                  .slice()
                  .sort((a, b) => a.chapter_uid - b.chapter_uid)
                  .map((item) => (
                    <Box key={item.chapter_uid} sx={{p:2, m:2, boxShadow: 3}}>
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
            } 
        </div>
    )
}

export default Practice