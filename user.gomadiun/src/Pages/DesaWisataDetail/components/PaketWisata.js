import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PaketWisata = ({ dataPaketWisata, nama_desa }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const handleScroll = () => {
    const scrollImages = containerRef.current;
    const firstChild = scrollImages?.querySelector('.rekomendasi-card-paketwisata');

    if (firstChild) {
      const scrollImagesRect = scrollImages.getBoundingClientRect();
      const firstChildRect = firstChild.getBoundingClientRect();

      const isVisible =
        firstChildRect.top < window.innerHeight &&
        firstChildRect.left >= scrollImagesRect.left &&
        firstChildRect.right <= scrollImagesRect.right;

      if (!hasBeenVisible && isVisible) {
        setHasBeenVisible(true);
      }
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const slide = (direction) => {
    const container = containerRef.current;
    const card = container?.querySelector('.rekomendasi-card-paketwisata');
    if (!container || !card) return;

    const cardWidth = card.offsetWidth + 16; // gap 16px
    const scrollAmount = direction === 'next' ? cardWidth : -cardWidth;

    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });

    setCurrentIndex((prev) => {
      const newIndex = direction === 'next' ? prev + 1 : prev - 1;
      const max = dataPaketWisata.length - 1;
      return Math.max(0, Math.min(newIndex, max));
    });
  };

  const Navigate = (href) => {
    navigate(`${href}`);
  };

  if (!dataPaketWisata || dataPaketWisata.length === 0) {
    return (
      <div className="w-100 d-flex py-1 flex-column align-item-center">
        <p className="text-default text-size-14 text-bold">
          Belum ada paket wisata di {nama_desa}
        </p>
      </div>
    );
  }

  return (
    <div className="cover-paketwisata-recomend">
      <div className="paket-header">
        <div className="paket-title">
          <h2 className="wisata-title">Paket Wisata di {nama_desa}</h2>
          <p className="wisata-sub-title">Paket wisata menarik yang ditawarkan desa</p>
        </div>
        <span className="lihat-semua" onClick={() => navigate('/paketwisata')}>
          Lihat semua <i className="fa fa-angle-right"></i>
        </span>
      </div>

      {currentIndex > 0 && (
        <button className="left-arrow-paketwisata" onClick={() => slide('prev')}>
          <i className="fa fa-angle-left"></i>
        </button>
      )}

      <div className="scroll-container-paketwisata position-relative">
        <div className="scroll-images-paketwisata d-flex gap-4" ref={containerRef}>
          {dataPaketWisata.map((item, index) => (
            <div
              key={index}
              className={`rekomendasi-card-paketwisata ${hasBeenVisible ? 'animasi' : ''}`}
              style={{ animationDelay: `${index / 5}s` }}
            >
              <img
                src={item.imageUrl}
                alt={item.nama}
                className="rekomendasi-image-paketwisata"
              />
              <div className="rekomendasi-info-paketwisata">
                <div className="rekomendasi-info-kiri-paketwisata">
                  <div className="rekomendasi-nama-paketwisata">{item.nama}</div>
                  <div className="rekomendasi-harga-paketwisata">
                    {item.harga === "GRATIS" ? (
                      <span>GRATIS</span>
                    ) : (
                      <span>
                        {Number(item.harga).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="lihat-detail-rekomendasi-paketwisata"
                  onClick={() => Navigate(`/paket_wisata/${item.id}`)}
                >
                  Lihat Detail →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentIndex < dataPaketWisata.length - 1 && (
        <button className="right-arrow-paketwisata" onClick={() => slide('next')}>
          <i className="fa fa-angle-right"></i>
        </button>
      )}
    </div>
  );
};

export default PaketWisata;
