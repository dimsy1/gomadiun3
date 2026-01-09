import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BeritaDetail.css';

const DetailBerita = () => {
  const { id } = useParams();
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Opsi 1: Format tanggal dengan jam (sesuai database)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  // Opsi 2: Format tanggal saja (tanpa jam)
  const formatDateOnly = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  // Opsi 3: Format custom dengan hari
  const formatDateWithDay = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/berita/detail/${id}`);
        setBerita(res.data.data);
      } catch (err) {
        console.error('Gagal mengambil data berita:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (!berita) return <div className="detail-error">Berita tidak ditemukan.</div>;

  return (
    <>
      <div className='desawisata-header my-bottom-0'></div>
      <div className="detail-berita-container">
        {/* Pilih salah satu format yang diinginkan */}
        {/* <div className="detail-date">{formatDate(berita.createdAt)}</div> */}
        {/* <div className="detail-date">{formatDateOnly(berita.createdAt)}</div> */}
        <div className="detail-date">{formatDateWithDay(berita.createdAt)}</div>
        
        <img src={berita.sampul_berita} alt="Sampul Berita" className="detail-image" />
        <h1 className="detail-title">{berita.title}</h1>
        <div
          className="detail-content"
          dangerouslySetInnerHTML={{ __html: berita.content }}
        />
      </div>
    </>
  );
};

export default DetailBerita;