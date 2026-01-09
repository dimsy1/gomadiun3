import { React, useEffect, useState } from "react";
import Lottie from "lottie-react";
import animationData from "../../assets/js/loading.json";
import not_found from "../../assets/js/not_found.json";
import { useNavigate } from "react-router-dom";

function ContentWisata({
  dataWisata,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleScroll() {
      // Targetkan element card-wisata untuk efek scroll
      const wisataContainer = document.querySelector(".card-wisata");
      if (!wisataContainer) return;

      const topPosition = wisataContainer.getBoundingClientRect().top;
      const isVisible = topPosition < window.innerHeight;

      if (!hasBeenVisible && isVisible) {
        setHasBeenVisible(true);
      }
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasBeenVisible]);

  const navigateToDetail = (href) => {
    navigate(href);
  };

  return (
    <div className="content-desawisata">
      {isLoading ? (
        <div className="desawisata-container justify-content-center">
          <div className="d-flex" style={{ height: 200, width: 200 }}>
            <Lottie animationData={animationData} loop autoplay />
          </div>
        </div>
      ) : (
        <div className="desawisata-container">
          {dataWisata.length === 0 ? (
            <div className="w-100 d-flex py-1 flex-column align-item-center">
              <div className="d-flex" style={{ height: 200, width: 200 }}>
                <Lottie animationData={not_found} loop autoplay />
              </div>
              <p className="text-default text-size-14 text-bold">
                Oops, data belum terdaftar
              </p>
            </div>
          ) : (
            <>
              <div className="desa-grid">
                {dataWisata.map((item, index) => (
                  <span
                    onClick={() => navigateToDetail(`/wisata/${item.id}`)}
                    key={index}
                    className={`card-desawisata ${
                      hasBeenVisible ? "fadeAnimasiUp" : ""
                    }`}
                    style={{ animationDelay: `${index / 10}s` }}
                  >
                    <div className="desa-card-all">
                      {/* Fallback image handler ditambahkan inline agar aman */}
                      <img
                        className="desa-image"
                        src={item.imageUrl}
                        alt={item.nama}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                      />
                      <div className="desa-card-footer">
                        <div className="desa-info">
                          <h3>{item.nama}</h3>
                          <p>{item.kategori}</p>
                        </div>
                        <button
                          className="lihat-detail-desa"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToDetail(`/wisata/${item.id}`);
                          }}
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </span>
                ))}
              </div>

              {/* Pagination (Logic sama persis dengan DesaWisata) */}
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
                    .filter((pageNumber) => {
                      return (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      );
                    })
                    .reduce((acc, curr, idx, arr) => {
                      if (idx > 0 && curr - arr[idx - 1] > 1) {
                        acc.push("ellipsis");
                      }
                      acc.push(curr);
                      return acc;
                    }, [])
                    .map((item, index) => {
                      if (item === "ellipsis") {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={item}
                          className={`pagination-button ${
                            item === currentPage ? "active" : ""
                          }`}
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

export default ContentWisata;
