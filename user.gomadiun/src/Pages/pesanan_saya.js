import { React, useState, useCallback, useEffect } from 'react';
import unsLogo from "./../landingPage/assets/img/unsLogo.png"
import svLogo from "./../landingPage/assets/img/svLogo.png"
import lppmLogo from "./../landingPage/assets/img/lppmLogo.png"
import d3tiunsLogo from "./../landingPage/assets/img/d3tiunsLogo.png"
import kabmadiunLogo from "./../landingPage/assets/img/kabmadiunLogo.png"
import wonderfulLogo from "./../landingPage/assets/img/wonderfulLogo.png"
import kedairekaLogo from "./../landingPage/assets/img/kedairekaLogo.png"
import Lottie from 'lottie-react';
import not_found from './assets/js/not_found.json';
import axios from 'axios';
import loadingAnimation from './assets/js/loading.json';
// import Countdown from './countdown';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import QRCode from 'qrcode.react';
import useSnap from './hooks/useSnap';
import UlasanModal from '../modal/ulasanModal';

function PesananKuPage({
    showAlert,
    messageAlert,
    nameAlert
}) {
    moment.locale('id');
    const [open, setOpen] = useState(false);
    const [close, setClose] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
    const [DataPesanan, setDataPesanan] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [OpenSnap, setOpenSnap] = useState(""); // Tidak diperlukan lagi untuk Snap Popup
    const [OpenDetail, setOpenDetail] = useState("");
    const [message, setMessage] = useState('');
    const [id, setId] = useState();
    const [type, setType] = useState(null);
    const [idPaketWisata, setIdPaketWisata] = useState(null);

    const [idpesanan, setIdpesanan] = useState();
    const navigate = useNavigate();
    
    // UBAH DISINI: Gunakan snapPay bukan snapEmbed
    const { snapPay } = useSnap();

    const [rate, setRate] = useState();
    const [ulasan, setUlasan] = useState();
    const [errormessage, messageAlerts] = useState(null);

    const getData = useCallback(async () => {
        setDataPesanan([])
        setLoading(true);
        try {
            let response
            if (activeTab === 1) {
                response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/pesanan/belum_bayar`)
            } else if (activeTab === 2) {
                response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/pesanan/eticket`)
            } else if (activeTab === 3) {
                response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/pesanan/selesai`)
            } else if (activeTab === 4) {
                response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/pesanan/dibatalkan`)
            }
            if (response) {
                setMessage("data ada")
                setDataPesanan(response.data.data)
                console.log(response.data.data)
                setLoading(false);
            }
        } catch (error) {
            if (error.response.status === 401) {
                setLoading(false);
                navigate('/');
            }
            else if (error.response.status === 422) {
                setMessage(error.response.data.message)
                setLoading(false);
            } else {
                console.log(error.response)
            }
        }
    }, [activeTab, navigate])

    useEffect(() => {
        getData();
    }, [getData]);

    const BatalkanPesanan = async (id_pembayaran) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/pesanan/${id_pembayaran}?keterangan=Pesanan dibatalkan oleh pengguna`);

            if (response) {
                messageAlert(response.data.message);
                nameAlert('Success');
                showAlert();
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.log(error);
            alert("Gagal membatalkan pesanan. Silakan coba lagi.");
        }
    };

    // REVISI FUNGSI BAYAR PESANAN MENGGUNAKAN SNAPPAY (POPUP)
    const BayarPesanan = async (id_pembayaran) => {
        try {
            // Ambil token dari Backend
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/reopen-payment/${id_pembayaran}`);

            if (response && response.data && response.data.snapToken) {
                const { snapToken } = response.data;

                // Panggil snapPay (Popup Mode)
                snapPay(snapToken, {
                    onSuccess: function (result) {
                        console.log("Payment Success", result);
                        removeQueryParameters();
                        // Redirect atau Refresh data
                        // navigate(`/pesananku`); // Opsional, atau reload:
                        window.location.reload(); 
                    },
                    onPending: function (result) {
                        console.log("Payment Pending", result);
                        removeQueryParameters();
                        // navigate(`/pesananku`);
                        window.location.reload();
                    },
                    onError: function (result) {
                        console.log("Payment Error", result);
                        alert("Pembayaran Gagal/Error");
                    },
                    onClose: function () {
                        console.log("Customer closed the popup");
                        removeQueryParameters();
                        // User tutup popup, tidak perlu reload halaman jika belum bayar, 
                        // tapi kalau mau refresh status bisa: window.location.reload();
                    }
                });
            } else {
                console.error("No payment data received", response);
                alert("Terjadi kesalahan, data pembayaran tidak ditemukan.");
            }
        } catch (error) {
            console.error("Error during payment process", error);
            alert("Terjadi kesalahan saat memproses pembayaran.");
        }
    }; 

    const handleCetakPdf = async (item, data_pembayaran) => {
        const html2pdf = (await import('html2pdf.js')).default;
        const namaFile = `E-Ticket-${item.kode_pesanan}.pdf`;
        const element = document.createElement('div');
        element.innerHTML = `
            <div style="font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; width: 700px; background: #fff;">
                <h2 style="text-align:center; margin-bottom: 20px; color: #06647B;">E-TICKET GO MADIUN</h2>
                <div style="border: 2px solid #06647B; border-radius: 15px; overflow: hidden; display: flex; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    
                    <div style="flex: 2; padding: 25px; border-right: 2px dashed #ccc;">
                        <div style="color: #2F67C1; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">E-TICKET</div>
                        <div style="font-size: 22px; font-weight: 800; margin: 5px 0 10px 0; color: #000;">${item.nama_destinasi}</div>
                        <div style="font-size: 11px; color: #777; margin-bottom: 20px;">Kode Pemesanan: <strong>${item.kode_pesanan}</strong></div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
                            <div>
                                <div style="font-size: 9px; color: #999; text-transform: uppercase;">Berlaku Sampai</div>
                                <div style="font-size: 12px; font-weight: 700; color: #2F67C1;">${formatDateStringDay(item.tgl_booking)}</div>
                                <div style="font-size: 12px;">${formatTime(item.tgl_booking)}</div>
                            </div>
                            <div>
                                <div style="font-size: 9px; color: #999; text-transform: uppercase;">Kategori</div>
                                <div style="font-size: 12px; font-weight: 600;">
                                    ${item.jenis_destinasi === "tbl_destinasi" ? "Wisata" : 
                                      item.jenis_destinasi === "tbl_paket_wisata" ? "Paket Wisata" : 
                                      item.jenis_destinasi === "tbl_kuliner" ? "Kuliner" : "Penginapan"}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 9px; color: #999; text-transform: uppercase;">Pemesan</div>
                                <div style="font-size: 12px; font-weight: 600;">${data_pembayaran.wisatawan_detail_as.nama_lengkap}</div>
                            </div>
                            <div>
                                <div style="font-size: 9px; color: #999; text-transform: uppercase;">No. Telp</div>
                                <div style="font-size: 12px; font-weight: 600;">${data_pembayaran.wisatawan_detail_as.no_hp}</div>
                            </div>
                        </div>
                    </div>

                    <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f4f8fb;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.kode_qr}" style="width: 120px; height: 120px; mix-blend-mode: multiply;" />
                        <div style="font-size: 10px; color: #555; margin-top: 10px; text-align: center;">Scan di Lokasi</div>
                    </div>
                </div>
                <div style="margin-top: 15px; font-size: 10px; color: #aaa; text-align: center;">
                    Tiket ini diterbitkan oleh GoMadiun.
                </div>
            </div>
        `;

        const options = {
            margin: 10,
            filename: namaFile,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true }, 
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(options).from(element).save();
    };
    const removeQueryParameters = () => {
        const url = new URL(window.location);
        url.search = ''; 
        window.history.replaceState({}, document.title, url.pathname);
    };


    const openMenu = (id) => {
        setActiveTab(id)
    };

    const ToggleOpenDetail = (id) => {
        if (OpenDetail === id) {
            setOpenDetail('')
        } else {
            setOpenDetail(id)
        }
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD HH:mm a');
    };

    const formatDateString = (dateString) => {
        return moment(dateString).format('DD MMMM YYYY HH:mm a');
    };

    const formatDateStringDay = (dateString) => {
        return moment(dateString).format('dddd, DD MMMM YYYY');
    };

    const formatTime = (dateString) => {
        return moment(dateString).format('hh:mm A');
    };
    const Navigate = (href) => {
        navigate(`${href}`);
    };

    const handleOpenModal = (idDestinasi, id_pesanan, jenis) => {
        setId(idDestinasi);
        setIdpesanan(id_pesanan);

        if (jenis === "tbl_paket_wisata") {
            setType("paket_wisata");
            setIdPaketWisata(idDestinasi);
        } else if (jenis === "tbl_destinasi") {
            setType("wisata");
            setIdPaketWisata(null);
        }

        setOpen(true);
        setClose(false);
    };

    const handleCloseModal = () => {
        messageAlerts(null)
        setRate()
        setUlasan('')
        setClose(true);
        setTimeout(() => {
            setOpen(false);
        }, 180);
    };

    return (
        <section>
            <div className='desawisata-header'></div>
            <h2 className="text-center my-top-3 text-bold" style={{ fontFamily: "Poppins" }}>Pesanan Saya</h2>
            <div className="pesanan-container">
                <div className="menu-pesanan-container" >
                    <ul className="menu-pesanan-list">
                        <li>
                            <span className={`menu-pesanan-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => openMenu(1)}>
                                Belum Bayar
                            </span>
                        </li>
                        <li>
                            <span className={`menu-pesanan-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => openMenu(2)}>
                                E-Tiket
                            </span>
                        </li>
                        <li>
                            <span className={`menu-pesanan-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => openMenu(3)}>
                                Selesai
                            </span>
                        </li>
                        <li>
                            <span className={`menu-pesanan-item ${activeTab === 4 ? 'active' : ''}`} onClick={() => openMenu(4)}>
                                Dibatalkan
                            </span>
                        </li>
                    </ul>
                </div>
                <div style={{ display: activeTab === 1 ? 'flex' : 'none', flexWrap: 'wrap', marginBottom: "80px" }}>
                    {loading ? (
                        <div className='w-100 d-flex py-5 flex-column align-item-center my-top-5'>
                            <div className='d-flex' style={{ height: 196, width: 200 }}>
                                <Lottie
                                    animationData={loadingAnimation}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {DataPesanan.length === 0 ? (
                                <div className='w-100 d-flex py-5 flex-column align-item-center my-top-2'>
                                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                                        <Lottie
                                            animationData={not_found}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                    <p className='text-default text-size-14 text-bold'>{message}</p>
                                </div>
                            ) : (
                                <div className='container-pesanan justify-content-end'>
                                    {DataPesanan.map((pembayaran, index) => {
                                        return (
                                            <div className='card-pesanan belum_bayar' key={index}>
                                                <div className='d-flex flex-column justify-content-beetwen w-100'>
                                                    {pembayaran.pesanan.map((item, index) => {
                                                        return (
                                                            <div key={index}>
                                                                <div className='d-flex flex-column'>
                                                                    <div className='d-flex flex-column'>
                                                                        <span className='text-size-14 text-bold py-2'>{item.nama_destinasi}</span>
                                                                    </div>
                                                                    {item.detail_pesanan.map((item, index) => {
                                                                        return (
                                                                            <div className='d-flex flex-row under-line my-top-1 py-bottom-1 ' key={index}>
                                                                                <div className='cover-img-menu'>
                                                                                    <img src={item.sampul_menu} alt='foto kosong' />
                                                                                </div>
                                                                                <div className='d-flex flex-column mx-left-1 w-100'>
                                                                                    <span className='text-size-12 text-secondary text-bold'>{item.nama_menu}</span>
                                                                                    <div className='d-flex flex-column align-item-end'>
                                                                                        <span className='text-size-10 text-secondary'>x {item.jumlah}</span>
                                                                                        <span className='text-size-10 text-secondary'>{Number(item.harga_satuan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                    <div className='d-flex flex-column under-line px-2'>
                                                                        <div className='d-flex justify-content-beetwen'>
                                                                            <span className='text-size-10 text-secondary py-2'>{item.detail_pesanan.length} Menu</span>
                                                                            <span className='text-size-10 text-secondary py-2'>Total pesanan: <span className='text' >{Number(item.total_pesanan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span></span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                    <div className='d-flex flex-column'>
                                                        <div className='d-flex flex-row justify-content-end'>
                                                            <div className='d-flex flex-column align-item-end my-3'>
                                                                <span className='text-size-10 text-secondary'>Total Pembayaran</span>
                                                                <span className='text-size-14 text-bold' style={{ color: "#F0A44F", fontWeight: "600" }}>
                                                                    {Number(pembayaran.total_pembayaran).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className='d-flex my-bottom-1'>
                                                            <button className='button-form mx-left-1' style={{ backgroundColor: "#06647B" }} onClick={() => BayarPesanan(pembayaran.id_pembayaran)}>
                                                                Bayar Sekarang
                                                            </button>
                                                            <button
                                                                className='button-form mx-left-1'
                                                                style={{ backgroundColor: "#C0392B" }}
                                                                onClick={() => {
                                                                    if (window.confirm("Yakin ingin membatalkan pesanan ini?")) {
                                                                        BatalkanPesanan(pembayaran.id_pembayaran)
                                                                    }
                                                                }}

                                                            >
                                                                Batalkan Pesanan
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div style={{ display: activeTab === 2 ? 'flex' : 'none', flexWrap: 'wrap' }}>
                        {loading ? (
                            <div className='w-100 d-flex py-5 flex-column align-item-center my-top-5'>
                                <div className='d-flex' style={{ height: 196, width: 200 }}>
                                    <Lottie
                                        animationData={loadingAnimation}
                                        loop={true}
                                        autoplay={true}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {DataPesanan.length === 0 ? (
                                    <div className='w-100 d-flex py-5 flex-column align-item-center my-top-2'>
                                        <div className='d-flex' style={{ height: 200, width: 200 }}>
                                            <Lottie
                                                animationData={not_found}
                                                loop={true}
                                                autoplay={true}
                                            />
                                        </div>
                                        <p className='text-default text-size-14 text-bold'>{message}</p>
                                    </div>
                                ) : (
                                    <div className='container-pesanan justify-content-end'>
                                        {DataPesanan.map((pembayaran, index) => {
                                            return (
                                                <div key={index}>
                                                    {pembayaran.pesanan.map((item, index) => {
                                                        return (
                                                            <div className='card-pesanan' key={index}>
                                                                <div className='d-flex flex-column'>
                                                                    <div className='d-flex flex-column under-line py-3'>
                                                                        <div className="e-ticket">
                                                                            <div className="e-ticket--start">
                                                                                <div className="e-ticket--start--col px-4">
                                                                                    <div className="e-ticket--start--row">
                                                                                        <div className="e-ticket--start--col">
                                                                                            <span style={{ color: "#2F67C1", fontWeight: "600" }}>e-ticket</span>
                                                                                            <strong>{item.nama_destinasi}</strong>
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className="text-size-9 text-secondary my-1">Kode pemesanan: {item.kode_pesanan}</span>
                                                                                </div>
                                                                                <div className="e-ticket--center--row px-4 my-top-1">
                                                                                    <div className="e-ticket--center--col">
                                                                                        <span className="e-ticket--info--title">Berlaku sampai</span>
                                                                                        <span className="e-ticket--info--subtitle" style={{ color: "#2F67C1", fontWeight: "600" }}>{formatDateStringDay(item.tgl_booking)}</span>
                                                                                        <span className="e-ticket--info--content">{formatTime(item.tgl_booking)}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="e-ticket--center">
                                                                                <div className="e-ticket--center--row">
                                                                                    <div className="e-ticket--center--col">
                                                                                        <span className="e-ticket--info--title">Pemesan</span>
                                                                                        <span className="e-ticket--info--content">{pembayaran.wisatawan_detail_as.nama_lengkap}</span>
                                                                                    </div>
                                                                                    <div className="e-ticket--center--col">
                                                                                        <span className="e-ticket--info--title">Telp. pemesan</span>
                                                                                        <span className="e-ticket--info--content">{pembayaran.wisatawan_detail_as.no_hp}</span>
                                                                                    </div>
                                                                                    <div className="e-ticket--center--col">
                                                                                        <span className="e-ticket--info--title">Kategori e-ticket</span>
                                                                                        {item.jenis_destinasi === "tbl_destinasi" && <span className="e-ticket--info--content">Wisata</span>}
                                                                                        {item.jenis_destinasi === "tbl_paket_wisata" && <span className="e-ticket--info--content">Paket Wisata</span>}
                                                                                        {item.jenis_destinasi === "tbl_kuliner" && <span className="e-ticket--info--content">Kuliner</span>}
                                                                                        {item.jenis_destinasi === "tbl_penginapan" && <span className="e-ticket--info--content">Penginapan</span>}
                                                                                    </div>
                                                                                </div>
                                                                                <div className='d-flex flex-column my-top-3'>
                                                                                    <div className="d-flex justify-content-beetwen my-bottom-1">
                                                                                        <img src={unsLogo} alt='logo' className='mx-right-1' height={30} />
                                                                                        <img src={svLogo} alt='logo' className='mx-right-1' height={30} />
                                                                                        <img src={lppmLogo} alt='logo' className='mx-right-1' height={30} />
                                                                                        <img src={d3tiunsLogo} alt='logo' className='mx-right-1' height={30} />
                                                                                        <img src={kabmadiunLogo} alt='logo' className='mx-right-1' height={30} />
                                                                                        <img src={wonderfulLogo} alt='logo' className='mx-right-1' height={30} />
                                                                                        <img src={kedairekaLogo} alt='logo' className='mx-right-1' height={30} />
                                                                                    </div>
                                                                                    <span className='text-size-9 text-secondary'>Kerjasama Dinas Pariwisata Pemuda dan Olahraga dengan D3 Teknik Informatika PSDKU UNS Madiun</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="e-ticket--end">
                                                                                <div className='cover-qr'>
                                                                                    <QRCode value={item.kode_qr} />
                                                                                    <div className='d-flex flex-column align-item-center my-top-1'>
                                                                                        <span className='e-ticket--info--content px-2'>Dipesan: {formatDateString(item.tgl_pesanan)}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className='d-flex flex-column under-line px-2 my-bottom-1' onClick={() => ToggleOpenDetail(item.id_pesanan)} style={{ cursor: 'pointer' }}>
                                                                        <div className='d-flex justify-content-beetwen align-item-center'>
                                                                            <span className='text-size-10 text-secondary py-2'>Lihat detail</span>
                                                                            {OpenDetail === item.id_pesanan ? (
                                                                                <i className="fa-solid fa-caret-down"></i>
                                                                            ) : (
                                                                                <i className="fa-solid fa-caret-right"></i>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {OpenDetail === item.id_pesanan && (
                                                                        <div className='d-flex flex-column justify-content-beetwen px-2'>
                                                                            {item.detail_pesanan.map((item, index) => {
                                                                                return (
                                                                                    <div className='d-flex flex-row under-line py-3' key={index}>
                                                                                        <div className='cover-img-menu'>
                                                                                            <img src={item.sampul_menu} alt='foto kosong' />
                                                                                        </div>
                                                                                        <div className='d-flex flex-column mx-left-1 w-100'>
                                                                                            <span className='text-size-12 text-secondary text-bold'>{item.nama_menu}</span>
                                                                                            <div className='d-flex flex-column align-item-end'>
                                                                                                <span className='text-size-10 text-secondary px-2'>x {item.jumlah}</span>
                                                                                                <span className='text-size-10 text-secondary px-2'>{Number(item.harga_satuan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                            <div className='d-flex flex-column under-line px-2 my-bottom-1'>
                                                                                <div className='d-flex justify-content-beetwen'>
                                                                                    <span className='text-size-10 text-secondary py-2'>{item.detail_pesanan.length} Menu</span>
                                                                                    <span className='text-size-10 text-secondary py-2'>Total pesanan: <span className='text-default' style={{ color: "#F0A44F", fontWeight: "600" }}>{Number(item.total_pesanan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span></span>
                                                                                </div>
                                                                            </div>
                                                                            <div className='d-flex flex-column px-2'>
                                                                                <span className='text-size-12 text-secondary'>Status Pembayaran</span>
                                                                                <span className='text-size-10' style={{ color: "#4FBBFF", fontWeight: "600" }}>PAID</span>
                                                                            </div>
                                                                            <div className='d-flex flex-column my-top-1 px-2'>
                                                                                <span className='text-size-12 text-secondary'>Metode Pembayaran</span>
                                                                                <span className='text-size-10 text-secondary'>{pembayaran.metode_pembayaran}</span>
                                                                            </div>
                                                                            <div className='my-top-1 px-2'>
                                                                                <div className='d-flex flex-row justify-content-beetwen w-100'>
                                                                                    <span className='text-size-10'>Kode pesanan</span>
                                                                                    <span className='text-size-10'>{item.kode_pesanan}</span>
                                                                                </div>
                                                                                <div className='d-flex flex-row justify-content-beetwen w-100 text-secondary'>
                                                                                    <span className='text-size-10'>Tanggal Pemesanan</span>
                                                                                    <span className='text-size-10'>{formatDate(item.tgl_pesanan)}</span>
                                                                                </div>
                                                                                <div className='d-flex flex-row justify-content-beetwen w-100 text-secondary my-bottom-1'>
                                                                                    <span className='text-size-10'>Tanggal Pembayaran</span>
                                                                                    <span className='text-size-10'>{formatDate(pembayaran.tgl_pembayaran)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className='d-flex justify-content-end my-bottom-1 align-items-center'>
                                                                        <button
                                                                            className='button-form mx-left-1'
                                                                            style={{ width: 150, backgroundColor: "#6c757d" }}
                                                                            onClick={() => handleCetakPdf(item, pembayaran)} 
                                                                        >
                                                                             Cetak E-Tiket
                                                                        </button>
                                                                        <button
                                                                            className='button-form mx-left-1'
                                                                            style={{ width: 150, backgroundColor: "#06647B" }}
                                                                            onClick={() => {
                                                                                if (item.jenis_destinasi === "tbl_destinasi") navigate(`/wisata/${item.id_destinasi}`);
                                                                                else if (item.jenis_destinasi === "tbl_paket_wisata") navigate(`/paket_wisata/${item.id_destinasi}`);
                                                                                else if (item.jenis_destinasi === "tbl_kuliner") navigate(`/kuliner/${item.id_destinasi}`);
                                                                                else if (item.jenis_destinasi === "tbl_penginapan") navigate(`/penginapan/${item.id_destinasi}`);
                                                                            }}
                                                                        >
                                                                            Pesan Lagi
                                                                        </button>
                                                                        {(item.jenis_destinasi === "tbl_destinasi" || item.jenis_destinasi === "tbl_paket_wisata") && (
                                                                            <button
                                                                                className='button-form bg-success mx-left-1'
                                                                                style={{ width: 150, backgroundColor: "#F0A44F" }}
                                                                                onClick={() => handleOpenModal(item.id_destinasi, item.id_pesanan, item.jenis_destinasi)}
                                                                            >
                                                                                Beri Ulasan
                                                                            </button>
                                                                        )}

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                </div>
                <div style={{ display: activeTab === 3 ? 'flex' : 'none', flexWrap: 'wrap' }}>
                    {loading ? (
                        <div className='w-100 d-flex py-5 flex-column align-item-center my-top-5'>
                            <div className='d-flex' style={{ height: 196, width: 200 }}>
                                <Lottie
                                    animationData={loadingAnimation}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {DataPesanan.length === 0 ? (
                                <div className='w-100 d-flex py-5 flex-column align-item-center my-top-2'>
                                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                                        <Lottie
                                            animationData={not_found}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                    <p className='text-default text-size-14 text-bold'>{message}</p>
                                </div>
                            ) : (
                                <div className='container-pesanan justify-content-end'>
                                    {DataPesanan.map((pembayaran, index) => {
                                        return (
                                            <div key={index}>
                                                {pembayaran.pesanan.map((item, index) => {
                                                    return (
                                                        <div className='card-pesanan' key={index}>
                                                            <div className='d-flex flex-column'>

                                                                <div className='w-100 d-flex justify-content-beetwen my-top-1'>
                                                                    <div className='d-flex flex-column'>
                                                                        <span className='text-size-14 text-bold'>{item.nama_destinasi}</span>
                                                                    </div>
                                                                    <div className='d-flex flex-column justify-content-beetwen'>
                                                                        <div className='d-flex flex-column text-end'>
                                                                            <span className='text-size-14 text-secondary' style={{ color: "#27AE60", fontWeight: "600" }}>Pesanan Selesai</span>
                                                                            <span className='text-size-10 text-secondary'>Pada {formatDate(item.tgl_pesanan_selesai)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {item.detail_pesanan.map((item, index) => {
                                                                    return (
                                                                        <div className='d-flex flex-row under-line my-top-1 py-bottom-1 ' key={index}>
                                                                            <div className='cover-img-menu'>
                                                                                <img src={item.sampul_menu} alt='foto kosong' />
                                                                            </div>
                                                                            <div className='d-flex flex-column mx-left-1 w-100'>
                                                                                <span className='text-size-12 text-secondary text-bold'>{item.nama_menu}</span>
                                                                                <div className='d-flex flex-column align-item-end'>
                                                                                    <span className='text-size-10 text-secondary'>x {item.jumlah}</span>
                                                                                    <span className='text-size-10 text-secondary'>{Number(item.harga_satuan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                                <div className='d-flex flex-column under-line px-2 my-bottom-1'>
                                                                    <div className='d-flex justify-content-beetwen'>
                                                                        <span className='text-size-10 text-secondary py-2'>{item.detail_pesanan.length} Menu</span>
                                                                        <span className='text-size-10 text-secondary py-2'>Total pesanan: <span className='text-default'>{Number(item.total_pesanan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span></span>
                                                                    </div>
                                                                </div>
                                                                <div className='d-flex flex-column under-line my-bottom-1 px-2' onClick={() => ToggleOpenDetail(item.id_pesanan)}>
                                                                    <div className='d-flex justify-content-beetwen align-item-center'>
                                                                        <span className='text-size-10 text-secondary py-2'>Lihat detail</span>
                                                                        {OpenDetail === item.id_pesanan ? (
                                                                            <i className="fa-solid fa-caret-down"></i>
                                                                        ) : (
                                                                            <i className="fa-solid fa-caret-right"></i>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {OpenDetail === item.id_pesanan && (
                                                                <div className='d-flex flex-column justify-content-beetwen px-2'>
                                                                    <div>
                                                                        <div className='d-flex flex-column'>
                                                                        </div>
                                                                        <div className='d-flex flex-row justify-content-beetwen'>
                                                                            <span className='text-size-10 text-secondary'>{pembayaran.metode_pembayaran}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className='my-top-1'>
                                                                        <div className='d-flex flex-row justify-content-beetwen w-100'>
                                                                            <span className='text-size-10'>Kode pesanan</span>
                                                                            <span className='text-size-10'>{item.kode_pesanan}</span>
                                                                        </div>
                                                                        <div className='d-flex flex-row justify-content-beetwen w-100 text-secondary'>
                                                                            <span className='text-size-10'>Tanggal Pemesanan</span>
                                                                            <span className='text-size-10'>{formatDate(item.tgl_pesanan)}</span>
                                                                        </div>
                                                                        <div className='d-flex flex-row justify-content-beetwen w-100 text-secondary'>
                                                                            <span className='text-size-10'>Tanggal Pembayaran</span>
                                                                            <span className='text-size-10'>{formatDate(pembayaran.tgl_pembayaran)}</span>
                                                                        </div>
                                                                        <div className='d-flex flex-row justify-content-beetwen w-100 text-secondary my-bottom-1'>
                                                                            <span className='text-size-10'>Tanggal Pesanan Selesai</span>
                                                                            <span className='text-size-10'>{formatDate(item.tgl_pesanan_selesai)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {item.jenis_destinasi === "tbl_destinasi" && (
                                                                <div className='d-flex justify-content-end my-bottom-1'>
                                                                    <button
                                                                        className='button-form mx-left-1'
                                                                        style={{ width: 150, backgroundColor: "#06647B" }}
                                                                        onClick={() => navigate(`/wisata/${item.id_destinasi}`)}
                                                                    >
                                                                        Pesan lagi
                                                                    </button>
                                                                    <button
                                                                        className='button-form bg-success mx-left-1'
                                                                        style={{ width: 150, backgroundColor: "#F0A44F" }}
                                                                        onClick={() => handleOpenModal(item.id_destinasi, item.id_pesanan, item.jenis_destinasi)}
                                                                    >
                                                                        Beri Ulasan
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {item.jenis_destinasi === "tbl_paket_wisata" && (
                                                                <div className='d-flex justify-content-end my-bottom-1'>
                                                                    <button
                                                                        className='button-form mx-left-1'
                                                                        style={{ width: 150, backgroundColor: "#06647B" }}
                                                                        onClick={() => navigate(`/paket_wisata/${item.id_destinasi}`)}
                                                                    >
                                                                        Pesan lagi
                                                                    </button>
                                                                    <button
                                                                        className='button-form bg-success mx-left-1'
                                                                        style={{ width: 150 }}
                                                                        onClick={() => handleOpenModal(item.id_destinasi, item.id_pesanan, item.jenis_destinasi)}
                                                                    >
                                                                        Beri Ulasan
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {item.jenis_destinasi === "tbl_kuliner" && (
                                                                <div className='d-flex justify-content-end my-bottom-1'>
                                                                    <button className='button-form mx-left-1' style={{ width: 150, backgroundColor: "#06647B" }} onClick={() => navigate(`/kuliner/${item.id_destinasi}`)}>Pesan lagi
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {item.jenis_destinasi === "tbl_penginapan" && (
                                                                <div className='d-flex justify-content-end my-bottom-1'>
                                                                    <button className='button-form mx-left-1' style={{ width: 150, backgroundColor: "#06647B" }} onClick={() => navigate(`/penginapan/${item.id_destinasi}`)}>Pesan lagi
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div style={{ display: activeTab === 4 ? 'flex' : 'none', flexWrap: 'wrap' }}>
                    {loading ? (
                        <div className='w-100 d-flex py-5 flex-column align-item-center my-top-5'>
                            <div className='d-flex' style={{ height: 196, width: 200 }}>
                                <Lottie
                                    animationData={loadingAnimation}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {DataPesanan.length === 0 ? (
                                <div className='w-100 d-flex py-5 flex-column align-item-center my-top-2'>
                                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                                        <Lottie
                                            animationData={not_found}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                    <p className='text-default text-size-14 text-bold'>{message}</p>
                                </div>
                            ) : (
                                <div className='container-pesanan justify-content-end'>

                                    {DataPesanan.map((pembayaran, index) => {
                                        return (
                                            <div key={index}>
                                                {pembayaran.pesanan.map((item, index) => {
                                                    return (
                                                        <div className='card-pesanan' key={index}>
                                                            <div className='d-flex flex-column'>

                                                                <div className='w-100 d-flex justify-content-beetwen my-top-1'>
                                                                    <div className='d-flex flex-column'>
                                                                        <span className='text-size-14 text-bold'>{item.nama_destinasi}</span>
                                                                    </div>
                                                                    <div className='d-flex flex-column justify-content-beetwen'>
                                                                        <div className='d-flex flex-column text-end'>
                                                                            <span className='text-size-14 text-danger'>Pembatalan Berhasil</span>
                                                                            <span className='text-size-10 text-secondary'>Pada {formatDate(item.tgl_pesanan_selesai)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {item.detail_pesanan.map((item, index) => {
                                                                    return (
                                                                        <div className='d-flex flex-row under-line my-top-1 py-bottom-1 ' key={index}>
                                                                            <div className='cover-img-menu'>
                                                                                <img src={item.sampul_menu} alt='foto kosong' />
                                                                            </div>
                                                                            <div className='d-flex flex-column mx-left-1 w-100'>
                                                                                <span className='text-size-12 text-secondary text-bold'>{item.nama_menu}</span>
                                                                                <div className='d-flex flex-column align-item-end'>
                                                                                    <span className='text-size-10 text-secondary'>x {item.jumlah}</span>
                                                                                    <span className='text-size-10 text-secondary'>{Number(item.harga_satuan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                                <div className='d-flex flex-column under-line px-2 my-bottom-1'>
                                                                    <div className='d-flex justify-content-beetwen'>
                                                                        <span className='text-size-10 text-secondary py-2'>{item.detail_pesanan.length} Menu</span>
                                                                        <span className='text-size-10 text-secondary py-2'>Total pesanan: <span className='text-default'>{Number(item.total_pesanan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span></span>
                                                                    </div>
                                                                </div>
                                                                <div className='d-flex flex-column under-line my-bottom-1 px-2' onClick={() => ToggleOpenDetail(item.id_pesanan)}>
                                                                    <div className='d-flex justify-content-beetwen align-item-center'>
                                                                        <span className='text-size-10 text-secondary py-2'>Lihat detail</span>
                                                                        {OpenDetail === item.id_pesanan ? (
                                                                            <i className="fa-solid fa-caret-down"></i>
                                                                        ) : (
                                                                            <i className="fa-solid fa-caret-right"></i>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {OpenDetail === item.id_pesanan && (
                                                                <div className='d-flex flex-column justify-content-beetwen px-2'>
                                                                    <div>
                                                                        <div className='d-flex flex-column'>
                                                                        </div>
                                                                        <div className='d-flex flex-row justify-content-beetwen'>
                                                                            <span className='text-size-10 text-secondary'>{pembayaran.metode_pembayaran}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className='my-top-1'>
                                                                        <div className='d-flex flex-row justify-content-beetwen w-100'>
                                                                            <span className='text-size-10'>Kode pesanan</span>
                                                                            <span className='text-size-10'>{item.kode_pesanan}</span>
                                                                        </div>
                                                                        <div className='d-flex flex-row justify-content-beetwen w-100 text-secondary'>
                                                                            <span className='text-size-10'>Tanggal Pemesanan</span>
                                                                            <span className='text-size-10'>{formatDate(item.tgl_pesanan)}</span>
                                                                        </div>
                                                                        <div className='d-flex flex-row justify-content-beetwen w-100 text-secondary'>
                                                                            <span className='text-size-10'>Tanggal Pembayaran</span>
                                                                            <span className='text-size-10'>{formatDate(pembayaran.tgl_pembayaran)}</span>
                                                                        </div>
                                                                        <div className='d-flex flex-row justify-content-beetwen w-100 text-secondary my-bottom-1'>
                                                                            <span className='text-size-10'>Tanggal Pesanan Selesai</span>
                                                                            <span className='text-size-10'>{formatDate(item.tgl_pesanan_selesai)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {item.jenis_destinasi === "tbl_destinasi" && (
                                                                <div className='d-flex justify-content-beetwen align-item-center my-bottom-1'>
                                                                    <div>
                                                                        <span className='text-size-10 text-bold py-2'>NOTE: </span>
                                                                        <span className='text-size-10 text-danger'>{pembayaran.keterangan_pembayaran}</span>
                                                                    </div>
                                                                    <button className='button-form mx-left-1' style={{ width: 150 }} onClick={() => navigate(`/wisata/${item.id_destinasi}`)}>Pesan lagi
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {item.jenis_destinasi === "tbl_paket_wisata" && (
                                                                <div className='d-flex justify-content-beetwen align-item-center my-bottom-1'>
                                                                    <div>
                                                                        <span className='text-size-10 text-bold py-2'>NOTE: </span>
                                                                        <span className='text-size-10 text-danger'>{pembayaran.keterangan_pembayaran}</span>
                                                                    </div>
                                                                    <button className='button-form mx-left-1' style={{ width: 150, backgroundColor : "#06647B" }} onClick={() => navigate(`/paket_wisata/${item.id_destinasi}`)}>Pesan lagi
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {item.jenis_destinasi === "tbl_kuliner" && (
                                                                <div className='d-flex justify-content-beetwen align-item-center my-bottom-1'>
                                                                    <div>
                                                                        <span className='text-size-10 text-bold py-2'>NOTE: </span>
                                                                        <span className='text-size-10 text-danger'>{pembayaran.keterangan_pembayaran}</span>
                                                                    </div>
                                                                    <button className='button-form mx-left-1' style={{ width: 150, backgroundColor : "#06647B" }} onClick={() => navigate(`/kuliner/${item.id_destinasi}`)}>Pesan lagi
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {item.jenis_destinasi === "tbl_penginapan" && (
                                                                <div className='d-flex justify-content-beetwen align-item-center my-bottom-1'>
                                                                    <div>
                                                                        <span className='text-size-10 text-bold py-2'>NOTE: </span>
                                                                        <span className='text-size-10 text-danger'>{pembayaran.keterangan_pembayaran}</span>
                                                                    </div>
                                                                    <button className='button-form mx-left-1' style={{ width: 150, backgroundColor : "#06647B" }} onClick={() => navigate(`/penginapan/${item.id_destinasi}`)}>Pesan lagi
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <UlasanModal
                isOpen={open}
                isClose={close}
                closeModal={handleCloseModal}
                id={id}
                id_paket_wisata={idPaketWisata}
                id_pesanan={idpesanan}
                type={type}
                errormessage={errormessage}
                rate={rate}
                ulasan={ulasan}
                setRate={setRate}
                setUlasan={setUlasan}
                messageAlert={messageAlerts}
            />
        </section >
    );
}

export default PesananKuPage;