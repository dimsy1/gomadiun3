import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Rating from "./rating";

const Slider = ({ dataWisata }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasBeenVisible, setHasBeenVisible] = useState(false); // Variabel status tambahan
  const [maxSlide, setmaxSlide] = useState(false);
  const navigate = useNavigate();

  function handleScroll() {
    // Mengambil elemen scroll-images dan child pertama
    const scrollImages = document.querySelector(".scroll-images");
    const firstChild = scrollImages?.querySelector(".child");

    if (firstChild) {
      // Mengambil posisi dan lebar scroll-images serta posisi child pertama
      const scrollImagesRect = scrollImages.getBoundingClientRect();
      const firstChildRect = firstChild.getBoundingClientRect();

      // Menentukan apakah posisi child pertama terlihat dalam viewport dan berada dalam batas lebar scroll-images
      const isVisible =
        firstChildRect.top < window.innerHeight &&
        firstChildRect.left >= scrollImagesRect.left &&
        firstChildRect.right <= scrollImagesRect.right;

      // Jika child pertama terlihat dalam viewport dan berada dalam batas lebar scroll-images, set hasBeenVisible menjadi true
      if (!hasBeenVisible && isVisible) {
        setHasBeenVisible(true);
      }
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasBeenVisible]);

  const nextSlide = () => {
    const container = document.querySelector(".scroll-images");
    const card = document.querySelector(".child");
    if (container) {
      const cardwidth = card.offsetWidth;
      const widthswipe = cardwidth + 16;
      let newIndex = currentIndex + 1;
      if (newIndex >= dataWisata.length - 4) {
        // newIndex = 0;
        setmaxSlide(false);
      }
      setCurrentIndex(newIndex);
      container.scrollTo({
        left: widthswipe * newIndex,
        behavior: "smooth",
      });
    }
  };

  const prevSlide = () => {
    setmaxSlide(false);
    const container = document.querySelector(".scroll-images");
    const card = document.querySelector(".child");
    if (container) {
      const children = container.children;
      const cardwidth = card.offsetWidth;
      const widthswipe = cardwidth + 16;
      let newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = children.length - 1;
      }
      setCurrentIndex(newIndex);
      container.scrollTo({
        left: widthswipe * newIndex,
        behavior: "smooth",
      });
    }
  };

  const Navigate = (href) => {
    navigate(`${href}`);
  };

  return (
    <div className="wisata-section">
      <div className="cover-wisata">
        <div className="d-flex justify-content-between align-items-start flex-wrap mx-4">
          <div>
            <h2 className="wisata-title">
              Destinasi Wisata Populer di Kabupaten Madiun
            </h2>
            <p className="wisata-sub-title">
              Destinasi Wisata Populer di Kabupaten Madiun
            </p>
          </div>
          {dataWisata.length > 4 && (
            <span
              className="lihat-semua"
              onClick={() => navigate("/wisata")}
            >
              Lihat Semua <i className="fa fa-angle-right my-5"></i>
            </span>
          )}
        </div>

        {currentIndex > 0 && (
          <button className="left-arrow" onClick={prevSlide}>
            <i className="fa fa-angle-left"></i>
          </button>
        )}
        <div className="scroll-container">
          <div className="scroll-images">
            {dataWisata.map((item, index) => (
              <div
                onClick={() => Navigate(`wisata/${item.id}`)}
                key={index}
                className={`child card-wisata ${
                  hasBeenVisible ? "animasi" : ""
                }`}
                style={{ animationDelay: `${index / 3}s` }}
              >
                <div className="card-image">
                  <img src={item.imageUrl} alt={item.nama} />
                  <div className="card-overlay">
                    <div className="rating-wisata">
                      <i className="fa fa-star" style={{ marginRight: 4 }}></i>{" "}
                      {item.rate}
                    </div>

                    <div className="description-wisata">
                      {item.deskripsi
                        ? item.deskripsi.length > 80
                          ? item.deskripsi.substring(0, 80) + "…"
                          : item.deskripsi
                        : "Tidak ada deskripsi."}
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="harga-info" style={{ textAlign: "left" }}>
                    <small>Mulai dari</small>
                    <p className="harga-wisata">
                      {item.harga === "GRATIS"
                        ? item.harga
                        : Number(item.harga).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                    </p>
                  </div>
                  <div className="kategori-info">
                    <small>{item.kategori}</small>
                    <p className="nama-wisata">{item.nama}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {maxSlide === false && dataWisata.length > 3 && (
            <button className="right-arrow" onClick={nextSlide}>
              <i className="fa fa-angle-right"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Slider;
