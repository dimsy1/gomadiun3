import { React, useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/js/loading.json';
import not_found from '../../assets/js/not_found.json';
import { useNavigate } from 'react-router-dom';

function ContentDesaWisata({ dataDesaWisata, isLoading, currentPage, totalPages, onPageChange }) {
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        function handleScroll() {
            const desawisataContainer = document.querySelector('.card-desawisata');
            if (!desawisataContainer) return;

            const topPosition = desawisataContainer.getBoundingClientRect().top;
            const isVisible = topPosition < window.innerHeight;

            if (!hasBeenVisible && isVisible) {
                setHasBeenVisible(true);
            }
        }

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasBeenVisible]);

    const navigateToDetail = (href) => {
        navigate(href);
    };

    return (
        <div className="content-desawisata">
            {isLoading ? (
                <div className='desawisata-container justify-content-center'>
                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                        <Lottie animationData={animationData} loop autoplay />
                    </div>
                </div>
            ) : (
                <div className='desawisata-container'>
                    {dataDesaWisata.length === 0 ? (
                        <div className='w-100 d-flex py-1 flex-column align-item-center'>
                            <div className='d-flex' style={{ height: 200, width: 200 }}>
                                <Lottie animationData={not_found} loop autoplay />
                            </div>
                            <p className='text-default text-size-14 text-bold'>Oops, data belum terdaftar</p>
                        </div>
                    ) : (
                        <>
                            <div className="desa-grid">
                                {dataDesaWisata.map((item, index) => (
                                    <span
                                        onClick={() => navigateToDetail(`/desawisata/${item.id_desaWisata}`)}
                                        key={index}
                                        className={`card-desawisata ${hasBeenVisible ? 'fadeAnimasiUp' : ''}`}
                                        style={{ animationDelay: `${index / 10}s` }}
                                    >
                                        <div className="desa-card-all">
                                            <img className="desa-image" src={item.sampul_desaWisata} alt="cover" />
                                            <div className="desa-card-footer">
                                                <div className="desa-info">
                                                    <h3>{item.nama_desaWisata}</h3>
                                                    <p>{item.data_wisata.jumlah_wisata} Destinasi</p>
                                                </div>
                                                <button
                                                    className="lihat-detail-desa"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigateToDetail(`/desawisata/${item.id_desaWisata}`);
                                                    }}
                                                >
                                                    Lihat Detail
                                                </button>
                                            </div>
                                        </div>
                                    </span>
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
      .filter(pageNumber => {
        return (
          pageNumber === 1 ||
          pageNumber === totalPages ||
          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
        );
      })
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
            )}
        </div>
    );
}

export default ContentDesaWisata;
