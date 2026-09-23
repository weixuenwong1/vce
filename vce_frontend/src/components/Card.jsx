import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.scss';

const Card = ({ image, title, description, link }) => {
  const toVariant = (url, w, ext = 'webp') => url.replace(/\.png$/i, `-${w}.${ext}`);

  return (
    <Link
      className="card"
      to={link}
      style={{ color: 'inherit', textDecoration: 'none' }}
      aria-label={`Go to ${title}`}
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
    </Link>
  );
};

export default Card;
