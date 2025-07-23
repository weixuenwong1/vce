import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.scss'; // Assuming you have SCSS styles for the card

const Card = ({ image, title, description, link }) => {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(link)}>
      <img src={image} alt={title} className="card-img" />
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Card;
