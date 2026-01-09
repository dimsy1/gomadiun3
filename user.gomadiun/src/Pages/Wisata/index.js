import { React, useState, useEffect, useCallback } from "react";
import axios from "axios";
import ContentWisata from "./components/content";
import Alert from "../../modal/alert";
import { debounce } from "lodash";
import Lottie from "lottie-react";
import animationData from "./../assets/js/loading.json";

function Wisata() {
  const [WisataDatas, setWisataData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [onshow, setOnshow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // atur jumlah item per halaman

  const filteredWisata = WisataDatas.filter((item) => {
    if (!keyword) return true; // Jika tidak ada keyword, tampilkan semua
    return item.nama && item.nama.toLowerCase().includes(keyword.toLowerCase());
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWisata.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(WisataDatas.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const toogleOnclose = () => {
    setOnshow(false);
  };

  const getData = async (searchTerm = "", pageNumber = 1) => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/wisata/get_all?keyword=${searchTerm}&page=${pageNumber}&limit=6`;
      const response = await axios.get(url);
      if (response) {
        setWisataData(response.data.data);
        setLoading(false);
        toogleOnclose();
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setOnshow(true);
        setLoading(false);
        setWisataData(error.response.data.data || []);
        setMessage(error.response.data.message);
        setTimeout(() => {
          toogleOnclose();
        }, 1000);
      } else {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getData(keyword, page);
  }, [page]);

  const debounceGetData = useCallback(
    debounce((value) => {
      setPage(1);
      getData(value, 1);
    }, 1000),
    []
  );

  const searchKeyword = (event) => {
    setLoading(true);
    const value = event.target.value;
    setKeyword(value);
    setCurrentPage(1);
    debounceGetData(value);
  };

  return (
    <section className="desawisata">
      {/* HERO */}
      <div className="hero-desawisata">
        <div className="hero-desawisata-overlay">
          <div className="hero-desawisata-title">
            <h1>Wisata</h1>
          </div>
          <div className="hero-desawisata-subtitle">
            <p>Temukan wisata di Kabupaten Madiun</p>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-center">
        <div className="sidebar-desawisata-all">
          <span className="fw-bold" style={{ color: "#015C91" }}>
            <i className="fa-solid fa-search"></i> Temukan wisata
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

        <ContentWisata
          dataWisata={currentItems}
          isLoading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {message !== "" && (
        <Alert
          show={onshow}
          onClose={toogleOnclose}
          status={"Info"}
          message={message}
        />
      )}
    </section>
  );
}

export default Wisata;
