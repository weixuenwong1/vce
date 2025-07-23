import { useEffect, useState } from 'react';
import AxiosInstance from './AxiosInstance';
import { useParams } from 'react-router-dom';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const SAC = () => {
  const { subject, chapter_slug } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chapterName, setChapterName] = useState('');
  const [showSolutions, setShowSolutions] = useState(false);

  const mathJaxConfig = {
    chtml: {
      displayAlign: 'left',
    },
  };

  useEffect(() => {
    const fetchSACQuestions = async () => {
      try {
        const res = await AxiosInstance.get(
          `api/sac/${subject}/${chapter_slug}/?count=11`
        );
        setTimeout(() => {
          setQuestions(res.data);
          setLoading(false);
        }, 4000); 
      } catch (err) {
        console.error('Failed to load SAC questions:', err);
        setLoading(false);
      }
    };

    const fetchChapterName = async () => {
      try {
        const res = await AxiosInstance.get(`api/chapters/${chapter_slug}/`);
        setChapterName(res.data.chapter_name);
      } catch (err) {
        console.error('Failed to fetch chapter name:', err);
      }
    };

    fetchSACQuestions();
    fetchChapterName();
  }, [subject, chapter_slug]);

  const extractMarks = (text) => {
    const match = text.match(/([\s\S]*?)\s*\n?\s*(\(\d+\s*marks?\))\s*$/i);
    if (match) {
      return { body: match[1].trim(), marks: match[2].trim() };
    }
    return { body: text.trim(), marks: null };
  };

  const extractAllMarksFromText = (text) => {
    const matches = text.match(/\((\d+)\s*marks?\)/gi);
    if (!matches) return 0;

    return matches
      .map(m => parseInt(m.match(/\d+/)?.[0] || '0'))
      .reduce((a, b) => a + b, 0);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh'
      }}>
        <div className="loader3"></div>
      </div>
    );
  }

  let totalMarks = 0;

  questions.forEach(question => {
    totalMarks += extractAllMarksFromText(question.question_text);
    question.orders.forEach(order => {
      if (order.content_type === 'TEXT' && order.text_content) {
        totalMarks += extractAllMarksFromText(order.text_content);
      }
    });
  });


  return (
    <div style={{display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          textAlign: 'left',
          fontFamily: 'Poppins, sans-serif',
          margin: 0
        }}>
          Practice SAC – {chapterName}
        </h1>

        <button onClick={() => setShowSolutions(!showSolutions)}>
          {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
        </button>
      </div>

      <MathJaxContext config={mathJaxConfig}>
        {questions.map((question, qIndex) => (
          <div
            key={question.question_uid || qIndex}
            style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              marginBottom: '2.5rem',
              paddingBottom: '3rem',
            }}
          >
            <h3 style={{ fontFamily: 'Poppins, sans-serif', whiteSpace: 'pre-line' }}>
              Question {qIndex + 1}.
            </h3>

            <h3 style={{ fontFamily: 'Poppins, sans-serif', whiteSpace: 'pre-line', marginBottom: '3rem' }}>
              {question.question_text}
            </h3>

            {/* Render subproblems (orders) if they exist */}
            {question.orders?.length > 0 &&
              question.orders.map((order, i) => (
                <div key={order.order_uid || i} style={{ marginBottom: '3.5rem' }}>
                  {order.content_type === "TEXT" && order.text_content && (() => {
                    const { body, marks } = extractMarks(order.text_content);
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 500,
                          fontSize: '1.1rem',
                          whiteSpace: 'pre-line',
                          margin: 0,
                          flex: 1
                        }}>
                          {body}
                        </p>
                        {marks && (
                          <div style={{
                            textAlign: 'right',
                            fontWeight: 500,
                            fontSize: '1.1rem',
                            marginLeft: '1rem',
                            whiteSpace: 'nowrap'
                          }}>
                            {marks}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {order.content_type === "IMAGE" && order.image_content && (
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                      <img src={order.image_content} alt="Question Image" style={{ maxWidth: '90%' }} />
                    </div>
                  )}

                  {showSolutions && order.solution && (
                    <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', marginTop: '1rem' }}>
                      {order.solution.solution_image && (
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                          <img src={order.solution.solution_image} alt="Solution Image" style={{ maxWidth: '90%' }} />
                        </div>
                      )}
                      {order.solution.solution_text && (
                        <div className="scroll-math" style={{ marginTop: '1rem' }}>
                          <MathJax>
                            {order.solution.solution_text
                              .replace(/\\\\\(/g, "\\[")
                              .replace(/\\\\\)/g, "\\]")
                              .replace(/\\\\/g, "\\")}
                          </MathJax>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

            {showSolutions && question.general_solution && (
              <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', marginTop: '2rem' }}>
                {question.general_solution.solution_text && (
                  <div className="scroll-math" style={{ marginTop: '1rem' }}>
                    <MathJax>
                      {question.general_solution.solution_text
                        .replace(/\\\\\(/g, "\\[")
                        .replace(/\\\\\)/g, "\\]")
                        .replace(/\\\\/g, "\\")}
                    </MathJax>
                  </div>
                )}
                {question.general_solution.solution_image && (
                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={question.general_solution.solution_image}
                      alt="Solution Image"
                      style={{ maxWidth: '80%' }}
                    />
                  </div>
                )}
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '2px solid #888', marginTop: '5rem', marginBottom: '0rem' }} />
          </div>
        ))}
      </MathJaxContext>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '3rem',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <h2 style={{ fontWeight: 600 }}>
           / {totalMarks} 
        </h2>
      </div>
      </div>
    </div>
  );
};

export default SAC;
