import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.scss';

const Card = ({ image, title, description, link }) => {
  const toVariant = (url, w, ext = 'webp') => url.replace(/\.png$/i, `-${w}.${ext}`);

  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      navigate(link);
    }
  };

  return (
    <div 
      className="card"
      tabIndex="0"
      role="link"
      aria-label={`Go to ${title}`}
      onClick={() => navigate(link)}
      onKeyDown={handleKeyDown}
    >
      <picture>
      <source
        type="image/webp"
        srcSet={[
          `${toVariant(image, 320)} 320w`,
          `${toVariant(image, 416)} 416w`,
          `${toVariant(image, 640)} 640w`,
        ].join(', ')}
      />
      <img
        src={image}                
        alt={title}
        className="card-img"
        loading="lazy"
        decoding="async"
        width="416"
        height="234"           
        sizes="(max-width: 900px) 90vw, 416px"
      />
    </picture>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Card;
