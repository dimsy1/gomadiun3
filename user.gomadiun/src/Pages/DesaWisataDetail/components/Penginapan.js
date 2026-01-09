import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const Penginapan = ({ dataPenginapan, nama_desa }) => {
  const navigate = useNavigate();

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  function StarRating({ count }) {
    return (
      <div className="penginapan-stars">
        {Array.from({ length: count }, (_, index) => (
          <i className="fa-solid fa-star penginapan-star" key={index}></i>
        ))}
      </div>
    );
  }

  return (
  <div className="penginapan-section">
    <div className="penginapan-header">
      <div className="penginapan-title">
        <h2>Tempat Penginapan di {nama_desa}</h2>
        <p>Destinasi Wisata Populer di Kabupaten Madiun</p>
      </div>
      <span className="lihat-semua-penginapan" onClick={() => navigate('/penginapan')}>
        Lihat semua <i className="fa fa-angle-right"></i>
      </span>
      </div>
   

    <Swiper
      className="penginapan-swiper"
      modules={[Pagination]}
      spaceBetween={20}
      pagination={{ clickable: true }}
      breakpoints={{
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {dataPenginapan.map((item, index) => (
        <SwiperSlide key={index}>
          <div
            className="penginapan-card"
            onClick={() => navigate(`/penginapan/${item.id}`)}
          >
            <div className="penginapan-card-image">
              <img src={item.imageUrl} alt={item.nama} />
            </div>
            <div className="penginapan-card-content">
              <div className="penginapan-card-location">
                <i className="fas fa-map-marker-alt penginapan-location-icon"></i>
                <span className="penginapan-location-text">
                  {truncateText(item.alamat, 50)}
                </span>
                {item.kelas && <StarRating count={item.kelas} />}
              </div>
              <h3 className="penginapan-card-title">{item.nama}</h3>
              <div className="penginapan-card-bottom">
                <span className="penginapan-card-category">
                  {item.kategori_penginapan}
                </span>
                <div className="penginapan-card-price">
                  <span className="penginapan-price-label">Mulai dari</span>
                  <span className="penginapan-price-value">
                    {item.harga_terendah
                      ? `Rp ${item.harga_terendah.toLocaleString('id-ID')}`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);
}

export default Penginapan;
