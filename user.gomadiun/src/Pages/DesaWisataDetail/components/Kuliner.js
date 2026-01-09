import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const Kuliner = ({ datakuliner, nama_desa }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const [maxSlide, setmaxSlide] = useState(false);
    const navigate = useNavigate();
     const sortedData = datakuliner.slice().reverse();

 useEffect(() => {
         const handleScroll = () => {
             const scrollContainer = document.querySelector('.kuliner-scroll-container');
             const firstCard = scrollContainer?.querySelector('.kuliner-card');
 
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

    // const nextSlide = () => {
    //     const container = document.querySelector('.scroll-images-kuliner');
    //     const card = document.querySelector('.child-kuliner');
    //     if (container) {
    //         const cardwidth = card.offsetWidth;
    //         const widthswipe = cardwidth + 16
    //         let newIndex = currentIndex + 1;
    //         if (newIndex >= datakuliner.length - 4) {
    //             setmaxSlide(true);
    //         }
    //         setCurrentIndex(newIndex);
    //         container.scrollTo({
    //             left: widthswipe * newIndex,
    //             behavior: 'smooth'
    //         });
    //     }
    // };

    // const prevSlide = () => {
    //     setmaxSlide(false);
    //     const container = document.querySelector('.scroll-images-kuliner');
    //     const card = document.querySelector('.child-kuliner');
    //     if (container) {
    //         const children = container.children;
    //         const cardwidth = card.offsetWidth;
    //         const widthswipe = cardwidth + 16
    //         let newIndex = currentIndex - 1;
    //         if (newIndex < 0) {
    //             newIndex = children.length - 1;
    //         }
    //         setCurrentIndex(newIndex);
    //         container.scrollTo({
    //             left: widthswipe * newIndex,
    //             behavior: 'smooth'
    //         });
    //     }
    // };

    // const navigate = useNavigate();
    // const Navigate = (href) => {
    //     navigate(`${href}`);
    // };

    const handleNavigate = (id) => {
        navigate(`/kuliner/${id}`);
    };

    return (
      <div className="kuliner-section">
      <div className="kuliner-header">
        <div className="kuliner-title">
          <h2>Kuliner Populer di Kabupaten Madiun</h2>
          <p>Destinasi Wisata Populer di Kabupaten Madiun</p>
        </div>
        <span className="lihat-semua" onClick={() => navigate('/kuliner')}>
          Lihat semua <i className=" fa fa-angle-right"></i>
        </span>
      </div>

      <Swiper
        modules={[Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
       {sortedData.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="kuliner-card" onClick={() => navigate(`/kuliner/${item.id}`)}>
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
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Kuliner;
