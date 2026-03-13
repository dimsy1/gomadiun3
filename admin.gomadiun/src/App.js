import { React, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import 'leaflet/dist/leaflet.css';
import 'react-quill/dist/quill.snow.css'; // gaya default

import TableAdmin from './pages/Users/Admin';
import TableIndustri from './pages/Users/Industri';
import TablePengelola from './pages/Users/Pengelola';
import TableDinas from './pages/Users/Dinas';
import TableWisata from './pages/Destinasi/Wisata';
import TableBerita from './pages/Destinasi/Berita';
import TableKuliner from './pages/Destinasi/Kuliner';
import TableMenu from './pages/Destinasi/Menu';
import TablePenginapan from './pages/Destinasi/Penginapan';
import TableKamar from './pages/Destinasi/Kamar';
import TablePaketHomestay from './pages/Destinasi/PaketHomestay';
import TableDetailBerita from './pages/Destinasi/DetailBerita';
import DetailPenginapan from './pages/Destinasi/DetailPenginapan';
import DetailKamar from './pages/Destinasi/DetailKamar';
import DetailPaketHomestay from './pages/Destinasi/DetailPaketHomestay';
import QrCodePage from './pages/scanQrCode';
import LoginPage from './pages/loginPage';
import TableUsersPengelola from './pages/Users/UsersPengelola';
import TableDesaWisata from './pages/Destinasi/DesaWisata';
import TableKecamatan from './pages/Destinasi/Kecamatan';
import TableHistoryHCI from './pages/Destinasi/HistoryHCI';
import HCIDatapengunjung from './pages/Destinasi/HCIDatapengunjung';
import TableDetailDesaWisata from './pages/Destinasi/DetailDesawisata';
import TableDetailWisata from './pages/Destinasi/DetailWisata';
import TablePengumuman from './pages/Pengumuman';
import PaketWisata from './pages/Destinasi/PaketWisata';
import DetailPaketWisata from './pages/Destinasi/DetailPaketWisata';
import DetailKuliner from './pages/Destinasi/DetailKuliner';
import DetailMenu from './pages/Destinasi/DetailMenu';

function App() {
  const navigate = useNavigate();
  const [name, setname] = useState('');
  const [profile, setProfile] = useState('');
  const [role, setRole] = useState('');
  const [id_admin_login, setIdAdminLogin] = useState('');

  const [statusLogin, setStatusLogin] = useState('');

  const getMe = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/admin/me`)
      if (response) {
        setStatusLogin("login");
        setname(response.data.user_admin.nama_admin);
        setProfile(response.data.user_admin.sampul_admin);
        setRole(response.data.user_admin.role);
        setIdAdminLogin(response.data.user_admin.id_admin);
        Navigate('/dashboard')
      }
    } catch (error) {
      // --- PERBAIKAN PENTING DI SINI ---
      if (error.response) {
        // Jika server merespon (misal: 401 Unauthorized)
        if (error.response.status === 401) {
          setStatusLogin("belum_login");
          navigate('/');
        }
      } else {
        // Jika kena CORS atau Server Mati (error.response KOSONG)
        console.log("Network Error / CORS Issue:", error.message);
        // Jangan lakukan apa-apa agar tidak crash
      }
    }
  }

  const Navigate = (href) => {
    navigate(`${href}`);
  };

  useEffect(() => {
    getMe();
  }, [])

  return (
    <div className="container-scroller">
      <Navbar profile={profile} statusLogin={statusLogin} />
      <div className="container-fluid page-body-wrapper">
        {statusLogin === "login" && (
          <Sidebar role={role} />
        )}
        <Routes>
          <Route path="/dashboard" element={<Dashboard name={name} role={role} />} />
          <Route path="/admin" element={<TableAdmin />} />
          <Route path="/dinas" element={<TableDinas />} />
          <Route path="/industri" element={<TableIndustri />} />
          <Route path="/pengelola" element={<TablePengelola />} />
          <Route path="/users-pengelola" element={<TableUsersPengelola role={role} id_admin_login={id_admin_login}/>} />

          <Route path="/desawisata" element={<TableDesaWisata role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/desawisata/:id_desawisata" element={<TableDetailDesaWisata role={role} id_admin_login={id_admin_login}/>} />

          <Route path="/kecamatan" element={<TableKecamatan role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/hci" element={<TableHistoryHCI role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/cekkorelasi" element={<HCIDatapengunjung role={role} id_admin_login={id_admin_login}/>} />

          <Route path="/berita" element={<TableBerita role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/berita/:id_berita" element={<TableDetailBerita role={role} id_admin_login={id_admin_login}/>} />
         
          <Route path="/wisata/:id_wisata" element={<TableDetailWisata role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/wisata" element={<TableWisata role={role} id_admin_login={id_admin_login}/>} />

          <Route path="/paketwisata/:id_paket_wisata" element={<DetailPaketWisata role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/paketwisata" element={<PaketWisata role={role} id_admin_login={id_admin_login}/>} />

          <Route path="/kuliner" element={<TableKuliner role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/kuliner/:id_kuliner" element={<DetailKuliner role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/menu" element={<TableMenu role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/menu/:id_menu" element={<DetailMenu role={role} id_admin_login={id_admin_login}/>} />

          <Route path="/penginapan" element={<TablePenginapan role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/kamar" element={<TableKamar role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/homestay" element={<TablePaketHomestay role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/penginapan/:id_penginapan" element={<DetailPenginapan role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/kamar/:id_kamar" element={<DetailKamar role={role} id_admin_login={id_admin_login}/>} />
          <Route path="/homestay/:id_paket_homestay" element={<DetailPaketHomestay role={role} id_admin_login={id_admin_login}/>} />
          
          <Route path="/pengumuman" element={<TablePengumuman />} />
          <Route path="/qrcode-scan" element={<QrCodePage />} />

          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
