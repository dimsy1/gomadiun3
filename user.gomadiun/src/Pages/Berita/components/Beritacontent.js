import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from './../../assets/js/loading.json';
import not_found from './../../assets/js/not_found.json';
import { useNavigate } from 'react-router-dom';

const BeritaContent = ({ dataBerita, isLoading }) => {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const navigate = useNavigate();

  function handleScroll() {
    const scrollContainer = document.querySelector('.berita-slider-container');
    const firstCard = scrollContainer?.querySelector('.berita-card');

    if (firstCard) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const firstCardRect = firstCard.getBoundingClientRect();

      const isVisible = firstCardRect.top < window.innerHeight && firstCardRect.left >= containerRect.left && firstCardRect.right <= containerRect.right;

      if (!hasBeenVisible && isVisible) {
        setHasBeenVisible(true);
      }
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasBeenVisible]);

  const handleNavigate = (id) => {
    navigate(`/berita/${id}`);
  };

  return (
    <div className="berita-content-wrapper">
      {isLoading ? (
        <div className="berita-loading">
          <div style={{ width: 200, height: 200 }}>
            <Lottie animationData={animationData} loop autoplay />
          </div>
        </div>
      ) : dataBerita === null ? (
        <div className="berita-notfound">
          <div style={{ width: 200, height: 200 }}>
            <Lottie animationData={not_found} loop autoplay />
          </div>
          <p className="notfound-text">Oops, data belum terdaftar</p>
        </div>
      ) : (
        // <div className="berita-slider-container">
          <div className="berita-slider-track berita-grid-layout">
            {dataBerita.map((item, index) => (
              <div
                key={index}
                className={`berita-card-all ${hasBeenVisible ? 'fade-in' : ''}`}
                style={{ animationDelay: `${index / 5}s` }}
                onClick={() => handleNavigate(item.id_berita)}
              >
               <div className="berita-img-wrapper">
  <img src={item.sampul_berita} alt={item.title} />
  <div className="berita-overlay">
    <p className="berita-description">{item.description}</p>
    <h3 className="berita-title">{item.title}</h3>
  </div>
</div>

              </div>
            ))}
          </div>
        // </div>
      )}
    </div>
  );
};

export default BeritaContent;
