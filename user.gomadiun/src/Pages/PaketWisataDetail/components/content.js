import { React, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function ContentDetailDesaWisata({
    Detailpaketwisata,
    showAlert,
    messageAlert,
    nameAlert,
    statusLogin,
    openModal
}) {
    const [jumlah_wisatawan, setJumlah] = useState(1);
        const [jumlahWisatawan, setJumlahWisatawan] = useState(1);
    const [date, setDate] = useState();
 const paket_wisata = Detailpaketwisata[0];
    const harga = Detailpaketwisata.length > 0 ? Detailpaketwisata[0]?.harga : null;
    const id = Detailpaketwisata.length > 0 ? Detailpaketwisata[0]?.id : null;
    const namaDesa = Detailpaketwisata.length > 0 ? Detailpaketwisata[0]?.nama : null;
    const status_jalan = Detailpaketwisata.length > 0 ? Detailpaketwisata[0]?.status_jalan : null;
    const jenis_kendaraan = Detailpaketwisata.length > 0 ? Detailpaketwisata[0]?.jenis_kendaraan : null;
    const linkIframe = Detailpaketwisata.length > 0 ? Detailpaketwisata[0]?.link_iframe : null;

     const add = () => setJumlahWisatawan(jumlahWisatawan + 1);
    const min = () => {
        if (jumlahWisatawan > 1) setJumlahWisatawan(jumlahWisatawan - 1);
    };

    const AddKeranjang = async () => {
        try {
            console.log("ID Paket Wisata:", id); // Log ID untuk debug
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/add/paket_wisata`, {
                id_menu: id,
                id_destinasi: id,
                jumlah: jumlahWisatawan,
                date: date
            });

            if (response) {
                console.log("Response dari server:", response.data); // Log response untuk debug
                messageAlert(response.data.message);
                nameAlert('Success');
                showAlert();
            }
        } catch (error) {
            if (error.response?.status === 422) {
                messageAlert(error.response.data.message);
                nameAlert('Warning');
                showAlert();
            } else if (error.response?.status === 401) {
                openModal();
            } else {
                console.log("Error:", error); // Log error untuk debug
            }
        }
    };

    const getData = useCallback(async () => {
        try {
            if (statusLogin === "login") {
                console.log("Memanggil API untuk check keranjang dengan ID:", id); // Log ID untuk debug
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/check?filter[id_paket_wisata]=${id}&filter[nama_paket_wisata]=tbl_paket_wisata`);
                console.log("Data dari API check keranjang:", response.data); // Log data untuk debug
                if (response) {
                    setDate(response.data.data[0]?.tgl_booking);
                    setJumlahWisatawan(response.data.data[0]?.detail_pesanan[0]?.jumlah || 1);
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

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        const dateWithTime = moment(selectedDate).set({ hour: 23, minute: 59, second: 0 }).format('YYYY-MM-DD HH:mm:ss');
        setDate(dateWithTime);
    };

    if (Detailpaketwisata.length === 0) {
        return <p>Data paket wisata tidak tersedia.</p>;
    }

     const getMapLink = (iframeLink) => {
        if (!iframeLink) return "";
        const googleMapsEmbedRegex = /https:\/\/www\\.google\\.com\/maps\/embed\?pb=.*$/;
        if (googleMapsEmbedRegex.test(iframeLink)) {
            return iframeLink.replace("/embed?", "/maps?q=");
        }
        return iframeLink;
    };

    return (
        <div className="content-detail-wrapper">
                   <div className="top-section">
                       <div className="image-side-paketwisata">
                           <img src={paket_wisata.imageUrl} alt={paket_wisata.nama} className="detail-image-paketwisata" />
                       </div>
                       <div className="description-side-paketwisata">
                           <h2 className="title-detail-wisata">{paket_wisata.nama}</h2>
                           <p className="description-detail-wisata">{paket_wisata.deskripsi}</p>
                           <div className="location-contact">
                               <p><i className="fas fa-map-marker-alt" style={{ color : "#015C91" }}></i> {paket_wisata.alamat}</p>
                               <p>{paket_wisata.link_iframe && (
                                   <a href={getMapLink(paket_wisata.link_iframe)} target="_blank" rel="noopener noreferrer">
                                       <i className="fas fa-map" ></i> Lihat di Google Maps
                                   </a>
                               )}</p>
                               <p><i className="fas fa-phone-alt" style={{ color : "#015C91" }}></i> {paket_wisata.no_telp}</p>
                           </div>
                           <div className="info-boxes">
                               <div className="info-box">
                                   <h4>Kondisi Jalan</h4>
                                   <p>Kondisi akses jalan menuju ke {paket_wisata.nama} {paket_wisata.status_jalan === '1' ? "cukup bagus" : paket_wisata.status_jalan === '2' ? "lumayan rusak" : "masih jauh dari kata layak"} ({paket_wisata.jenis_kendaraan === '1' ? "dapat dilalui kendaraan roda empat dan roda dua" : paket_wisata.jenis_kendaraan === '2' ? "hanya dapat dilalui kendaraan roda dua" : "kendaraan tidak dapat masuk ke destinasi"})</p>
                               </div>
                               <div className="info-box">
                                   <h4>Fasilitas Wisata</h4>
                                   <ul>
                                       {paket_wisata.data_fasilitas.map((item, index) => (
                                           <li key={index}>{item.nama_fasilitas_paket_wisata}</li>
                                       ))}
                                   </ul>
                               </div>
                           </div>
                       </div>
                       </div>

     <div className="bottom-section-detail">
    <div className="content-paket-wisata">
      <h3 className="judul-content">Keterangan Paket Wisata</h3>
      <div className="isi-content" dangerouslySetInnerHTML={{ __html: paket_wisata.content }} />
    </div>
                           {/* Booking Section Dipindah ke Kanan */}
                           <div className="booking-section-paketwisata">
                               <div className="price-and-ticket">
                                   Harga Tiket
                                   {paket_wisata.harga === "GRATIS" ? (
                                       <span className="free">GRATIS</span>
                                   ) : (
                                       <span className="price">
                                           {Number(paket_wisata.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                           <span className="per-person"> / orang</span>
                                       </span>
                                   )}
                                   <div className="ticket-control" style={{ marginBottom: "15px" }}>
                                       <button className="btn-min" onClick={min}>-</button>
                                       <span>{jumlahWisatawan} Tiket</span>
                                       <button className="btn-add" onClick={add}>+</button>
                                   </div>
                               </div>
                               <div className="date-picker">
                                   <label>Pilih Tanggal Booking</label>
                                   <input type="date" value={moment(date).format('YYYY-MM-DD')} onChange={handleDateChange} className="input-date" />
                               </div>
                               <button className="btn-book" onClick={AddKeranjang}>
                                   Masukkan Keranjang
                               </button>
                           </div>
                       </div>
                       </div>
                   
                                    );
}


export default ContentDetailDesaWisata;
