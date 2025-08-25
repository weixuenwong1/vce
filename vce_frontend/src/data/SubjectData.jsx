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
          "Master concepts with curated summaries and step-by-step explanations of exam-style questions.",
        link: "/summaries/physics",
      },
      {
        image: subjectImages.physics.practice,
        title: "Physics Practice",
        description:
          "Practice from beginner-friendly questions to exam-style problems with full model solutions.",
        link: "/practice/physics",
      },
      {
        image: subjectImages.physics.sac,
        title: "Physics SACs",
        description:
          "Experience realistic SAC simulations to test your understanding under exam conditions.",
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
          "Master concepts with curated summaries and step-by-step explanations of exam-style questions.",
        link: "/summaries/chemistry",
      },
      {
        image: subjectImages.chemistry.practice,
        title: "Chemistry Practice",
        description:
          "Practice from beginner-friendly questions to exam-style problems with full model solutions.",
        link: "/practice/chemistry",
      },
      {
        image: subjectImages.chemistry.sac,
        title: "Chemistry SACs",
        description:
          "Experience realistic SAC simulations to test your understanding under exam conditions.",
        link: "/practice-sac/chemistry",
      },
    ],
  }
];

export default subjectsData;
