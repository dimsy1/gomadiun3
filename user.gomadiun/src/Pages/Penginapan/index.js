import { React, useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import Lottie from 'lottie-react';
import animationData from './../assets/js/loading.json';
import Alert from '../../modal/alert';

import PenginapanContent from './components/Penginapancontent';

function PenginapanPage() {
  const [PenginapanDatas, setPenginapanDatas] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [kelasPenginapan, setKelasPenginapan] = useState([]);
  const [kategoriPenginapan, setKategoriPenginapan] = useState([]);
  const [message, setMessage] = useState('');
  const [onshow, setOnshow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Bisa kamu sesuaikan


  const searchKeyword = (event) => {
  setLoading(true);
  const value = event.target.value;
  setKeyword(value);
  setCurrentPage(1); // Tambahkan ini
  debounceGetData(value, kelasPenginapan, kategoriPenginapan);
};


  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    const updatedKelasPenginapan = checked
      ? [...kelasPenginapan, value]
      : kelasPenginapan.filter((item) => item !== value);

    setKelasPenginapan(updatedKelasPenginapan);
    setLoading(true);
    debounceGetData(keyword, updatedKelasPenginapan, kategoriPenginapan);
  };

  const handleCheckboxChangeKategori = (event) => {
    const { value, checked } = event.target;
    const updatedKategoriPenginapan = checked
      ? [...kategoriPenginapan, value]
      : kategoriPenginapan.filter((item) => item !== value);

    setKategoriPenginapan(updatedKategoriPenginapan);
    setLoading(true);
    debounceGetData(keyword, kelasPenginapan, updatedKategoriPenginapan);
  };

  const debounceGetData = useCallback(
    debounce((searchTerm, filterKelas, filterKategori) => {
      getData(searchTerm, filterKelas, filterKategori);
    }, 1000),
    []
  );

  const toogleOnclose = () => setOnshow(false);

  const getData = async (searchTerm = '', filterKelas = [], filterKategori = []) => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/penginapan/get_all?keyword=${searchTerm}&filter[kelas_penginapan]=${filterKelas.join(',')}&filter[kategori_penginapan]=${filterKategori.join(',')}`;
      const response = await axios.get(url);
      if (response) {
        setPenginapanDatas(response.data.data);
        setLoading(false);
        toogleOnclose();
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setOnshow(true);
        setLoading(false);
        setPenginapanDatas(error.response.data.data);
        setMessage(error.response.data.message);
        setTimeout(() => {
          toogleOnclose();
        }, 1000);
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };

  useEffect(() => {
    getData(keyword, kelasPenginapan, kategoriPenginapan);
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = PenginapanDatas.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(PenginapanDatas.length / itemsPerPage);

const handlePageChange = (page) => {
  setCurrentPage(page);
  window.scrollTo(0, 0);
};


  return (
    <section className="penginapan-page">
      {/* HERO */}
      <div className="hero-penginapan">
        <div className="hero-penginapan-overlay">
  <div className="hero-penginapan-title">
    <h1>Penginapan</h1>
  </div>
  <div className="hero-penginapan-subtitle">
    <p>Penginapan terbaik yang ada di Kabupaten Madiun</p>
  </div>
</div>
</div>


      <div className="content-container">
        {/* Sidebar */}
        <div className="sidebar-penginapan-all">
          <div className="search-section">
            <span className="fw-bold" style={{ color : "#06647B" }}><i className="fa-solid fa-search"></i> Cari Penginapan</span>
            <input
              type="text"
              className="form-control my-2"
              placeholder="Cari"
              value={keyword}
              onChange={searchKeyword}
            />
          </div>

          <div className="filter-section mt-4">
            <span className="fw-bold" style={{ color : "#06647B" }}><i className="fa-solid fa-filter"></i> Filter</span>

            <div className="filter-group mt-2">
              <small>Kategori</small>
              <div className="form-check">
                <input type="checkbox" value="Hotel" onChange={handleCheckboxChangeKategori} />
                <label className="mx-2">Hotel</label>
              </div>
              <div className="form-check">
                <input type="checkbox" value="Homestay" onChange={handleCheckboxChangeKategori} />
                <label className="mx-2">Homestay</label>
              </div>
            </div>

            <div className="filter-group mt-4">
              <small>Bintang</small>
              {[5, 4, 3, 2, 1].map((star) => (
                <div className="form-check" key={star}>
                  <input type="checkbox" value={star} onChange={handleCheckboxChange} />
                  <label className="mx-2 text-warning">
                    {Array.from({ length: star }, (_, idx) => (
                      <i className="fa-solid fa-star" key={idx}></i>
                    ))}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {PenginapanDatas.length !== 0 ? (
           <PenginapanContent
  dataPenginapan={currentItems}
  isLoading={loading}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>

          ) : (
            <div className="loading-cards">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="loading-item">
                  <Lottie animationData={animationData} loop autoplay />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {message && <Alert show={onshow} onClose={toogleOnclose} status="Info" message={message} />}
    </section>
  );
}

export default PenginapanPage;
