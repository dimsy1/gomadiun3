import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import 'sweetalert2/dist/sweetalert2.min.css';

import { useLocation } from 'react-router-dom';


import Navbar from './Navbar';
import Footer from './Footer';
import LoginModal from './modal/login';
import { Route, Routes } from "react-router-dom";
import RegisterModal from './modal/registrasi';
import VerifOTPModal from './modal/verifOtp';
import ResetPassModal from './modal/resetpassword';

import Landing from './landingPage/index';
import ComingSoon from './Pages/ComingsoonPage';
import DesaWisata from './Pages/DesaWisata';
import DesaWisataDetail from './Pages/DesaWisataDetail';
import WisataDetail from './Pages/WisataDetail';
import Wisata from './Pages/Wisata';
import PaketWisata from './Pages/PaketWisata';
import PaketWisataDetail from './Pages/PaketWisataDetail';
import KulinerPage from './Pages/Kuliner';
import KulinerDetail from './Pages/KulinerDetail';
import PenginapanPage from './Pages/Penginapan';
import PenginapanDetail from './Pages/PenginapanDetail';
import Alert from './modal/alert';
import KeranjangPage from './Pages/keranjang';
import Pemetaan from './Pages/pemetaan';
import Berita from './Pages/Berita';
import About from './Pages/About';
import BeritaDetail from './Pages/BeritaDetail';
import PesananKuPage from './Pages/pesanan_saya';
import AkunSetting from './Pages/AkunSetting';
import Informasi from './modal/AlertOnDeps';
import PopUp from './modal/popupEvent';

function App() {
  //data login
  const [name, setName] = useState('');
  const [profile, setProfile] = useState('');
  const location = useLocation();

  const [statusLogin, setStatusLogin] = useState('');

  const [username, setUsername] = useState('');
  const [nama_lengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [telp, setTelp] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [isClose, setIsClose] = useState(true);
  const [isOpenInfo, setIsOpenInfo] = useState(false);
  const [isCloseInfo, setIsCloseInfo] = useState(true);
  const [isOpenRegister, setIsOpenRegister] = useState(false);
  const [isCloseRegister, setIsCloseRegister] = useState(true);
  const [isOpenOtp, setIsOpenOtp] = useState(false);
  const [isCloseOtp, setIsCloseOtp] = useState(true);
  const [isOpenReset, setIsOpenReset] = useState(false);
  const [isCloseReset, setIsCloseReset] = useState(true);

  const [statusReset, setResetPass] = useState(false);
  const [statusVerifikasi, setVerifikasi] = useState('');

  const [StatusAlert, setStatusAlert] = useState(false);
  const [messageAlert, setMessageAlert] = useState('');
  const [StatusNameAlert, setStatusNameAlert] = useState('');

  const [EventData, setEventData] = useState([]);
  const [StatusPopUp, setStatusPopUp] = useState(false);

  const getMe = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/wisatawan/me`, {
        withCredentials: true 
      });
      if (response) {
        setStatusLogin("login");
        setName(response.data.user_wisatawan.name);
        setProfile(response.data.user_wisatawan.profile);

        localStorage.setItem('user', JSON.stringify({
            name: response.data.user_wisatawan.name,
            profile: response.data.user_wisatawan.profile,
            email: response.data.user_wisatawan.email
        }));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setStatusLogin("belum_login");
        localStorage.removeItem('user');
        setName('');
        setProfile('');
      }
    }
  }

  const getEvent= async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/dashboard/event-report`)
      if (response) {
        setEventData(response.data.data);
        setStatusPopUp(true)
      }
    } catch (error) {
      setStatusPopUp(false)
    }
  }
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.name) setName(parsedUser.name);
        if (parsedUser.profile) setProfile(parsedUser.profile);
        setStatusLogin("login");
      } catch (error) {
        console.error("Error parsing stored user data", error);
        localStorage.removeItem('user');
      }
    }

    getMe();
    getEvent();
  }, [])

  const handleOpenModalInfo = () => {
    setIsOpenInfo(true);
    setIsCloseInfo(false);
  };

  const handleCloseModalInfo = () => {
    setIsCloseInfo(true);
    setTimeout(() => {
      setIsOpenInfo(false);
    }, 180); 
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    setIsClose(false);
  };

  const handleCloseModal = () => {
    setIsClose(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 180); 
  };

  const handleOpenModalRegister = () => {
    setIsOpenRegister(true);
    setIsCloseRegister(false);
  };

  const handleCloseModalRegister = () => {
    setIsCloseRegister(true);
    setTimeout(() => {
      setIsOpenRegister(false);
    }, 180); 
  };

  const handleOpenModalOtp = () => {
    setIsOpenOtp(true);
    setIsCloseOtp(false);
  };

  const handleCloseModalOtp = () => {
    setIsCloseOtp(true);
    setTimeout(() => {
      setIsOpenOtp(false);
    }, 180);
  };

  const handleOpenModalReset = () => {
    setIsOpenReset(true);
    setIsCloseReset(false);
  };

  const handleCloseModalReset = () => {
    setIsCloseReset(true);
    setTimeout(() => {
      setIsOpenReset(false);
    }, 180); 
  };

  const handleSwitchtoRegister = () => {
    handleCloseModal();
    setTimeout(() => {
      handleOpenModalRegister();
    }, 180);
  };

  const handleSwitchtoLogin = () => {
    handleCloseModalRegister();
    setTimeout(() => {
      handleOpenModal();
    }, 180);
  };

  const handleSwitchLogintoReset = () => {
    handleCloseModal();
    setTimeout(() => {
      handleOpenModalReset();
    }, 180);
  };

  const changeStatusOn = () => {
    setResetPass(true);
  };
  const changeStatusOff = () => {
    setResetPass(false);
  };
  
  const changeStatusAlertShow = () => {
    setStatusAlert(true);
  };
  const changeMessageAlert = (message) => {
    setMessageAlert(message);
  };
  const changeStatusNameAlert = (Status) => {
    setStatusNameAlert(Status);
  };
  const changeStatusAlertClose = () => {
    setStatusAlert(false);
  };
  const closePopUp = () => {
    setStatusPopUp(false);
  };

  useEffect(() => {
    if (messageAlert !== '') {
      setTimeout(() => {
        changeStatusAlertClose();
      }, 3000);
    }
  })

  return (
    <div>
      {!location.pathname.startsWith('/pemetaan') && (
      <Navbar
        name={name}
        profile={profile}
        setStatusLogin={setStatusLogin}
        statusLogin={statusLogin}
        openModal={handleOpenModal}
        openModalRegister={handleOpenModalRegister}
      />
    )}
      <LoginModal
        setStatusLogin={setStatusLogin}
        isOpen={isOpen}
        isClose={isClose}
        closeModal={handleCloseModal}
        SwicthToRegister={handleSwitchtoRegister}
        SwicthToResetPass={handleSwitchLogintoReset}
      />
      <RegisterModal
        isOpen={isOpenRegister}
        isClose={isCloseRegister}
        closeModal={handleCloseModalRegister}
        SwicthToLogin={handleSwitchtoLogin}
        OpenOtp={handleOpenModalOtp}
        statusVerif={setVerifikasi}
        username={username}
        nama_lengkap={nama_lengkap}
        email={email}
        password={password}
        passwordConfirm={passwordConfirm}
        telp={telp}
        setUsername={setUsername}
        setNamaLengkap={setNamaLengkap}
        setEmail={setEmail}
        setPassword={setPassword}
        setPasswordConfirm={setPasswordConfirm}
        setTelp={setTelp}
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
      />
      <VerifOTPModal
        isOpen={isOpenOtp}
        isClose={isCloseOtp}
        closeModal={handleCloseModalOtp}
        statusVerif={statusVerifikasi}
        chagePass={handleOpenModalReset}
        username={username}
        nama_lengkap={nama_lengkap}
        email={email}
        password={password}
        telp={telp}
        setUsername={setUsername}
        setNamaLengkap={setNamaLengkap}
        setEmail={setEmail}
        setPassword={setPassword}
        setTelp={setTelp}
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
      />
      <ResetPassModal
        email={email}
        setEmail={setEmail}
        isOpen={isOpenReset}
        isClose={isCloseReset}
        closeModal={handleCloseModalReset}
        StatusReset={statusReset}
        changeon={changeStatusOn}
        changeoff={changeStatusOff}
        switchtoOtp={handleOpenModalOtp}
        statusVerif={setVerifikasi}
      />

      {messageAlert !== '' && (
        <Alert show={StatusAlert} onClose={changeStatusAlertClose} status={StatusNameAlert} message={messageAlert} />
      )}

      <Informasi
        isOpen={isOpenInfo}
        isClose={isCloseInfo}
        closeModal={handleCloseModalInfo}
        />

        <PopUp show={StatusPopUp} onClose={closePopUp} images={EventData} />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/desawisata" element={<DesaWisata />} />
        <Route path="/wisata" element={<Wisata />} />
        <Route path="/kuliner" element={<KulinerPage />} />
        <Route path="/kuliner/:id" element={<KulinerDetail 
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        statusLogin={statusLogin}
        openModal={handleOpenModal}
        openModalInfo={handleOpenModalInfo}
        />} />
        <Route path="/penginapan" element={<PenginapanPage />} />
        <Route path="/penginapan/:id" element={<PenginapanDetail 
        openModalInfo={handleOpenModalInfo}
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        statusLogin={statusLogin}
        openModal={handleOpenModal}
        />} />
        
        <Route path="/desawisata/:id" element={<DesaWisataDetail />} />
        
        <Route path="/wisata/:id" element={<WisataDetail 
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        statusLogin={statusLogin}
        openModal={handleOpenModal}
        />} />
        <Route path="/paket_wisata/:id" element={<PaketWisataDetail 
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        statusLogin={statusLogin}
        openModal={handleOpenModal}
        />} />
        <Route path="/coming_soon" element={<ComingSoon />} />
        <Route path="/setting" element={<AkunSetting 
        username={name}
        SetprofileGlobal={setProfile}
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        setnameGlobal={setName}
        SwicthToResetPass={handleSwitchLogintoReset}/>} />
        <Route path="/keranjang" element={<KeranjangPage 
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        />} />
        <Route path="/pesananku" element={<PesananKuPage 
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        />} />
        <Route path="/pemetaan" element={<Pemetaan 
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        />} />
        <Route path="/berita" element={<Berita 
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        />} />
        <Route path="/about" element={<About 
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        />} />
        <Route path="/paketwisata" element={<PaketWisata 
        showAlert={changeStatusAlertShow}
        messageAlert={changeMessageAlert}
        nameAlert={changeStatusNameAlert}
        />} />

        <Route path="/berita/:id" element={<BeritaDetail />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;