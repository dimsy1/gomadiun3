import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Rating from './rating';

const Slider = ({ dataPaketWisata }) => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasBeenVisible, setHasBeenVisible] = useState(false); // Variabel status tambahan
    const [maxSlide, setmaxSlide] = useState(false);
    const navigate = useNavigate();

    function handleScroll() {
        // Mengambil elemen scroll-images dan child pertama
        const scrollImages = document.querySelector('.scroll-images');
        const firstChild = scrollImages?.querySelector('.child');

        if (firstChild) {
            // Mengambil posisi dan lebar scroll-images serta posisi child pertama
            const scrollImagesRect = scrollImages.getBoundingClientRect();
            const firstChildRect = firstChild.getBoundingClientRect();

            // Menentukan apakah posisi child pertama terlihat dalam viewport dan berada dalam batas lebar scroll-images
            const isVisible = firstChildRect.top < window.innerHeight && firstChildRect.left >= scrollImagesRect.left && firstChildRect.right <= scrollImagesRect.right;

            // Jika child pertama terlihat dalam viewport dan berada dalam batas lebar scroll-images, set hasBeenVisible menjadi true
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

    const nextSlide = () => {
        const container = document.querySelector('.scroll-images');
        const card = document.querySelector('.child');
        if (container) {
            const cardwidth = card.offsetWidth;
            const widthswipe = cardwidth + 16
            let newIndex = currentIndex + 1;
            if (newIndex >= dataPaketWisata.length - 4) {
                // newIndex = 0;
                setmaxSlide(true);
            }
            setCurrentIndex(newIndex);
            container.scrollTo({
                left: widthswipe * newIndex,
                behavior: 'smooth'
            });
        }
    };

    const prevSlide = () => {
        setmaxSlide(false);
        const container = document.querySelector('.scroll-images');
        const card = document.querySelector('.child');
        if (container) {
            const children = container.children;
            const cardwidth = card.offsetWidth;
            const widthswipe = cardwidth + 16
            let newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = children.length - 1;
            }
            setCurrentIndex(newIndex);
            container.scrollTo({
                left: widthswipe * newIndex,
                behavior: 'smooth'
            });
        }
    };

    const Navigate = (href) => {
        navigate(`${href}`);
    };


    return (
        <div>
            <div className="cover">
                <div className='d-flex flex-row my-bottom-2'>
                    <span className='mx-1 text-bold text-size-14'>Destinasi Wisata Populer di Kabupaten Madiun</span>
                </div>
                {currentIndex > 0 && (
                    <button className="left" onClick={prevSlide}>
                        <i className="fa fa-angle-left"></i>
                    </button>
                )}

                <div className="scroll-images">
                    {dataPaketWisata.map((item, index) => {
                        return (
                            <span onClick={() => Navigate(`paket_wisata/${item.id}`)} key={index} className={`child ${hasBeenVisible ? 'animasi' : ''}`} style={{ animationDelay: `${index / 3}s` }}>
                                <div className='cover-img'>
                                    <img src={item.imageUrl} alt='foto kosong' />
                                </div>
                                <div className='text-child'>
                                    <div className='d-flex flex-column'>
                                        <a className='text-size-10 text-black'>{item.kategori}</a>
                                        <a className='text-bold text-black text-size-12'>{item.nama}</a>
                                    </div>
                                    {item.harga == "GRATIS" ? (
                                        <a className='text-default text-bold'>{item.harga}</a>
                                    ) : (
                                        <a className='text-default text-bold'>{Number(item.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</a>
                                    )}
                                </div>
                                <div className='d-flex flex-column w-100 px-3'>
                                    <div className='d-flex align-item-center'>
                                        <a className='text-bold text-black text-size-14'>{item.rate}</a>
                                        <div className='mx-1 text-warning'>
                                            <i className="fa-solid fa-star"></i>
                                        </div>
                                        {/* <Rating rating={item.rate} /> */}
                                    </div>
                                    <a className='text-size-12 text-secondary'>{`(${item.jumlah_ulasan} ulasan)`}</a>
                                </div>
                            </span>
                        )
                    })}
                </div>
                {maxSlide === false && dataPaketWisata.length > 4 && (
                    <button className="right" onClick={nextSlide}>
                        <i className="fa fa-angle-right"></i>
                    </button>
                )}
            </div>
            {dataPaketWisata.length > 4 && (
                <div className='d-flex justify-content-center my-bottom-2'>
                    <button className='btn-detail'>
                        <span>Lihat Semua</span><i className="mx-1 fa fa-angle-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Slider;
