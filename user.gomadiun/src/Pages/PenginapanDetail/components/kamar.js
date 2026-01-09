import { React, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import moment from 'moment';


import not_found_image from './../../assets/img/image_notfound.png';
import animationData from "./../../assets/js/loading.json";

function KamarDetailPenginapan({ 
    id,
    idPenginapan, 
    showAlert, 
    messageAlert, 
    nameAlert, 
    statusLogin, 
    openModal 
}) {
    const [DetailKamar, setDataDetailKamar] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentSlides, setCurrentSlides] = useState({});
    const [jumlah_wisatawan, setJumlah] = useState(1);
    const [date, setDate] = useState();
    const [dates, setDates] = useState({});
    const [jumlahPerKamar, setJumlahPerKamar] = useState({});


    // Use useMemo to derive harga from DetailKamar
    const harga = useMemo(() => {
        return DetailKamar.length > 0 ? DetailKamar[0]?.harga : null;
    }, [DetailKamar]);

    const add = (id) => {
    setJumlahPerKamar(prev => ({
        ...prev,
        [id]: (prev[id] || 1) + 1
    }));
};

const min = (id) => {
    setJumlahPerKamar(prev => ({
        ...prev,
        [id]: Math.max(1, (prev[id] || 1) - 1)
    }));
};


    const Data = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/penginapan/kamar/${id}`);
            console.log("Data response:", response.data); // Log response untuk debug
    
            if (response.data && response.data.data) {
                const dataWithImages = response.data.data.map((item) => {
                    const images = [
                        item.sampul_kamar,
                        item.ruang_kamar,
                        item.ruang_kamar_dua,
                        item.ruang_kamar_tiga,
                        item.ruang_kamar_empat,
                        item.ruang_kamar_lima,
                    ].filter(Boolean);
                    return { ...item, images };
                });
    
                setDataDetailKamar(dataWithImages);
    
                const initialSlideState = dataWithImages.reduce((acc, item) => {
                    acc[item.id] = 0;
                    return acc;
                }, {});
    
                setCurrentSlides(initialSlideState);
            } else {
                console.warn("Data kamar kosong atau tidak ditemukan");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);
    
    useEffect(() => {
        Data();
    }, [Data]);

    const prevSlide = (id, length) => {
        setCurrentSlides((prev) => ({
            ...prev,
            [id]: prev[id] === 0 ? length - 1 : prev[id] - 1,
        }));
    };

    const nextSlide = (id, length) => {
        setCurrentSlides((prev) => ({
            ...prev,
            [id]: prev[id] === length - 1 ? 0 : prev[id] + 1,
        }));
    };

   const AddKeranjang = async (item) => {
    const id_kamar = item.id;
    // Ganti dari item.idPenginapan menjadi idPenginapan dari props
    const id_penginapan = idPenginapan;  

    const selectedDate = dates[id_kamar];
    if (!selectedDate) {
        messageAlert("Silakan pilih tanggal terlebih dahulu");
        nameAlert("Warning");
        showAlert();
        return;
    }

    try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/add/kamar`, {
            id_menu: id_kamar,
            id_destinasi: id_penginapan,
            jumlah: jumlahPerKamar[id_kamar] || 1,
            date: selectedDate
        });

        if (response) {
            console.log("Response dari server:", response.data);
            messageAlert(response.data.message);
            nameAlert('Success');
            showAlert();
        }
    } catch (error) {
            if (error.response) {
                console.error("Error Response Status:", error.response.status);
                console.error("Error Response Data:", error.response.data);
            }
    
            if (error.response?.status === 422) {
                messageAlert(error.response.data.message);
                nameAlert('Warning');
                showAlert();
            } else if (error.response?.status === 401) {
                openModal();
            } else {
                console.log("Error:", error);
            }
        }
    };
    
    
    

    const getData = useCallback(async () => {
        try {
            if (statusLogin === "login") {
                console.log("Memanggil API untuk check keranjang dengan ID:", id); // Log ID untuk debug
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/check?filter[id_kamar]=${id}&filter[nama_kamar]=tbl_kamar`);
                console.log("Data dari API check keranjang:", response.data); // Log data untuk debug
                if (response) {
                    setDate(response.data.data[0]?.tgl_booking);
                    setJumlah(response.data.data[0]?.detail_pesanan[0]?.jumlah);
                }
            }
        } catch (error) {
            if (error.response?.status === 422) {
                console.log("Error saat memanggil API check keranjang:", error.response.data); // Log error untuk debug
            } else {
                console.log("Error:", error); // Log error untuk debug
            }
        }
    }, [statusLogin, id]);

    useEffect(() => {
        getData();
    }, [getData]);

    const handleDateChange = (id, e) => {
    const selectedDate = e.target.value;
    const dateWithTime = moment(selectedDate).set({ hour: 23, minute: 59, second: 0 }).format('YYYY-MM-DD HH:mm:ss');
    setDates(prev => ({
        ...prev,
        [id]: dateWithTime
    }));
};


    if (DetailKamar.length === 0) {
        const noDataStyle = {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#555',
            textAlign: 'center',
            margin: '20px 75px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '10px',
            width: '90%'
        };
    
        return <p style={noDataStyle}>Pilihan kamar belum tersedia ☹️</p>;
    }
    

    return (
        <div className="cover-detail-kamar my-top-2 flex-column" id="kamar">
            <div className="d-flex flex-row my-bottom-1">
                <span className="detail-kamar-title mx-1 text-bold text-size-18">Kamar yang tersedia</span>
            </div>
            <div>
                {!loading ? (
                    <>
                        {DetailKamar.length !== 0 ? (
                            DetailKamar.map((item) => (
                                <div className="card-kamar" key={item.id}>
                                   <div className="container-image position-relative">
                                        {item.images.length === 0 ? (
                                            <div className="mySlides active">
                                                <img
                                                    className="rounded-10"
                                                    src={not_found_image}
                                                    alt="Image not found"
                                                    style={{ width: '100%', height: '50%' }}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mySlides active">
                                                    <div className="numbertext">
                                                        {currentSlides[item.id] + 1} / {item.images.length}
                                                    </div>
                                                    <img
                                                        className="rounded-10"
                                                        src={item.images[currentSlides[item.id]]}
                                                        alt={`Slide ${currentSlides[item.id] + 1}`}
                                                        style={{ width: '100%', height: '60%'}}
                                                    />
                                                </div>
                                                <a className="prev-kamar" onClick={() => prevSlide(item.id, item.images.length)}>
                                                    ❮
                                                </a>
                                                <a className="next-kamar" onClick={() => nextSlide(item.id, item.images.length)}>
                                                    ❯
                                                </a>
                                            </>
                                        )}
                                    </div>
                                    <div className="mx-4 d-flex flex-column w-25">
                                        <span className="text-bold my-bottom-1">{item.nama_kamar}</span>
                                        <span className="text-size-10" style={{ whiteSpace: 'pre-wrap' }}>
                                            {item.deskripsi}
                                        </span>
                                    </div>
                                    <div className="mx-4 d-flex flex-column w-20">
                                        <span className="text-bold my-bottom-1">Detail</span>
                                        <div className="d-flex flex-column">
                                            <div className="d-flex align-items-center py-1 mb-2">
                                                <i className="fa-solid fa-user text-size-12"></i>
                                                <span className="text-size-12 mx-2">{item.kapasitas} Tamu</span>
                                            </div>
                                            {item.fasilitas_sarapan === 'true' && (
                                                <div className="d-flex align-items-center py-1 mb-2">
                                                    <i className="fa-solid fa-utensils text-size-12"></i>
                                                    <span className="text-size-12 mx-2">Termasuk sarapan</span>
                                                </div>
                                            )}
                                            {item.bebas_rokok === 'true' && (
                                                <div className="d-flex align-items-center py-1 mb-2">
                                                    <i className="fa-solid fa-ban-smoking text-size-12"></i>
                                                    <span className="text-size-12 mx-2">Bebas asap rokok</span>
                                                </div>
                                            )}
                                             <div className="d-flex align-items-center py-1 mb-2">
                                                <i className="fa-solid fa-bed text-size-12"></i>
                                                <span className="text-size-12 mx-2">{item.jumlah_kamar} Kamar tersedia</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mx-4 d-flex flex-column w-20" >
                                        <span className="text-bold my-bottom-0">Harga Kamar Per-Malam</span>
                                       <span className="detail-kamar-harga text-size-18 text-bold my-2">
    {Number(item.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
</span>

                                    </div>
                                    <div className="mx-0 d-flex flex-column w-100%">
                                        <span className="text-bold my-bottom-0">Tanggal Pemesanan</span>
                                       <input 
    value={moment(dates[item.id] || new Date()).format('YYYY-MM-DD')} 
    className='date-style w-100'
    type="date" 
    onChange={(e) => handleDateChange(item.id, e)} 
/>
<div className="d-flex justify-content-between align-items-center my-bottom-1 w-100">
    <button className="btn btn-secondary" style={{ backgroundColor: '#06647B', borderColor:'#06647B' }} onClick={() => min(item.id)}>-</button>
    <span>{jumlahPerKamar[item.id] || 1} Kamar</span>
    <button className="btn btn-secondary" style={{ backgroundColor: '#06647B', borderColor:'#06647B' }} onClick={() => add(item.id)}>+</button>
</div>
<button className="btn btn-success w-100" style={{ backgroundColor: '#06647B', borderColor:'#06647B' }} onClick={() => AddKeranjang(item)}>
    Pesan Kamar
</button>

                                    </div>
                                </div>
                            ))
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

export default KamarDetailPenginapan;
