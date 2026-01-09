import { React, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';

import not_found_image from './../../assets/img/image_notfound.png'
import animationData from "./../../assets/js/loading.json"

function PaketHomestayPenginapan({ id, openModalInfo }) {
    const [DetailKamar, setDataDetailKamar] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialSlideState, setinitialSlideState] = useState();

    const getData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/penginapan/homestay/${id}`)
            if (response) {
                setDataDetailKamar(response.data.data)
                const initialSlideState = response.data.data.reduce((acc, item) => {
                    acc[item.id] = 0;
                    return acc;
                }, {});
                setCurrentSlides(initialSlideState)
                setLoading(false)
            }
        } catch (error) {
            if (error.response.status === 422) {
                console.log(error);
                setLoading(false)
            }
        }
    }, [id])

    useEffect(() => {
        getData();
    }, [getData]);



    const [currentSlides, setCurrentSlides] = useState(initialSlideState);

    const prevSlide = (id, length) => {
        setCurrentSlides(prev => ({
            ...prev,
            [id]: prev[id] === 0 ? length - 1 : prev[id] - 1
        }));
        console.log('id', id)
    };

    const nextSlide = (id, length) => {
        setCurrentSlides(prev => ({
            ...prev,
            [id]: prev[id] === length - 1 ? 0 : prev[id] + 1
        }));
        console.log('id', id)
    };


    return (
        <div className="cover-detail my-top-2 flex-column" id='kamar'>
            <div className='d-flex flex-row my-bottom-1'>
                <span className='mx-1 text-bold text-size-14'>Paket yang tersedia</span>
            </div>
            <div>

                {!loading ? (
                    <>
                        {DetailKamar.length !== 0 ? (
                            <>

                                {DetailKamar.map((item, index) => {
                                    return (
                                        <div className='card-kamar' key={item.id}>
                                             <div className='container-image'>
                                                {item.imageUrl.length === 0 ? (
                                                    <div className="mySlides active">
                                                        <img className='rounded-10' src={not_found_image} alt={`Slide ${currentSlides[item.id] + 1}`} style={{ width: '100%', height: '50%' }} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="mySlides active">
                                                            <div className="numbertext">{currentSlides[item.id] + 1} / {item.imageUrl.length}</div>
                                                            <img className='rounded-10' src={item.imageUrl[currentSlides[item.id]].url} alt={`Slide ${currentSlides[item.id] + 1}`} style={{ width: '100%', height: '50%' }} />
                                                        </div>
                                                        <a className="prev" onClick={() => prevSlide(item.id, item.imageUrl.length)}>❮</a>
                                                        <a className="next" onClick={() => nextSlide(item.id, item.imageUrl.length)}>❯</a>
                                                    </>
                                                )}
                                            </div>
                                            <div className='mx-4 d-flex flex-column w-25'>
                                                <span className='text-bold my-bottom-1'>{item.nama_paket}</span>
                                                <span className='text-size-10' style={{ whiteSpace: 'pre-wrap' }}>{item.deskripsi}</span>
                                            </div>
                                            <div className='mx-4 d-flex flex-column w-25'>
                                                <span className='text-bold my-bottom-1'>Fasilitas</span>
                                                <div className='d-flex flex-column'>
                                                    {item.fasilitas.map((item, index) => {
                                                        return (
                                                            <div className='d-flex align-items-center py-1'>
                                                                <i className="fa-solid fa-circle-dot text-size-8"></i>
                                                                <span className='text-size-12 mx-2'>{item.fasilitas}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            <div className='mx-4 d-flex flex-column w-20'>
                                                <span className='text-bold my-bottom-1'>Harga paket/Malam</span>
                                                <span className='text-default text-size-18 text-bold my-2'>{Number(item.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                <button className='button-price' onClick={openModalInfo}>Pesan</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        ) : (
                            <div className="mx-5 py-5">
                                <div className="d-flex justify-content-center align-item-center my-3">
                                    <div className="d-flex" style={{ height: 125, width: 200 }}>
                                        <Lottie
                                            animationData={animationData}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mx-5 py-5">
                        <div className="d-flex justify-content-center align-item-center my-3">
                            <div className="d-flex" style={{ height: 125, width: 200 }}>
                                <Lottie
                                    animationData={animationData}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}

export default PaketHomestayPenginapan;
