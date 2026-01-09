import { React, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'lottie-react';
import animationData from "./../assets/js/loading.json";
import HeaderDetail from './components/menulist';

function KulinerDetail({
  showAlert,
  messageAlert,
  nameAlert,
  statusLogin,
  openModal,
  openModalInfo
}) {
  const { id } = useParams();
  const [DataDetailKuliner, setDataDetailKuliner] = useState([]);
  const [DataMenuKuliner, setDataMenuKuliner] = useState([]);
  const [DataKategoriMenuKuliner, setKategoriMenuKuliner] = useState([]);
  const [loading, setLoading] = useState(false);

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/kuliner/${id}`);
      if (response) {
        setDataDetailKuliner(response.data.data);

        const response_kategori = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/kuliner/menu/kategori/${id}`);
        if (response_kategori) {
          setKategoriMenuKuliner(response_kategori.data.data);

          const response_menu = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/kuliner/menu/${id}`);
          if (response_menu) {
            setDataMenuKuliner(response_menu.data.data);
            setLoading(false);
          }
        }
      }
    } catch (error) {
      if (error.response.status === 422) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {  
    getData();
  }, [getData]);

  return ( 
    <section className='desawisata'>
      <div className='desawisata-header my-bottom-4'></div>
    <div className='kuliner-detail'>

      {!loading ? (
        <>
          {DataDetailKuliner.map((item, index) => (
            <div className="kuliner-header" key={index}>
              <div className="kuliner-header-image">
                <img src={item.imageUrl} alt={item.nama} />
              </div>
              <div className="kuliner-header-info">
  <h2>{item.nama}</h2>

  <div className="kuliner-info">
    <i className="fa-solid fa-location-dot" style={{ color : "#015C91" }}></i>
    <span>{item.alamat}</span>
  </div>

  <div className="kuliner-info" >
    <i className="fa-solid fa-phone" style={{ color : "#015C91" }}></i>
    <span>{item.no_telp}</span>
  </div>

  <div className="kuliner-info" style={{ color : "#015C91" }}>
    {item.status_buka === 'Buka' ? (
      <>
        <i className="fa-solid fa-door-open buka-icon" style={{ color : "#015C91" }}></i>
        <span className="status buka">Sedang Buka</span>
      </>
    ) : (
      <>
        <i className="fa-solid fa-door-closed tutup-icon"></i>
        <span className="status tutup">Sedang Tutup</span>
      </>
    )}
  </div>

  <div className="kuliner-info">
    <i className="fa-solid fa-map-location-dot" style={{ color : "#015C91" }}></i>
    <a href={item.link_iframe} target="_blank" rel="noopener noreferrer">Lokasi Google Maps</a>
  </div>
</div>

            </div>
          ))}

          {DataKategoriMenuKuliner.length !== 0 ? (
            <HeaderDetail 
              Detailkuliner={DataDetailKuliner} 
              kategori={DataKategoriMenuKuliner} 
              menuData={DataMenuKuliner} 
              id_destinasi={id}
              showAlert={showAlert}
              messageAlert={messageAlert}
              nameAlert={nameAlert}
              statusLogin={statusLogin}
              openModal={openModal}
              openModalInfo={openModalInfo}
            />
          ) : (
            <div></div>
          )}
        </>
      ) : (
        <div className="loading-container">
          <div className="loading-animation">
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
            />
          </div>
        </div>
      )}
      
    </div>
    </section>
  );
}

export default KulinerDetail;
