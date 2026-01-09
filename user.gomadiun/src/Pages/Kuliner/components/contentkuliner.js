import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from './../../assets/js/loading.json';
import not_found from './../../assets/js/not_found.json';
import { useNavigate } from 'react-router-dom';

const KulinerContent = ({ datakuliner, isLoading, currentPage, totalPages, onPageChange }) => {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const navigate = useNavigate();

  function handleScroll() {
    const scrollContainer = document.querySelector('.kuliner-slider-container');
    const firstCard = scrollContainer?.querySelector('.kuliner-card');

    if (firstCard) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const firstCardRect = firstCard.getBoundingClientRect();

      const isVisible = firstCardRect.top < window.innerHeight &&
                        firstCardRect.left >= containerRect.left &&
                        firstCardRect.right <= containerRect.right;

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
    navigate(`/kuliner/${id}`);
  };

  return (
    <div className="kuliner-content-wrapper">
      {isLoading ? (
        <div className="kuliner-loading">
          <div style={{ width: 200, height: 200 }}>
            <Lottie animationData={animationData} loop autoplay />
          </div>
        </div>
      ) : datakuliner === null || datakuliner.length === 0 ? (
        <div className="kuliner-notfound">
          <div style={{ width: 200, height: 200 }}>
            <Lottie animationData={not_found} loop autoplay />
          </div>
          <p className="notfound-text">Oops, data belum terdaftar</p>
        </div>
      ) : (
        <>
          <div className="kuliner-slider-track grid-layout">
            {datakuliner.map((item, index) => (
              <div
                key={index}
                className={`kuliner-card-all ${hasBeenVisible ? 'fade-in' : ''}`}
                style={{ animationDelay: `${index / 5}s` }}
                onClick={() => handleNavigate(item.id)}
              >
                <div className="kuliner-img-wrapper">
                  <img src={item.imageUrl} alt={item.nama} />
                  <div className="overlay-text">
                    <p className={`status ${item.status_buka === 'Buka' ? 'buka' : 'tutup'}`}>
                      Sedang {item.status_buka}
                    </p>
                    <h3 className="kuliner-nama">{item.nama}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container mt-4 d-flex justify-content-center gap-2 flex-wrap align-items-center">

              {/* Tombol Previous */}
              <button
                className="btn btn-outline-secondary"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>

              {/* Logika halaman dengan ellipsis */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNumber =>
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                )
                .reduce((acc, curr, idx, arr) => {
                  if (idx > 0 && curr - arr[idx - 1] > 1) {
                    acc.push('ellipsis');
                  }
                  acc.push(curr);
                  return acc;
                }, [])
                .map((item, index) => {
                  if (item === 'ellipsis') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={item}
                      className={`pagination-button ${item === currentPage ? 'active' : ''}`}
                      onClick={() => onPageChange(item)}
                    >
                      {item}
                    </button>
                  );
                })}

              {/* Tombol Next */}
              <button
                className="btn btn-outline-secondary"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KulinerContent;
