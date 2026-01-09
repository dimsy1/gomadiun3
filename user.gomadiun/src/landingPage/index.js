import { React, useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import './assets/css/styles.css';
import backgroundImage from './../../src/landingPage/assets/img/background3.jpg'
import ContentDesaWisata from './components/contentdesawisata';
import ContentWisata from './components/contentwisata';
import ContentPaketWisata from './components/contentpaketwisata';
import ContentKuliner from './components/contentKuliner';
import ContentBerita from './components/contentBerita';
import ContentTop from './components/contentTop';
import PaketWisataIcon from "./../landingPage/assets/img/toppaket.png"
import KulinerIcon from "./../landingPage/assets/img/topkuliner.png"
import PenginapanIcon from "./../landingPage/assets/img/toppenginapan.png"
import Lottie from 'lottie-react';
import animationData from './../Pages/assets/js/loading.json';
import not_found from './../Pages/assets/js/not_found.json';
import { useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


function Landing() {
  const [loadingsearch, setLoadingSearch] = useState(false);
  const [DesaWisataDatas, setDesaWisataData] = useState([]);
  const [WisataDatas, setWisataData] = useState([]);
  const [KulinerDatas, setKulinerData] = useState([]);
  const [BeritaDatas, setBeritaData] = useState([]);
  const [TopDatas, setTopData] = useState([]);
  const [RecomendasiDatas, setRecomendasiDatas] = useState([]);
  const [message, setmessage] = useState('');
  const [budget, setBudget] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const navigate = useNavigate();
  const [formattedBudget, setFormattedBudget] = useState('');

const handleSearch = async () => {
  if (!budget || isNaN(budget)) return;

  setLoadingSearch(true);
  await cetak(budget, jumlah);

  // Scroll ke bawah setelah pencarian
  const el = document.getElementById("paket-wisata-result");
  if (el) {
    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth" });
    }, 300); // beri jeda agar hasil sudah ter-render
  }
};

const handleFormattedBudgetChange = (e) => {
  const rawValue = e.target.value.replace(/[^\d]/g, ''); // hapus semua kecuali angka

  if (rawValue === '') {
    setBudget('');
    setFormattedBudget('');
    return;
  }

  const numericValue = parseInt(rawValue, 10);
  if (!isNaN(numericValue)) {
    setBudget(numericValue);
    setFormattedBudget(`Rp ${numericValue.toLocaleString('id-ID')}`);
  }
};




  const getData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/get_all`)
      if (response) {
        setDesaWisataData(response.data.data)
      }
      const response_wisata = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/wisata/get_all`)
      if (response_wisata) {
        setWisataData(response_wisata.data.data)
      }
      const response_kuliner = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/kuliner/get_all`)
      if (response_kuliner) {
        setKulinerData(response_kuliner.data.data)
      }
      const response_berita = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/berita/get_all`)
      if (response_berita) {
        setBeritaData(response_berita.data.data)
      }
    } catch (error) {
      if (error.response.status === 401) {
        console.log(error.response.data.msg);
      }
    }
  }

  useEffect(() => {
    getData();
  }, [])


  const add = () => {
    setLoadingSearch(true);
    const value = jumlah + 1
    setJumlah(value);
    // debounceGetData(budget, value);
  }

  const min = () => {
    // setLoadingSearch(true);
    if (jumlah > 1) {
      setLoadingSearch(true);
      const value = jumlah - 1
      setJumlah(value);
      // debounceGetData(budget, value);
    }
  }

  const searchKeyword = (event) => {
    setLoadingSearch(true);
    const value = event.target.value;
    setBudget(value);
    // debounceGetData(value, jumlah);
  };

  const debounceGetData = useCallback(
    debounce((budget, jumlah) => {
      cetak(budget, jumlah);
    }, 1000),
    []
  );

  const cetak = async (budget, jumlah) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/paket_wisata/recomend`,
        {
          dana: budget,
          jumlah: jumlah
        }
      )
      if (response) {
        setmessage(response.data.message);
        setRecomendasiDatas(response.data.data)
        setLoadingSearch(false);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setmessage(error.response.data.error);
        setRecomendasiDatas([])
        setLoadingSearch(false);
      }
    }
  }
  const Navigate = (href) => {
    navigate(`${href}`);
  };

  return (
    <div>
      <div className="Leanding-header" 
      style={{
    fontFamily: 'Poppins',
    height: '100vh',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}>
  <div className="content-header">
    {/* Text Content */}
    <div className="text-content">
      <h1 className="hero-title">"Jelajahi wisata Madiun dan nikmati keindahannya"</h1>
      <p className="hero-subtitle">Temukan paket wisata sesuai budget yang Anda miliki</p>
    </div>

    {/* Search Form */}
    <div className="form-header">
      <div className="search-wrapper">
        <div className="search-box">
          <i className="fa fa-search search-icon" />
 <input
  className="input-budget"
  type="text"
  placeholder="Berapa budget mu?"
  value={formattedBudget}
  onChange={handleFormattedBudgetChange}
/>

          
        </div>

        <div className="guest-counter">
          <span>{jumlah} Orang</span>
          <div className="counter-buttons">
            <button onClick={add}><i className="fa fa-angle-up" /></button>
            <button onClick={min}><i className="fa fa-angle-down" /></button>
          </div>
        </div>
      <button className="btn-search-budget" onClick={() => handleSearch()}>
  Cari
</button>
      </div>
    </div>
     <p className="hero-info">Masukkan budget dan klik tombol "Cari" untuk melihat rekomendasi</p>
  </div>

        <div className={`footer-header ${budget === '' ? 'my-top-5' : ''}`}>
        </div>
      </div>
      {budget === '' ? (
        <>
      <div className="top-feature-section">
  <div className="top-feature-scroll">
    <div className="top-feature-item" onClick={() => Navigate('/kuliner')}>
      <img src={KulinerIcon} alt="Kuliner" className="top-icon" />
      <div>
        <div className="top-text">
        <h3>Kuliner</h3>
        <p>Tempat Kuliner Modern & Tradisional Terbaik.</p>
        <span className="top-link">lihat selengkapnya &rarr;</span>
      </div>
      </div>
    </div>

    <div className="top-feature-item" onClick={() => Navigate('/penginapan')}>
      <img src={PenginapanIcon} alt="Penginapan" className="top-icon" />
      <div>
        <div className="top-text">
        <h3>Penginapan</h3>
        <p>Penginapan Hotel & Homestay Terbaik.</p>
        <span className="top-link">lihat selengkapnya &rarr;</span>
      </div>
      </div>
    </div>

    <div className="top-feature-item" onClick={() => Navigate('/paketwisata')}>
      <img src={PaketWisataIcon} alt="Paket Wisata" className="top-icon" />
      <div>
        <div className="top-text">
        <h3>Paket Wisata</h3>
        <p>Rencanakan Tour Dengan Paket Wisata Terbaik.</p>
        <span className="top-link">lihat selengkapnya &rarr;</span>
      </div>
      </div>
    </div>
  </div>
</div>


          {TopDatas.length > 0 && (
            <ContentTop dataTop={TopDatas} />
          )}
          {DesaWisataDatas.length > 0 && (
            <ContentDesaWisata dataDesaWisata={DesaWisataDatas} />
          )}
          {WisataDatas.length > 0 && (
            <ContentWisata dataWisata={WisataDatas} />
          )}
          {BeritaDatas.length > 0 && (
              <ContentBerita dataBerita={BeritaDatas} />
          )}
          {KulinerDatas.length > 0 && (
            <ContentKuliner dataKuliner={KulinerDatas} />
          )}
        </>
      ) : (
        <div className="cover-recomend" id="paket-wisata-result">
  <div className="w-100">
    <div className="d-flex flex-row my-bottom-2">
      <span className="mx-1 text-bold text-size-14 mt-4">Hasil Pencarian berdasarkan budget anda</span>
    </div>

    {!loadingsearch ? (
      <>
        {RecomendasiDatas.length === 0 ? (
          <div className="w-100 d-flex py-1 flex-column align-item-center">
            <div className="d-flex" style={{ height: 200, width: 200 }}>
              <Lottie animationData={not_found} loop autoplay />
            </div>
            <p className="text-default text-size-14 text-bold">{message}</p>
          </div>
        ) : (
          <div className="cover-recomended-item d-flex flex-wrap gap-4">
            {RecomendasiDatas.map((item, index) => (
              <div
                key={index}
                className="rekomendasi-card"
                style={{ animationDelay: `${index / 5}s` }}
              >
                 {item.recommended && (
      <span className="recomended-badge">RECOMENDED</span>
    )}
                <img
                  src={item.sampul_paket_wisata}
                  alt={item.nama_paket_wisata}
                  className="rekomendasi-image"
                />
                <div className="rekomendasi-info">
                  <div>
                  {/* <div className="rekomendasi-kategori">
                    {item.kategori_destinasi || "Paket Wisata"}
                  </div> */}
                    <div className="rekomendasi-nama">{item.nama_paket_wisata}</div>
                    <div className="rekomendasi-harga">
                    {item.harga === "GRATIS" ? (
                      <span>GRATIS</span>
                    ) : (
                      <span>
                        {Number(item.harga_paket_wisata).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })}
                      </span>
                    )}
                  </div>
                  
                  </div>
                  <button
                    className="lihat-detail-rekomendasi"
                    onClick={() => Navigate(`paket_wisata/${item.id_paket_wisata}`)}
                  >
                    Lihat Detail →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    ) : (
      <div className="d-flex w-100 justify-content-center">
        <div className="d-flex" style={{ height: 200, width: 200 }}>
          <Lottie animationData={animationData} loop autoplay />
        </div>
      </div>
    )}
  </div>
</div>


     
      )}
    </div>
  );
}

export default Landing;
