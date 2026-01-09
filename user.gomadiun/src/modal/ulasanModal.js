import React, { useState } from 'react';
import axios from 'axios';

function UlasanModal({
  isOpen,
  isClose,
  closeModal,
  id,
  id_paket_wisata,
  id_pesanan,
  rate,
  setRate,
  ulasan,
  setUlasan,
  errormessage,
  messageAlert,
  type // 'wisata' atau 'paket_wisata'
}) {
  const [loading, setLoading] = useState(false);

  const handleAddUlasan = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi ID yang sesuai berdasarkan type
    const ulasanId = type === 'paket_wisata' ? id_paket_wisata : id;

    if (!ulasanId || !type) {
      messageAlert("Data ulasan tidak valid. Pastikan ID dan tipe tersedia.");
      setLoading(false);
      return;
    }

    try {
      const apiUrl =
        type === 'paket_wisata'
          ? `${process.env.REACT_APP_BACKEND_API_URL}/api/paket_wisata/add/ulasan/${ulasanId}`
          : `${process.env.REACT_APP_BACKEND_API_URL}/api/wisata/add/ulasan/${ulasanId}`;

      const response = await axios.post(apiUrl, {
        id_pesanan: id_pesanan,
        rate: rate,
        komentar: ulasan,
      });

      if (response.status === 200) {
        setLoading(false);
        messageAlert(response.data.message);
        closeModal();
      }
    } catch (error) {
      if (error.response?.status === 422) {
        console.log("Ulasan error:", error.response);
        messageAlert(error.response.data.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className={`modal-content ${isClose ? 'animasiDown' : 'animasiUp'}`}>
        <div className='cover-close'>
          <span className='text-bold text-size-14'>Ulasan dan Penilaian</span>
          <span className="close" onClick={closeModal}>&times;</span>
        </div>
        {errormessage !== null && (
          <span className='text-size-10 text-danger my-1'>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 5 }} /> {errormessage}
          </span>
        )}
        <form onSubmit={handleAddUlasan} className='form py-1'>
          <div className='d-flex w-100 flex-column align-item-center justify-content-center'>
            <div className='my-top-1'>
              <span>Bagaimana pengalamanmu tentang ini?</span>
            </div>
            <div className='rating my-4'>
              <label>
                <input type="radio" name="stars" value="1" onChange={(e) => setRate(e.target.value)} />
                <span class="icon">★</span>
              </label>
              <label>
                <input type="radio" name="stars" value="2" onChange={(e) => setRate(e.target.value)} />
                <span class="icon">★</span>
                <span class="icon">★</span>
              </label>
              <label>
                <input type="radio" name="stars" value="3" onChange={(e) => setRate(e.target.value)} />
                <span class="icon">★</span>
                <span class="icon">★</span>
                <span class="icon">★</span>
              </label>
              <label>
                <input type="radio" name="stars" value="4" onChange={(e) => setRate(e.target.value)} />
                <span class="icon">★</span>
                <span class="icon">★</span>
                <span class="icon">★</span>
                <span class="icon">★</span>
              </label>
              <label>
                <input type="radio" name="stars" value="5" onChange={(e) => setRate(e.target.value)} />
                <span class="icon">★</span>
                <span class="icon">★</span>
                <span class="icon">★</span>
                <span class="icon">★</span>
                <span class="icon">★</span>
              </label>
            </div>
          </div>
          <div className="form-group py-2">
            <textarea
              className='my-top-1'
              name="ulasan"
              value={ulasan}
              onChange={(e) => setUlasan(e.target.value)}
              rows="3"
              style={{ width: '100%' }}
              placeholder='Masukkan ulasan Anda'
            />
          </div>
          <button className='button-form my-1' type="submit" style={{backgroundColor : "#06647B" }}>Submit
            {loading ? (
              <svg className="spinner" viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
              </svg>
            ) : (
              <div></div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UlasanModal;
