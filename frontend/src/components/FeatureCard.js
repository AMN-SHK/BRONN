// FeatureCard.js
import React from 'react';

function FeatureCard({ title, content, imageUrl, ctaText, onCtaClick }) {
  return (
    <div className="feature-card">
      <img src={imageUrl} alt={title} className="feature-image" />
      <h4>{title}</h4>
      <p>{content}</p>
      <button className="cta-button" onClick={() => onCtaClick(title)}>{ctaText}</button>
    </div>
  );
}

export default FeatureCard;