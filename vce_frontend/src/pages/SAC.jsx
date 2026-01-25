import { useEffect, useState } from "react";
import AxiosInstance from '../utils/AxiosInstance'
import { useParams, useNavigate } from 'react-router-dom';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { topicOrders } from '../data/ListOrders';
import '../styles/Loader.scss';
import '../styles/SAC.scss';

const SAC = () => {
  const { subject, chapter_slug } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chapterName, setChapterName] = useState('');
  const [showSolutions, setShowSolutions] = useState(false);
  const navigate = useNavigate()

  const mathJaxConfig = {
    chtml: {
      displayAlign: 'left',
      scale: 50,
    },
  };

  const arrangeMcqFirst = (arr, subject) => {
    if (!Array.isArray(arr)) return [];
    const subj = (subject || "").toLowerCase();
    if (subj !== "chemistry" && subj !== "biology") return arr;

    const mcq = [];
    const sa  = [];
    for (const q of arr) {
      (q?.multiple_choice === true ? mcq : sa).push(q);
    }
    return [...mcq, ...sa]; 
  };

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    if (!subject || !chapter_slug) {
      navigate('/404');
      return;
    }

    const chapterMap = topicOrders?.[subject];
    if (!chapterMap || !chapterMap[chapter_slug]) {
      navigate('/404');
      return;
    }

    setLoading(true);

    const MIN_SPINNER_MS = 3000;
    const minDelay = new Promise(res => setTimeout(res, MIN_SPINNER_MS));

    const fetchWithRetry = async (url, { signal, tries = 2, delayMs = 600 } = {}) => {
      let lastErr;
      for (let attempt = 1; attempt <= tries; attempt++) {
        try {
          return await AxiosInstance.get(url, { signal, timeout: 10000 });
        } catch (err) {
          lastErr = err;
          const status = err?.response?.status;
          const retriable =
            err.code === "ECONNABORTED" || 
            err?.message === "canceled" || 
            !status || status >= 500 || status === 408;
          if (!retriable || attempt === tries) break;
          await new Promise(r => setTimeout(r, delayMs * attempt)); 
        }
      }
      throw lastErr;
    };

    const sacUrl = `api/sac/${subject}/${chapter_slug}/?count=10`;
    const chapterUrl = `api/chapters/${chapter_slug}/`;

    const run = async () => {
      try {
        const [sacRes, chapterRes] = await Promise.allSettled([
          fetchWithRetry(sacUrl, { signal: ctrl.signal }),
          AxiosInstance.get(chapterUrl, { signal: ctrl.signal, timeout: 10000 }),
        ]);

        await minDelay;
        if (cancelled) return;

        if (sacRes.status === "fulfilled") {
          const data = sacRes.value?.data || [];
          setQuestions(arrangeMcqFirst(data, subject));
        } else {
          const status = sacRes.reason?.response?.status;
          if (status === 404) {
            navigate("/404");
            return;
          } else {
            navigate("/500");
            return;
          }
        }

        if (chapterRes.status === "fulfilled") {
          setChapterName(chapterRes.value.data?.chapter_name ?? "");
        } 
        } catch (err) {
          if (cancelled) return;
          const status = err?.response?.status;
          if (status === 404) {
            navigate("/404");
          } else {
            navigate("/500");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
    };

    run();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
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
      <div className="loader-overlay">
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

  const subj = (subject || "").toLowerCase();

  if (subj === "chemistry" || subj === "biology") {
    const MCQ_MARKS = 1; 
    const isMcq = (q) => q?.multiple_choice === true;
    const mcqCount = questions.reduce((n, q) => n + (isMcq(q) ? 1 : 0), 0);
    totalMarks += mcqCount * MCQ_MARKS;
  }


  return (
    <div className="practice-sac-container">
      <div className="inner-container">
      <div className="header-row">
        <h1>Practice SAC – {chapterName}</h1>
      </div>

      <div className="button-row">
        <button className="button-sac" onClick={() => setShowSolutions(!showSolutions)}>
          {showSolutions ? '🙈 Hide Solutions' : '🧠 Show Solutions'}
        </button>
      </div>

      <MathJaxContext config={mathJaxConfig}>
        {questions.map((question, qIndex) => (
          <div
            key={question.question_uid || qIndex}
            className="question-block"
          >
            <h3>Question {qIndex + 1}.</h3>

            <h4>{question.question_text}</h4>

            {question.orders?.length > 0 &&
              question.orders.map((order, i) => (
                <div key={order.order_uid || i} style={{ marginBottom: '3.5rem' }}>
                  {order.content_type === "TEXT" && order.text_content && (() => {
                    const { body, marks } = extractMarks(order.text_content);
                    return (
                      <div className="text-order-sac">
                        <p>
                          {body}
                        </p>
                        {marks && (
                          <div className="marks">
                            {marks}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {order.content_type === "IMAGE" && order.image_content && (
                    <div className="image-order">
                      <img src={order.image_content} alt="Question Image"/>
                    </div>
                  )}

                  {showSolutions && order.solution && (
                    <div className="solution-container">
                      {order.solution.solution_image && (
                        <div className="solution-image">
                          <img src={order.solution.solution_image} alt="Solution Image"/>
                        </div>
                      )}
                      {order.solution.solution_text && (
                        <div className="scroll-math">
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
              <div className="general-solution">
                {question.general_solution.solution_text && (
                  <div className="scroll-math">
                    <MathJax>
                      {question.general_solution.solution_text
                        .replace(/\\\\\(/g, "\\[")
                        .replace(/\\\\\)/g, "\\]")
                        .replace(/\\\\/g, "\\")}
                    </MathJax>
                  </div>
                )}
                {question.general_solution.solution_image && (
                  <div className="solution-image">
                    <img
                      src={question.general_solution.solution_image}
                      alt="Solution Image"
                    />
                  </div>
                )}
              </div>
            )}

            <hr className="divider3" />
          </div>
        ))}
      </MathJaxContext>
      <div className="total-marks">
        <h2>
           / {totalMarks} 
        </h2>
      </div>
      </div>
    </div>
  );
};

export default SAC;
