import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import AxiosInstance from '../utils/AxiosInstance';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import SQTextareaController from '../forms/SQTextareaController';
import SQSelectController from '../forms/SQSelectController';
import SQCheckboxController from '../forms/SQCheckboxController';
import '../styles/SubmitQuestion.scss';

export default function SubmitQuestion() {
  const schema = yup.object({
    subject: yup.string().required('Subject is required'),
    chapter: yup.string().required('Chapter is required'),
    topic: yup.string().required('Topic is required'),
    question_text: yup
      .string()
      .required('Question text is required')
      .min(20, 'Question must be at least 20 characters'),
    originality_ok: yup
      .boolean()
      .oneOf([true], 'You must confirm originality'),
  });

  const { control, handleSubmit, watch, setValue, reset, setError } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      subject: '',
      chapter: '',
      topic: '',
      question_text: '',
      originality_ok: false,
    },
    shouldFocusError: true,
  });

  const subject = watch('subject');
  const chapter = watch('chapter');
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [successOpen, setSuccessOpen] = useState(false);

  const topRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    AxiosInstance.get('/api/subjects/').then(r => setSubjects(r.data));
  }, []);

  useEffect(() => {
    if (!subject) {
      setChapters([]);
      setValue('chapter', '');
      setValue('topic', '');
      return;
    }
    AxiosInstance.get(`/api/subjects/${subject}/chapters/`).then(r => setChapters(r.data));
  }, [subject, setValue]);

  useEffect(() => {
    if (!chapter) {
      setTopics([]);
      setValue('topic', '');
      return;
    }
    AxiosInstance.get(`/api/chapters/${chapter}/topics/`).then(r => setTopics(r.data));
  }, [chapter, setValue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    let particles = [];

    const generateParticles = () => {
      particles = [];
      const count = Math.floor((canvas.clientWidth * canvas.clientHeight) / 56000);
      for (let i = 0; i < count; i++) {
        const size = 8 + Math.random() * 4; 
        const x = Math.random() * canvas.clientWidth;
        const y = Math.random() * canvas.clientHeight;
        const palette = ['#f59505ff','#FF7043','#e43a3a','#4FC3F7'];
        const color = palette[(Math.random() * palette.length) | 0];

        particles.push({ x, y, size, color });
      }
    };

    const draw = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    };

    generateParticles();
    draw();

    const onResize = () => {
      generateParticles(); 
      draw();
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onSubmit = async (data) => {
    const payload = {
      subject: data.subject,
      chapter: data.chapter,
      topic: data.topic,
      question_text: data.question_text,
    };

    try {
      await AxiosInstance.post('/api/inbox/submissions/', payload);
      reset();
      setChapters([]);
      setTopics([]);

      setSuccessOpen(true);

      if (topRef.current?.scrollIntoView) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
        console.error(err);
        const detail = err?.response?.data;
        if (detail && typeof detail === 'object') {
          let attached = false;
          Object.entries(detail).forEach(([key, val]) => {
            if (['subject','chapter','topic','question_text','originality_ok'].includes(key)) {
              setError(key, { type: 'server', message: Array.isArray(val) ? val[0] : String(val) });
              attached = true;
            }
          });
          if (attached) return;
        }

        toast.error('Failed to submit. Please try again later.');
      }
  };

  return (
    <div className="SQPage" ref={topRef}>
      <canvas ref={canvasRef} className="bgSquaresCanvas" />

      <div className="SQContainer">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box className="SQFormBox">
            <h3>Submit a Problem</h3>  
            <div className="sqSideNotes">
              <h4 className="sqSideNotes__title">Quick tips for writing questions</h4>
              <ul className="sqSideNotes__list">
                <li>
                  For subscripts, you can either type them using an underscore (e.g. <code>C_4H_10</code>) 
                  or insert real subscript characters (e.g. C<sub>4</sub>H<sub>10</sub>).
                </li>
                <li>
                  For exponents, you can either type them using a caret (e.g. <code>6.63 * 10^-34</code>) 
                  or insert real superscript characters (e.g. 6.63 × 10<sup>-34</sup>).
                </li>
                <li>If images are required describe what the image should contain with <code>[]</code>: <code>[A 2 kg masss sliding down a 20° incline.]</code></li>
                <li>Keep it original—submit questions you wrote yourself.</li>
                <li>We’ll provide full solutions and may contact you to clarify details.</li>
              </ul>
            </div>

            <SQSelectController
              name="subject"
              control={control}
              label="Subject"
              options={subjects.map(s => ({ value: s.id, label: s.name }))}
            />

            <SQSelectController
              name="chapter"
              control={control}
              label="Chapter"
              disabled={!subject}
              options={chapters.map(c => ({ value: c.slug, label: c.chapter_name }))}
            />

            <SQSelectController
              name="topic"
              control={control}
              label="Topic"
              disabled={!chapter}
              options={topics.map(t => ({ value: t.topic_uid, label: t.topic_name }))}
            />

            <SQTextareaController
              name="question_text"
              control={control}
              label={`Example:
                      An electron is initially positioned at the the negatively charged plate 450 mm away from the opposite plate, as shown in Figure A. The plates are connected to a DC supply and the electric field has a strength of 8.0 × 10^3 N C⁻¹.

                      [Parallel Plates with the negative plate on the left and positive plate on the right 600 mm apart with E = 8.0 × 10^3 N C⁻¹ an electron starting from the negative plate.]

                      a) Determine the size of the potential difference across the parallel plates. Show your working.
                      (2 marks)

                      b) Determine the magnitude and direction of the acceleration of the electron.                
                      (2 marks)`}
              rows={16}
            />

            <div className="sqDivider" />

            <SQCheckboxController
              name="originality_ok"
              control={control}
              label="I confirm this question is original and not copied from other materials."
            />

            <button type="submit" className="submit-btn">Send</button>
          </Box>
        </form>
      </div>

      <div className={`SQSuccess ${successOpen ? 'show' : ''}`}>
        <div className="SQSuccess-card">
          <div className="SQSuccess-icon" aria-hidden />
          <h2 className="SQSuccess-title">PROBLEM SENT!</h2>
          <p className="SQSuccess-text">
            Thanks for your submission. Your question has entered the queue.
          </p>
          <button
            type="button"
            className="SQSuccess-btn"
            onClick={() => setSuccessOpen(false)}
          >
            New Question
          </button>
        </div>
      </div>
    </div>
  );
}