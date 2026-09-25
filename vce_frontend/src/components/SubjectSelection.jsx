import React from "react";
import Card from "./Card";

const SubjectSection = ({ subject, emoji, title, cards }) => (
  <div className={`card-section card-section--${subject}`}>
    <h3 className="subject-heading">{emoji} {title}</h3>
    <div className="card-container">
      {cards.map((card, i) => (
        <Card key={i} {...card} />
      ))}
    </div>
  </div>
);

export default SubjectSection;
