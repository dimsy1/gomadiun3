import React, { useState } from 'react';

const Modal = ({ show, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!show) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content-backdrop">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="slider">
          <button className="slider-button left" onClick={handlePrev}>
            &#10094;
          </button>
          <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} className="slider-image" />
          <button className="slider-button right" onClick={handleNext}>
            &#10095;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
