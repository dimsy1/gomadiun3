import { React, useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";

function ContentDetailDesaWisata({
  Detailwisata,
  showAlert,
  messageAlert,
  nameAlert,
  statusLogin,
  openModal,
}) {
  // ==================================================================
  // LANGKAH 1: Panggil SEMUA Hooks di paling atas, tanpa kondisi.
  // ==================================================================
  const [jumlahWisatawan, setJumlahWisatawan] = useState(1);
  const [date, setDate] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  //360=======
  const [show360Viewer, setShow360Viewer] = useState(false);
  const [tourConfig, setTourConfig] = useState(null);
  const [isLoadingTour, setIsLoadingTour] = useState(false);
  const pannellumContainer = useRef(null);

  const getData = useCallback(async () => {
    // Gunakan guard clause di dalam callback untuk keamanan
    if (statusLogin === "login" && Detailwisata && Detailwisata.length > 0) {
      const wisataId = Detailwisata[0].id; // Akses id dengan aman
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/check?filter[id_destinasi]=${wisataId}&filter[nama_destinasi]=tbl_destinasi`
        );
        if (response.data.data.length > 0) {
          setDate(response.data.data[0].tgl_booking);
          setJumlahWisatawan(response.data.data[0].detail_pesanan[0].jumlah);
        }
      } catch (error) {
        console.log("Gagal mengambil data keranjang:", error);
      }
    }
  }, [statusLogin, Detailwisata]); // Dependensi diubah menjadi prop `Detailwisata`

  //360=====
  useEffect(() => {
    let viewer = null;
    if (show360Viewer && tourConfig && pannellumContainer.current) {
      // Pastikan tidak ada instance lama
      pannellumContainer.current.innerHTML = "";

      // Inisialisasi viewer Pannellum
      viewer = window.pannellum.viewer(pannellumContainer.current, tourConfig);
    }

    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [show360Viewer, tourConfig]);

  if (!Detailwisata || Detailwisata.length === 0) {
    return <div>Memuat data wisata...</div>;
  }

  const wisata = Detailwisata[0];

  const add = () => setJumlahWisatawan(jumlahWisatawan + 1);
  const min = () => {
    if (jumlahWisatawan > 1) setJumlahWisatawan(jumlahWisatawan - 1);
  };

  //360==============================
  const loadVirtualTour = async () => {
    if (!wisata.id) return;
    setIsLoadingTour(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API_URL}/api/wisata/virtual-tour/${wisata.id}`
      );
      setTourConfig(response.data);
      setShow360Viewer(true);
    } catch (error) {
      console.error("Gagal memuat data tur virtual:", error);
      // Tampilkan pesan error kepada pengguna
      alert(error.response?.data?.message || "Gagal memuat tur virtual.");
    } finally {
      setIsLoadingTour(false);
    }
  };

  const AddKeranjang = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/add/ticket`,
        {
          id_menu: wisata.id,
          id_destinasi: wisata.id,
          jumlah: jumlahWisatawan,
          date: date,
        }
      );

      if (response) {
        messageAlert(response.data.message);
        nameAlert("Success");
        showAlert();
      }
    } catch (error) {
      if (error.response?.status === 422) {
        messageAlert(error.response.data.message);
        nameAlert("Warning ");
        showAlert();
      } else if (error.response?.status === 401) {
        openModal();
      } else {
        console.log(error);
      }
    }
  };

  const getColorByHCI = (kategori) => {
    switch (kategori) {
      case "Ideal":
        return "#218838";
      case "Sangat Baik":
        return "#28a745";
      case "Baik":
        return "#8BC34A";
      case "Cukup Baik":
        return "#f1c40f";
      case "Ditoleransi":
        return "#f39c12";
      case "Batas Kondisi Ditoleransi (Umum)":
        return "#e67e22";
      case "Tidak Baik":
        return "#e74c3c";
      case "Sangat Tidak Baik":
        return "#c0392b";
      case "Sangat Ekstrem":
        return "#8e44ad";
      case "Tidak Memungkinkan":
        return "#34495e";
      default:
        return "#bdc3c7";
    }
  };

  const getIconByHCI = (kategori) => {
    const basePath = "/assets/img/weather/"; // Pastikan file sudah di folder public
    const iconStyle = { width: "85px", height: "85px" };

    const getFileName = (kat) => {
      switch (kat) {
        case "Ideal": 
          return "clear-day.svg";
        case "Sangat Baik": 
          return "partly-cloudy-day.svg";
        case "Baik": 
          return "cloudy.svg";
        case "Cukup Baik": 
          return "overcast-day.svg";
        case "Ditoleransi": 
          return "partly-cloudy-day-rain.svg"; // Pengganti yang pas
        case "Batas Kondisi Ditoleransi (Umum)": 
          return "rain.svg";
        case "Tidak Baik": 
          return "thunderstorms-day.svg";
        case "Sangat Tidak Baik": 
          return "thunderstorms-day-rain.svg";
        case "Sangat Ekstrem": 
          return "hurricane.svg"; // Menggunakan file yang ada di screenshot
        case "Tidak Memungkinkan": 
          return "not-available.svg";
        default: 
          return "not-available.svg";
      }
    };

    return (
      <img 
        src={`${basePath}${getFileName(kategori)}`} 
        style={iconStyle} 
        alt={kategori} 
      />
    );
  };

  const getDeskripsiByKategori = (kategori) => {
    switch (kategori) {
      case "Ideal":
        return "Kondisi iklim sempurna. Sangat ideal untuk semua jenis aktivitas wisata di luar ruangan.";
      case "Sangat Baik":
        return "Kondisi sangat nyaman untuk berwisata. Hampir sempurna dan sangat direkomendasikan.";
      case "Baik":
        return "Kondisi iklim yang menyenangkan untuk berlibur, nyaman untuk sebagian besar aktivitas.";
      case "Cukup Baik":
        return "Kondisi iklim dapat diterima, meskipun beberapa faktor cuaca mungkin tidak terasa optimal.";
      case "Ditoleransi":
        return "Kondisi masih bisa ditoleransi, namun faktor seperti panas atau kelembaban mulai terasa mengganggu.";
      case "Batas Kondisi Ditoleransi (Umum)":
        return "Kondisi iklim berada di batas toleransi umum, kurang nyaman untuk kegiatan yang lama di luar ruangan.";
      case "Tidak Baik":
        return "Kondisi iklim tidak baik dan tidak mendukung kenyamanan wisata.";
      case "Sangat Tidak Baik":
        return "Kondisi sangat tidak nyaman. Potensi cuaca yang mengganggu wisata sangat tinggi.";
      case "Sangat Ekstrem":
        return "Kondisi iklim sangat ekstrem dan berisiko. Kegiatan di luar ruangan harus dihindari.";
      case "Tidak Memungkinkan":
        return "Mustahil untuk melakukan kegiatan wisata karena cuaca yang berat.";
      default:
        return "Informasi kategori tidak tersedia.";
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const dateWithTime = moment(selectedDate)
      .set({ hour: 23, minute: 59, second: 0 })
      .format("YYYY-MM-DD HH:mm:ss");
    setDate(dateWithTime);
  };

  // const getMapLink = (iframeLink) => {
  //     if (!iframeLink) return "";
  //     const googleMapsEmbedRegex = /https:\/\/www\\.google\\.com\/maps\/embed\?pb=.*$/;
  //     if (googleMapsEmbedRegex.test(iframeLink)) {
  //         return iframeLink.replace("/embed?", "/maps?q=");
  //     }
  //     return iframeLink;
  // };

  // --- LOGIKA UTAMA UNTUK FILTER DATA CUACA ---
  const newestHciPerDay = new Map();
  if (Array.isArray(wisata.hci_list) && wisata.hci_list.length > 0) {
    wisata.hci_list.forEach((item) => {
      const dateKey = moment(item.tanggal).format("YYYY-MM-DD");
      const existingEntry = newestHciPerDay.get(dateKey);
      const newItemTimestamp = item.created_at
        ? new Date(item.created_at)
        : new Date(0);
      const existingItemTimestamp = existingEntry?.created_at
        ? new Date(existingEntry.created_at)
        : new Date(0);

      if (!existingEntry || newItemTimestamp > existingItemTimestamp) {
        newestHciPerDay.set(dateKey, item);
      }
    });
  }

  const uniqueHciList = Array.from(newestHciPerDay.values()).sort(
    (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
  );
  // --- AKHIR LOGIKA ---

  return (
    <div className="content-detail-wrapper">
      <div className="top-section">
        <div className="image-side">
          <img
            src={wisata.imageUrl}
            alt={wisata.nama}
            className="detail-image"
          />
        </div>
        <div className="description-side">
          <h2 className="title-detail-wisata">{wisata.nama}</h2>
          <p className="description-detail-wisata">{wisata.deskripsi}</p>
          <div className="location-contact">
            <p>
              <i
                className="fas fa-map-marker-alt"
                style={{ color: "#015C91" }}
              ></i>{" "}
              {wisata.alamat}
            </p>
            <p>
              <i className="fas fa-phone-alt" style={{ color: "#015C91" }}></i>{" "}
              {wisata.no_telp}
            </p>
            {wisata.entry_scene_id && (
              <p>
                <button
                  onClick={loadVirtualTour}
                  className="btn-virtual-tour"
                  disabled={isLoadingTour}
                >
                  {isLoadingTour ? (
                    "Memuat..."
                  ) : (
                    <>
                      {" "}
                      <i className="fas fa-vr-cardboard"></i> Lihat Tur Virtual
                      360°{" "}
                    </>
                  )}
                </button>
              </p>
            )}
          </div>

          {show360Viewer && (
            <div className="pannellum-modal-overlay">
              <div className="pannellum-modal-content">
                <button
                  className="pannellum-close-btn"
                  onClick={() => setShow360Viewer(false)}
                >
                  &times;
                </button>
                <div
                  ref={pannellumContainer}
                  style={{ width: "100%", height: "100%" }}
                ></div>
              </div>
            </div>
          )}

          <div className="info-boxes">
            <div className="info-box">
              <h4>Kondisi Jalan</h4>
              <p>
                Kondisi akses jalan menuju ke {wisata.nama}{" "}
                {wisata.status_jalan === "1"
                  ? "cukup bagus"
                  : wisata.status_jalan === "2"
                  ? "lumayan rusak"
                  : "masih jauh dari kata layak"}{" "}
                (
                {wisata.jenis_kendaraan === "1"
                  ? "dapat dilalui kendaraan roda empat dan roda dua"
                  : wisata.jenis_kendaraan === "2"
                  ? "hanya dapat dilalui kendaraan roda dua"
                  : "kendaraan tidak dapat masuk ke destinasi"}
                )
              </p>
            </div>
            <div className="info-box">
              <h4>Fasilitas Wisata</h4>
              <ul>
                {wisata.data_fasilitas.map((item, index) => (
                  <li key={index}>{item.nama_fasilitas_wisata}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-info-grid">
        
        {/* --- KOLOM KIRI: PANEL CUACA MODERN --- */}
        <div className="weather-card-modern">
          <h3 style={{fontSize: "1.2rem", marginBottom: "1.5rem", fontWeight: "500"}}>
            Cuaca destinasi dalam 5 hari ke depan
          </h3>

          {uniqueHciList && uniqueHciList.length > 0 ? (
            <>
              {/* 1. Tabs Hari */}
              <div className="weather-tabs">
                {uniqueHciList.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`btn-weather-tab ${selectedIndex === index ? "active" : ""}`}
                  >
                    {moment(item.tanggal).format("ddd, DD MMM")}
                  </button>
                ))}
              </div>

              {uniqueHciList[selectedIndex] && (
                <>
                  {/* 2. Icon & Suhu Utama */}
                  <div className="weather-main-content" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                    <div style={{width: '90px', height: '90px'}}>
                         {getIconByHCI(uniqueHciList[selectedIndex].hci_kategori)}
                    </div>
                    <span className="weather-temp-big">
                      {Math.round(uniqueHciList[selectedIndex].temp)}°C
                    </span>
                  </div>

                  {/* 3. Deskripsi Singkat */}
                  <div className="weather-desc-text">
                    Terasa seperti {Math.round(uniqueHciList[selectedIndex].temp + 2)}°C | {" "}
                    {uniqueHciList[selectedIndex].hci_kategori} | {" "}
                    {uniqueHciList[selectedIndex].wind < 5 ? "Calm" : "Berangin"}
                  </div>

                  {/* 4. Detail Metrics (Bawah) */}
                  <div className="weather-metrics">
                    <div className="metric-item">
                      <i className="fas fa-wind"></i>
                      <span>{uniqueHciList[selectedIndex].wind} km/h</span>
                    </div>
                    {/* Pressure */}
                    <div className="metric-item">
                      <i className="fas fa-tachometer-alt"></i>
                      <span>{uniqueHciList[selectedIndex].pressure || "-"} hPa</span>
                    </div>
                    {/* Humidity */}
                    <div className="metric-item">
                      <i className="fas fa-tint"></i>
                      <span>{uniqueHciList[selectedIndex].humidity || "-"}%</span>
                    </div>
                    {/* Jarak Pandang */}
                    <div className="metric-item">
                      <i className="fas fa-eye"></i>
                      <span>
                        {uniqueHciList[selectedIndex].visibility 
                          ? `${(uniqueHciList[selectedIndex].visibility / 1000).toFixed(1)} km` 
                          : "-"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
             <p style={{textAlign:'center', marginTop:'2rem'}}>Data cuaca tidak tersedia atau sedang dimuat.</p>
          )}
        </div>

        {/* --- KOLOM KANAN: PANEL BOOKING MODERN --- */}
        <div className="booking-card-modern">
          
          {/* Baris Atas: Harga & Tanggal */}
          <div className="booking-header-row">
            <div className="price-box">
              <label>Harga Tiket</label>
              {wisata.harga === "GRATIS" ? (
                 <div className="price-amount">GRATIS</div>
              ) : (
                <div className="price-amount">
                  {Number(wisata.harga).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0
                  })} 
                  <span className="price-unit"> / orang</span>
                </div>
              )}
            </div>

            <div className="date-box">
              <label>Pilih Tanggal Booking</label>
              <input
                type="date"
                value={moment(date).format("YYYY-MM-DD")}
                onChange={handleDateChange}
                className="input-date-modern"
              />
            </div>
          </div>

          {/* Baris Bawah: Counter & Tombol Action */}
          <div className="booking-action-row">
            <div className="ticket-counter">
              <button className="btn-qty" onClick={min}>-</button>
              <span className="ticket-count-text">{jumlahWisatawan} Tiket</span>
              <button className="btn-qty" onClick={add}>+</button>
            </div>

            <button className="btn-submit-orange" onClick={AddKeranjang}>
              Masukkan Keranjang
            </button>
          </div>

        </div>

      </div>
      {/* AKHIR BAGIAN BAWAH GRID */}

    </div>
  );
}

export default ContentDetailDesaWisata;
