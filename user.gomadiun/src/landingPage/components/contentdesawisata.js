import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';  // Import Slider from react-slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";



// Komponen panah custom
// const PrevArrow = ({ onClick }) => (
//     <div className="custom-arrow prev" onClick={onClick}>
//         &lt;
//     </div>
//   );
  
//   const NextArrow = ({ onClick }) => (
//     <div className="custom-arrow next" onClick={onClick}>
//       &gt;
//     </div>
//   );

function ContentDesaWisata({ dataDesaWisata }) {
    const navigate = useNavigate();

    const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
  afterChange: (current) => setCurrentIndex(current),
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const [currentIndex, setCurrentIndex] = useState(0);    

    const visibleCards = dataDesaWisata
        .sort((a, b) => b.id_desaWisata - a.id_desaWisata);

        return (
          <div className="landing-desa-section">
              <div className="desa-header">
                  <div>
                      <h2>Temukan Desa Wisata yang menarik untuk dikunjungi</h2>
                      <p>Bersama mitra-mitra terpercaya, kami membangun sinergi untuk mendorong inovasi</p>
                  </div>
                  
                  <span className="lihat-semua-desa" onClick={() => navigate('/desawisata')}>
                      Lihat semua <i className="fa fa-angle-right"></i>
                  </span>
              </div>
  
              <Slider {...settings}>
                  {visibleCards.map((item, index) => (
                      <div key={index} className="slider-item">
                          <div
                              className="desa-card"
                              onClick={() => navigate(`/desawisata/${item.id_desaWisata}`)}
                          >
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
                                          navigate(`/desawisata/${item.id_desaWisata}`);
                                      }}
                                  >
                                      Lihat Detail
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </Slider>
          </div>
      );
  }
  
  export default ContentDesaWisata;