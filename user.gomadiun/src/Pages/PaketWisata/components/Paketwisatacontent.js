import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/js/loading.json';
import not_found from '../../assets/js/not_found.json';
import { useNavigate } from 'react-router-dom';

const PaketWisataContent = ({ dataPaketWisata, isLoading, currentPage, totalPages, onPageChange }) => {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const navigate = useNavigate();

  function handleScroll() {
    const scrollContainer = document.querySelector('.paket-wisata-grid-container');
    const firstCard = scrollContainer?.querySelector('.rekomendasi-card-desawisata');

    if (firstCard) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const firstCardRect = firstCard.getBoundingClientRect();

      const isVisible =
        firstCardRect.top < window.innerHeight &&
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
    navigate(`/paket_wisata/${id}`);
  };

  return (
  <div className="paket-wisata-content-wrapper">
  {isLoading ? (
    <div className="paket-loading">
      <div style={{ width: 200, height: 200 }}>
        <Lottie animationData={animationData} loop autoplay />
      </div>
    </div>
  ) : !dataPaketWisata || dataPaketWisata.length === 0 ? (
    <div className="paket-notfound">
      <div style={{ width: 200, height: 200 }}>
        <Lottie animationData={not_found} loop autoplay />
      </div>
      <p className="notfound-text">Oops, paket wisata belum tersedia</p>
    </div>
  ) : (
    <>
      <div className="paket-wisata-grid-wrapper">
        <div className="paket-wisata-grid-container">
          {dataPaketWisata.map((item, index) => (
            <div
              key={index}
              className={`rekomendasi-card-desawisata-all ${hasBeenVisible ? 'animasi' : ''}`}
              style={{ animationDelay: `${index / 5}s` }}
              onClick={() => handleNavigate(item.id)}
            >
              <img
                src={item.imageUrl}
                alt={item.nama}
                className="rekomendasi-image-all"
              />
              <div className="rekomendasi-info-desawisata-all">
                <div className="rekomendasi-info-kiri-all">
                  <div className="rekomendasi-nama-all">{item.nama}</div>
                  <div className="rekomendasi-harga-all">
                    {item.harga === 'GRATIS' ? (
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
                  className="lihat-detail-rekomendasi-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(item.id);
                  }}
                >
                  Lihat Detail →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <div className="pagination-container">
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
        </div>
      )}
    </>
  )}
</div>

  );
};

export default PaketWisataContent;
