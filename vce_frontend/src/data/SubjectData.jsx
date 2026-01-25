import subjectImages from "./SubjectImages";

const subjectsData = [
  { 
    emoji: "🚀",
    title: "Physics 3/4",
    cards: [
      {
        image: subjectImages.physics.summary,
        title: "Physics Summaries",
        description:
          "Concise topic summaries and step-by-step explanations of exam-style questions.",
        link: "/summaries/physics",
      },
      {
        image: subjectImages.physics.practice,
        title: "Physics Practice",
        description:
          "Practice beginner-friendly questions to exam-style problems with solutions.",
        link: "/practice/physics",
      },
      {
        image: subjectImages.physics.sac,
        title: "Physics SACs",
        description:
          "Practice SACs to test your understanding under exam and SAC-like conditions.",
        link: "/practice-sac/physics",
      },
    ],
  },
  {
    emoji: "🧪 ",
    title: "Chemistry 3/4",
    cards: [
      {
        image: subjectImages.chemistry.summary,
        title: "Chemistry Summaries",
        description:
          "Concise topic summaries and step-by-step explanations of exam-style questions.",
        link: "/summaries/chemistry",
      },
      {
        image: subjectImages.chemistry.practice,
        title: "Chemistry Practice",
        description:
          "Practice beginner-friendly questions to exam-style problems with solutions.",
        link: "/practice/chemistry",
      },
      {
        image: subjectImages.chemistry.sac,
        title: "Chemistry SACs",
        description:
          "Practice SACs to test your understanding under exam and SAC-like conditions.",
        link: "/practice-sac/chemistry",
      },
    ],
  },
  {
    emoji: "🧬 ",
    title: "Biology 3/4",
    cards: [
      {
        image: subjectImages.biology.summary,
        title: "Biology Summaries",
        description:
          "Concise topic summaries and step-by-step explanations of exam-style questions.",
        link: "/summaries/biology",
      },
      {
        image: subjectImages.biology.practice,
        title: "Biology Practice",
        description:
          "Practice beginner-friendly questions to exam-style problems with solutions.",
        link: "/practice/biology",
      },
      {
        image: subjectImages.biology.sac,
        title: "Biology SACs",
        description:
          "Practice SACs to test your understanding under exam and SAC-like conditions.",
        link: "/practice-sac/biology",
      },
    ],
  }
];

export default subjectsData;
