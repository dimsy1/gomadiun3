import { React, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/styles.css';
import ContentDetailpaketPaketWisata from './components/content';
import Lottie from 'lottie-react';
import animationData from '../assets/js/loading.json';
import not_found from '../assets/js/not_found.json'

import HeaderDetail from './components/header';
import Rating from '../../landingPage/components/rating';
import moment from 'moment';
import { debounce } from 'lodash';

function PaketWisataDetail({
  showAlert,
  messageAlert,
  nameAlert,
  statusLogin,
  openModal
}) {
  const { id } = useParams();
  const [namaDesa, setnamaDesa] = useState('');
  const [alamatDesa, setalamatDesa] = useState('');
  const [telpDesa, settelpDesa] = useState('');
  const [rate, setRate] = useState('');
  const [selected, setSelected] = useState('');
  const [Detailpaketwisata, setDetailpaketwisata] = useState([]);
  const [ulasanData, setUlasanData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getData = useCallback(async () => {
    // setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/paket_wisata/detail/${id}`)
      if (response) {
        setDetailpaketwisata(response.data.data)
        setnamaDesa(response.data.data[0].nama)
        setalamatDesa(response.data.data[0].alamat)
        settelpDesa(response.data.data[0].no_telp)
        setRate(response.data.data[0].rate)
      }
    } catch (error) {
      if (error.response.status === 422) {
        console.log(error);
        // setLoading(false)
      }
    }
  }, [id])

  const setKeyword = (value) => {
    setLoading(true);
    setSelected(value);
    debounceGetData(value);
  };

  const debounceGetData = useCallback(
    debounce((value) => {
      getUlasan(value);
    }, 1000),
    []
  );

  const getUlasan = async (value = '') => {
    setUlasanData([]);
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/paket_wisata/ulasan/${id}?keyword=${value}`)
      if (response) {
        setUlasanData(response.data.data)
        setLoading(false)
      }
    } catch (error) {
      if (error.response.status === 422) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    getData();
    getUlasan();
  }, [getData]);
  
  const formatDate = (dateString) => {
    return moment(dateString).format('YYYY-MM-DD hh:mm');
  };

  return (
    <section className='desawisata'>
      <div className='desawisata-header my-bottom-0'>
      </div>
      {Detailpaketwisata.length !== 0 && (
        <div className='d-flex flex-column'>
          {/* <HeaderDetail Detailpaketwisata={Detailpaketwisata} /> */}
          <ContentDetailpaketPaketWisata
            Detailpaketwisata={Detailpaketwisata}
            showAlert={showAlert}
            messageAlert={messageAlert}
            nameAlert={nameAlert}
            statusLogin={statusLogin}
            openModal={openModal} />

          <div className="container-rating">
            <div className='d-flex flex-row'>
            

            </div>
            <div className='card-rating'>
              <div className='left-card-rating'>
              <div style={{ textAlign: "center" }}>Ulasan Wisatawan</div>
                <span>{rate}</span>
                <Rating rating={rate} />
              </div>
              <div className='right-card-rating'>
                <button className={selected === '' ? "active" : ""} onClick={() => setKeyword('')}>Semua</button>
                <button className={selected === '5' ? "active" : ""} onClick={() => setKeyword('5')}>5 Bintang</button>
                <button className={selected === '4' ? "active" : ""} onClick={() => setKeyword('4')}>4 Bintang</button>
                <button className={selected === '3' ? "active" : ""} onClick={() => setKeyword('3')}>3 Bintang</button>
                <button className={selected === '2' ? "active" : ""} onClick={() => setKeyword('2')}>2 Bintang</button>
                <button className={selected === '1' ? "active" : ""} onClick={() => setKeyword('1')}>1 Bintang</button>
              </div>
            </div>
            <div className='list-ulasan'>
              {loading ? (
                <div>
                  <div className='d-flex w-100 align-item-center justify-content-center' style={{ height: 250, width: 10 }}>
                    <Lottie
                      animationData={animationData}
                      loop={true}
                      autoplay={true}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {ulasanData.length === 0 ? (
                      <div className='w-100 d-flex py-1 flex-column align-item-center'>
                        <div className='d-flex' style={{ height: 200, width: 200 }}>
                          <Lottie
                            animationData={not_found}
                            loop={true}
                            autoplay={true}
                          />
                        </div>
                        <p className='text-default text-size-14 text-bold'>Belum ada ulasan</p>
                      </div>
                  ) : (
                    <>
                      {ulasanData.map((item, index) => {
                        return (
                          <div className='card-ulasan' key={index}>
                            <img src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${item.detail_wisatawan.profile}`} />
                            <div className='detail-card-ulasan'>
                              <span className='user-title'>{item.detail_wisatawan.name}</span>
                              <Rating rating={item.rate} />
                              <p className='py-2' style={{ whiteSpace: 'pre-wrap' }}>{item.ulasan}</p>
                              <span className='date-text'>{formatDate(item.createdAt)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PaketWisataDetail;
