import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Slider = ({ dataBerita }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const [maxSlide, setMaxSlide] = useState(false);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleScroll = () => {
            const scrollContainer = document.querySelector('.berita-scroll-container');
            const firstCard = scrollContainer?.querySelector('.berita-card');

            if (firstCard) {
                const containerRect = scrollContainer.getBoundingClientRect();
                const cardRect = firstCard.getBoundingClientRect();

                const isVisible = cardRect.top < window.innerHeight &&
                    cardRect.left >= containerRect.left &&
                    cardRect.right <= containerRect.right;

                if (!hasBeenVisible && isVisible) {
                    setHasBeenVisible(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasBeenVisible]);

    useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

    // const nextSlide = () => {
    //     const container = document.querySelector('.kuliner-scroll-container');
    //     const card = document.querySelector('.kuliner-card');
    //     const cardWidth = card.offsetWidth + 24;
    //     let newIndex = currentIndex + 1;

    //     if (newIndex >= dataKuliner.length - 2) setMaxSlide(true);
    //     setCurrentIndex(newIndex);
    //     container.scrollTo({ left: cardWidth * newIndex, behavior: 'smooth' });
    // };

    // const prevSlide = () => {
    //     setMaxSlide(false);
    //     const container = document.querySelector('.kuliner-scroll-container');
    //     const card = document.querySelector('.kuliner-card');
    //     const cardWidth = card.offsetWidth + 24;
    //     let newIndex = currentIndex - 1;

    //     if (newIndex < 0) newIndex = 0;
    //     setCurrentIndex(newIndex);
    //     container.scrollTo({ left: cardWidth * newIndex, behavior: 'smooth' });
    // };

    const handleNavigate = (id) => {
        navigate(`/berita/${id}`);
    };

   return (
    <div className="berita-section">
      <div className="berita-header">
        <div className="berita-title">
          <h2>Berita Terbaru seputar pariwisata di Madiun</h2>
          <p>Bersama mitra-mitra terpercaya, kami membangun sinergi untuk mendorong inovasi</p>
        </div>
        <span className="lihat-semua" onClick={() => navigate('/berita')}>
          Lihat semua <i className="fa fa-angle-right"></i>
        </span>
      </div>

      <div className="berita-grid">
        {dataBerita.length > 0 && (
          <div
            className="berita-card berita-card-large"
            onClick={() => handleNavigate(dataBerita[0].id_berita)}
            style={{ backgroundImage: `url(${dataBerita[0].sampul_berita})` }}
          >
            <div className="berita-overlay">
                <h4>{dataBerita[0].description}</h4>
              <h3>{dataBerita[0].title}</h3>
            </div>
          </div>
        )}

        <div className="berita-card-small-container">
         {dataBerita.slice(1, isMobile ? 3 : 5).map((item, index) => (
            <div
              key={index}
              className="berita-card berita-card-small"
              onClick={() => handleNavigate(item.id_berita)}
              style={{ backgroundImage: `url(${item.sampul_berita})` }}
            >
              <div className="berita-overlay">
                <h4>{item.description}</h4>
                <h3>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;
