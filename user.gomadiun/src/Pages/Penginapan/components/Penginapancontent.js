import React, { useState, useEffect } from 'react';
import DesaIcon from "./../../assets/img/DesaIcon_blue.png";
import Lottie from 'lottie-react';
import animationData from './../../assets/js/loading.json';
import not_found from './../../assets/js/not_found.json';
import { useNavigate } from 'react-router-dom';

const PenginapanContent = ({ dataPenginapan, isLoading, currentPage, totalPages, onPageChange }) => {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const navigate = useNavigate();

  function handleScroll() {
    const scrollImages = document.querySelector('.penginapan-cover-page');
    const firstChild = scrollImages?.querySelector('.penginapan-card');

    if (firstChild) {
      const scrollImagesRect = scrollImages.getBoundingClientRect();
      const firstChildRect = firstChild.getBoundingClientRect();

      const isVisible = firstChildRect.top < window.innerHeight &&
        firstChildRect.left >= scrollImagesRect.left &&
        firstChildRect.right <= scrollImagesRect.right;

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

  const Navigate = (href) => {
    navigate(`${href}`);
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const StarRating = ({ count }) => (
    <div className="penginapan-stars">
      {Array.from({ length: count }, (_, index) => (
        <i className="fa-solid fa-star penginapan-star" key={index}></i>
      ))}
    </div>
  );

  return (
    <div className="penginapan-cover-page">
      {isLoading ? (
        <div className="penginapan-loading-container">
          <div className="penginapan-loading-animation">
            <Lottie animationData={animationData} loop autoplay />
          </div>
        </div>
      ) : dataPenginapan === null ? (
        <div className="penginapan-notfound-container">
          <div className="penginapan-notfound-animation">
            <Lottie animationData={not_found} loop autoplay />
          </div>
          <p className="penginapan-notfound-text">Oops, data belum terdaftar</p>
        </div>
      ) : (
        <>
          <div className="penginapan-grid">
            {dataPenginapan.map((item, index) => (
              <div
                onClick={() => Navigate(`/penginapan/${item.id}`)}
                key={index}
                className={`penginapan-card ${hasBeenVisible ? 'fade-in' : ''}`}
                style={{ animationDelay: `${index / 5}s` }}
              >
                <div className="penginapan-card-image">
                  <img src={item.imageUrl} alt={item.nama} />
                </div>
                <div className="penginapan-card-content">
                  <div className="penginapan-card-location">
                    <i className="fas fa-map-marker-alt penginapan-location-icon" style={{ marginRight: '8px' }}></i>
                    <span className="penginapan-location-text">{truncateText(item.alamat, 50)}</span>
                    {item.kelas && <StarRating count={item.kelas} />}
                  </div>

                  <h3 className="penginapan-card-title">{item.nama}</h3>

                  <div className="penginapan-card-bottom">
                    <span className="penginapan-card-category">{item.kategori}</span>
                    <div className="penginapan-card-price">
                      <span className="penginapan-price-label">Mulai dari</span>
                      <span className="penginapan-price-value">
                        {item.harga_terendah ? `Rp ${item.harga_terendah.toLocaleString('id-ID')}` : 'Harga tidak tersedia'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container mt-4 d-flex justify-content-center gap-2 flex-wrap align-items-center">
              <button
                className="btn btn-outline-secondary"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>

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
                .map((item, index) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2">...</span>
                  ) : (
                    <button
                      key={item}
                      className={`pagination-button ${item === currentPage ? 'active' : ''}`}
                      onClick={() => onPageChange(item)}
                    >
                      {item}
                    </button>
                  )
                )}

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

export default PenginapanContent;
