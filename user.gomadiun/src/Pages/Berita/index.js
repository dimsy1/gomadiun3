// index.js (Berita)
import { React, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ContentBerita from './components/Beritacontent';
import Alert from '../../modal/alert';
import { debounce } from 'lodash';
import Lottie from 'lottie-react';
import animationData from "./../assets/js/loading.json"

function Berita() {
  const [BeritaDatas, setBeritaData] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [onshow, setOnshow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

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
        ? `${process.env.REACT_APP_BACKEND_API_URL}/api/berita/get_all?keyword=${searchTerm}`
        : `${process.env.REACT_APP_BACKEND_API_URL}/api/berita/get_all`;

      const response = await axios.get(url);
      if (response) {
        setBeritaData(response.data.data);
        setCurrentPage(1); // reset ke halaman 1 jika data berubah
        setLoading(false);
        toogleOnclose();
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setOnshow(true);
        setLoading(false);
        setBeritaData(error.response.data.data);
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

  const totalPages = Math.ceil(BeritaDatas.length / itemsPerPage);
  const currentItems = BeritaDatas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onPageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className='berita'>
      <div className="hero-berita">
        <div className="hero-berita-overlay">
          <div className="hero-berita-title">
            <h1>Berita GoMadiun</h1>
          </div>
          <div className="hero-berita-subtitle">
            <p>Temukan berita terupdate tentang pariwisata Kabupaten Madiun</p>
          </div>
        </div>
      </div>

      <div className="berita-main-wrapper">
  <div className="sidebar-berita-all">
    <span className='fw-bold' style={{ color: "#06647B" }}>
      <i className="fa-solid fa-search"></i> Temukan berita
    </span>
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

  <ContentBerita dataBerita={currentItems} isLoading={loading} />
</div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container mt-4 d-flex justify-content-center gap-2 flex-wrap align-items-center">

          <button
            className="btn btn-outline-secondary"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(pageNumber => {
              return (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              );
            })
            .reduce((acc, curr, idx, arr) => {
              if (idx > 0 && curr - arr[idx - 1] > 1) {
                acc.push('ellipsis');
              }
              acc.push(curr);
              return acc;
            }, [])
            .map((item, index) => {
              if (item === 'ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={item}
                  className={`pagination-button ${item === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </button>
              );
            })}

          <button
            className="btn btn-outline-secondary"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </div>
      )}

      {message !== '' && (
        <Alert show={onshow} onClose={toogleOnclose} status={"Info"} message={message} />
      )}
    </section>
  );
}

export default Berita;
