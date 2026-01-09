import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';

const PopUp = ({ images }) => {
  const [showMainPopup, setShowMainPopup] = useState(false);
  const [showMiniPopup, setShowMiniPopup] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Munculkan popup utama langsung saat website dibuka
  useEffect(() => {
    if (images && images.length > 0) {
      setShowMainPopup(true);   // langsung munculkan popup besar
      setShowMiniPopup(true);   // dan munculkan popup kecil
    }
  }, [images]);

  if (!images || images.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const current = images[currentIndex];

  return (
    <>
      {/* Popup kecil teks “klik icon dan lihat pengumuman” */}
      {showMiniPopup && (
        <div className="mini-popup-container">
          <div className="mini-popup">
            <span className="mini-popup-text">Klik icon dan lihat pengumuman!</span>
            <button className="mini-popup-close" onClick={() => setShowMiniPopup(false)}>
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Tombol bulat tetap tampil */}
      <button
        className="popup-float-icon"
        onClick={() => setShowMainPopup(true)}
        title="Lihat Pengumuman"
      >
        <FontAwesomeIcon icon={faBullhorn} />
      </button>

      {/* Popup utama langsung muncul di awal */}
      {showMainPopup && (
        <div className="modal-backdrops">
          <div className="modal-content-backdrop">
            <button className="modal-close" onClick={() => setShowMainPopup(false)}>&times;</button>

            <h2 className="popup-title">{current.judul_event}</h2>

            <div className="slider-wrapper">
              <button className="slider-button left" onClick={handlePrev}>&#10094;</button>
              <div className="sliders">
                <img
                  src={current.url_poster}
                  alt={current.name_poster || 'poster'}
                  className="slider-images"
                />
              </div>
              <button className="slider-button right" onClick={handleNext}>&#10095;</button>
            </div>

            <p className="popup-description">{current.desk_event}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default PopUp;
