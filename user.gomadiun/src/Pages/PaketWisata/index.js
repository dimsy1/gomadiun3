import { React, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ContentPaketWisata from './components/Paketwisatacontent';
import Alert from '../../modal/alert';
import { debounce } from 'lodash';
import Lottie from 'lottie-react';
import animationData from "../assets/js/loading.json"

function PaketWisata() {

  const [PaketWisataDatas, setPaketWisataData] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [onshow, setOnshow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = PaketWisataDatas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(PaketWisataDatas.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };


  const searchKeyword = (event) => {
    setLoading(true);
    const value = event.target.value;
    setKeyword(value);
    debounceGetData(value);
  };

  const debounceGetData = useCallback(
    debounce((value) => {
      getData(value);
    }, 1000),
    []
  );

  const toogleOnclose = () => {
    setOnshow(false);
  };

  const getData = async (searchTerm = '') => {
    setLoading(true);
    try {
      const url = searchTerm
        ? `${process.env.REACT_APP_BACKEND_API_URL}/api/paket_wisata/get_all?keyword=${searchTerm}`
        : `${process.env.REACT_APP_BACKEND_API_URL}/api/paket_wisata/get_all`;

      const response = await axios.get(url);
      if (response) {
        setPaketWisataData(response.data.data);
        setLoading(false);
        toogleOnclose();
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setOnshow(true);
        setLoading(false);
        setPaketWisataData(error.response.data.data);
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
    getData();
  }, []);

  return (
<section className='desawisata'>
      {/* HERO */}
      <div className="hero-paketwisata">
        <div className="hero-paketwisata-overlay">
  <div className="hero-paketwisata-title">
    <h1>Paket Wisata</h1>
  </div>
  <div className="hero-paketwisata-subtitle">
    <p>Temukan paket wisata kamu dan jelajahi destinasi wisata di Kabupaten Madiun</p>
  </div>
</div>
</div>

      <div className='d-flex flex-row justify-content-center'>
        <div className="sidebar-paketwisata-all">
          <span className='fw-bold' style={{ color : "#06647B" }}><i className="fa-solid fa-search"></i> Temukan Paket Wisata</span>
          <div className="form-group py-3">
            <input
              type="text"
              className="form-control"
              placeholder="Cari"
              value={keyword}
              onChange={searchKeyword}
            />
          </div>
        </div>

        {PaketWisataDatas != 0 ? (
          <ContentPaketWisata
  dataPaketWisata={currentItems}
  isLoading={loading}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>

        ) : (
          <div className="content-berita">
            <div className='berita-container justify-content-center'>
              <div className='d-flex' style={{ height: 200, width: 200 }}>
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

      {message !== '' && (
        <Alert show={onshow} onClose={toogleOnclose} status={"Info"} message={message} />
      )}
    </section>
  );
}

export default PaketWisata;
