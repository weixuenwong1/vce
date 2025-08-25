import React from "react";

const FeatureCard = ({ Icon, title, description }) => (
  <div className="feature-card">
    <Icon size={20} />
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
);

export default FeatureCard;
