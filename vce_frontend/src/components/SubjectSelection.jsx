import React from "react";
import Card from "./Card";

const SubjectSection = ({ emoji, title, cards }) => (
  <div className="card-section">
    <h3 className="subject-heading">{emoji} {title}</h3>
    <div className="card-container">
      {cards.map((card, i) => (
        <Card key={i} {...card} />
      ))}
    </div>
  </div>
);

export default SubjectSection;
