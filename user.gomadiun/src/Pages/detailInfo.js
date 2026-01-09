import { React, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import animationData from './assets/js/cart_empty.json';
import loadingAnimation from './assets/js/loading.json';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import useSnap from './hooks/useSnap';

function KeranjangPage({
    showAlert,
    messageAlert,
    nameAlert
}) {
    const { id } = useParams();
    const [DataKeranjang, setDataKeranjang] = useState([]);
    const [loading, setLoading] = useState(false);
    const [OpenSnap, setOpenSnap] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { snapEmbed } = useSnap();

    const getData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/get_all/keranjang`)
            if (response) {
                setDataKeranjang(response.data.data)
                setLoading(false);
            }
        } catch (error) {
            if (error.response.status === 401) {
                setLoading(false);
                navigate('/');
                messageAlert(error.response.data.msg);
                nameAlert('Error')
                showAlert();
            }
            else if (error.response.status === 422) {
                setMessage(error.response.data.message)
                setLoading(false);
            }
        }
    }, [setDataKeranjang, navigate, messageAlert, nameAlert, showAlert])

    useEffect(() => {
        getData();
    }, [getData]);

    const Navigate = (href) => {
        navigate(`${href}`);
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD');
    };

    return (
        <section>
            <div className='desawisata-header'></div>
            {loading ? (
                <div className='d-flex flex-column justify-content-center align-item-center w-100 my-top-3' style={{ height: '50vh' }}>
                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                        <Lottie
                            animationData={loadingAnimation}
                            loop={true}
                            autoplay={true}
                        />
                    </div>
                </div>
            ) : (

                <>
                    <h2 className="text-center my-top-3">Keranjang Anda</h2>
                    {DataKeranjang.map((item, index) => {
                        return (
                            <div className="cover-keranjang" key={index}>
                                <div className='cover-items-keranjang'>

                                    {item.list_keranjang.map((item, index) => {
                                        return (
                                            <div className="card-keranjang" key={index}>
                                                <div className='d-flex justify-content-beetwen my-bottom-1'>
                                                    <div className='d-flex flex-column'>
                                                        <span className='text-size-14 text-bold'>{item.nama_destinasi}</span>
                                                        <span className='text-size-12 text-secondary'>Tgl Booking: {formatDate(item.tgl_booking)}</span>
                                                        {item.jenis_destinasi === "tbl_kuliner" && (
                                                            <button className="my-top-1 btn-edit" onClick={() => Navigate(`/kuliner/${item.id_destinasi}`)}>
                                                                <i className="fa-solid fa-cart-plus"></i>
                                                                <span className='mx-2'>Tambah menu</span>
                                                            </button>
                                                        )}
                                                        {item.jenis_destinasi === "tbl_destinasi" && (
                                                            <button className="my-top-1 btn-edit" onClick={() => Navigate(`/wisata/${item.id_destinasi}`)}>
                                                                <i className="fa-solid fa-pen-to-square"></i>
                                                                <span className='mx-1'> Ubah pesanan</span>
                                                            </button>
                                                        )}
                                                        {item.jenis_destinasi === "tbl_paket_wisata" && (
                                                            <button className="my-top-1 btn-edit" onClick={() => Navigate(`/paket_wisata/${item.id_destinasi}`)}>
                                                                <i className="fa-solid fa-pen-to-square"></i>
                                                                <span className='mx-1'> Ubah pesanan</span>
                                                            </button>
                                                        )}
                                                        {item.jenis_destinasi === "tbl_kamar" && (
                                                            <button className="my-top-1 btn-edit" onClick={() => Navigate(`/penginapan/${item.id_destinasi}`)}>
                                                                <i className="fa-solid fa-pen-to-square"></i>
                                                                <span className='mx-1'> Ubah pesanan</span>
                                                            </button>
                                                        )}
                                                        {item.jenis_destinasi === "tbl_paket_homestay" && (
                                                            <button className="my-top-1 btn-edit" onClick={() => Navigate(`/penginapan/${item.id_destinasi}`)}>
                                                                <i className="fa-solid fa-pen-to-square"></i>
                                                                <span className='mx-1'> Ubah pesanan</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className='d-flex flex-column'>
                                                        <span className='text-size-12'>Total pesanan:</span>
                                                        <span className='text-size-14 text-bold'>{Number(item.total_pesanan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                    </div>
                                                </div>

                                                {item.detail_pesanan.map((item, index) => {
                                                    return (

                                                        <div className='item-card' key={index}>
                                                            <div className='cover-img'>
                                                                <img src={item.sampul_menu} alt='foto kosong' />
                                                            </div>
                                                            <div className='text-child'>
                                                                <h4>{item.nama_menu}</h4>
                                                                <p>Jumlah : {item.jumlah}</p>
                                                                <p>Harga satuan : {Number(item.harga_satuan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                                                                <div className="d-flex">
                                                                    <button className="btn-list" onClick={() => RemoveKeranjang(item.id_detail_pesanan)}>
                                                                        <i className="fa fa-trash"></i>
                                                                        <span> Batalkan pesanan</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                                }

                                            </div>

                                        )
                                    })
                                    }

                                </div>

                                {item.detail_transaksi.map((item, index) => {
                                    return (
                                        <div className="card-pembayaran" key={index}>
                                            {!OpenSnap && (
                                                <>
                                                    <h4>Rincian Pembayaran</h4>
                                                    <div className='detail-pembayaran'>
                                                        <div className='d-flex justify-content-beetwen'>
                                                            <span>Subtotal pemesanan</span>
                                                            <span>{Number(item.total_pemesanan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                        </div>
                                                        {/* <div className='d-flex justify-content-beetwen'>
                                                            <span>Biaya admin</span>
                                                            <span>{Number(item.biaya_admin).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                        </div> */}
                                                    </div>
                                                    <div className='d-flex justify-content-beetwen text-bold'>
                                                        <span>Total pembayaran</span>
                                                        <span>{Number(item.total_pembayaran).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                    </div>
                                                    <button className='button-form my-top-1 my-bottom-1' onClick={BuatPesanan}>Buat pesanan
                                                    </button>
                                                </>
                                            )}
                                            {OpenSnap && (
                                                <div className='d-flex justify-content-center w-100'>
                                                    <div id='snap-container'></div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                                }

                            </div>
                        )
                    })
                    }
                </>
            )}
        </section>
    );
}

export default KeranjangPage;
