import React from 'react';
import './ProductBoxes.css';

const features = [
  "Location-Aware Services",
  "Proactive Notifications",
  "Topic Monitoring",
  "Form Submission"
];

const ProductBoxes = () => (
  <div className="product-boxes">
    <h3>Explore More Ways MyCityMentor Can Help</h3>
    <div className="boxes-grid">
      {features.map((f, i) => (
        <div className="box" key={i}>{f}</div>
      ))}
    </div>
  </div>
);

export default ProductBoxes;