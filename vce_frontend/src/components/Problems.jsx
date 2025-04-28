import { useEffect, useState } from 'react';
import AxiosInstance from './AxiosInstance';
import { useParams } from 'react-router-dom';

const QuestionsForTopic = () => {
    const { chapter_slug, topic_slug } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await AxiosInstance.get(`api/physics/problems/${chapter_slug}/${topic_slug}/`);
                setQuestions(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load questions", err);
            }
        };

        fetchQuestions();
    }, [chapter_slug, topic_slug]);

    return (
        <div>
            <h1>Questions for Topic: {topic_slug}</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    {questions.map((question) => (
                        <div key={question.question_uid}>
                            <h2>{question.question_text}</h2>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuestionsForTopic;
