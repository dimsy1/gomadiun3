import React, { useState } from 'react';
import './index.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../src/landingPage/assets/img/logo_2.png';

function Navbar({ openModal, openModalRegister, statusLogin, setStatusLogin, name, profile }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const Logout = async () => {
    try {
      const data = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/logout?keyword=wisatawan`);
      if (data) {
        setStatusLogin(false);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const Navigate = (href) => {
    navigate(`${href}`);
  };

  return (
    <nav className="navbars">
      <div className="navbar-container">

        {/* Hamburger */}
         {/* Hamburger */}
        <div className="hamburger-menu" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </div>

        {/* Logo */}
        <div className="navbar-left" onClick={() => Navigate('/')}>
          <img src={logo} alt="GoHoliday Logo" className="logo-navbar" />
        </div>

        {/* Menu tengah */}
        <div className="navbar-center">
          <ul>
            <li><span className="nav-items" onClick={() => Navigate('/')}>Dashboard</span></li>
            <li><span className="nav-items" onClick={() => Navigate('/pemetaan')}>Pemetaan</span></li>
            <li><span className="nav-items" onClick={() => Navigate('/berita')}>Berita</span></li>
            <li><span className="nav-items" onClick={() => Navigate('/keranjang')}>Keranjang</span></li>
            <li><span className="nav-items" onClick={() => Navigate('/about')}>Tentang Kami</span></li>
          </ul>
        </div>

        {/* Kanan */}
        <div className="navbar-right">
           {/* {statusLogin === "login" && (
    <div className="hamburger-menu" onClick={toggleSidebar}>
      <i className="fas fa-bars"></i>
    </div>
  )} */}
          {statusLogin === "belum_login" ? (
            <>
              <span className="button-masuk rounded-10" onClick={openModal}>Masuk</span>
              <span className="button-daftar rounded-10 mx-3" onClick={openModalRegister}>Daftar</span>
            </>
          ) : (
            <div className="dropdown">
              <span className="text-dark dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <img
                  src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${profile}`}
                  className="rounded-circle"
                  height="35"
                  width="35"
                  alt="noprofile"
                  loading="lazy"
                />
                <span className='mx-2'>{name}</span>
              </span>
              <ul className="mt-3 dropdown-menu px-3">
                <span className="dropdown-item my-top-1" onClick={() => Navigate('/setting')}><i className="fa-solid fa-user mx-right-1"></i> Profile</span>
                <span className="dropdown-item my-3" onClick={() => Navigate('/pesananku')}><i className="fa-solid fa-cart-shopping mx-right-1"></i> Pesanan Saya</span>
                <span className="dropdown-item my-bottom-1" onClick={Logout}><i className="fa-solid fa-arrow-right-from-bracket mx-right-1"></i> Logout</span>
              </ul>
            </div>
          )}
        </div>
      </div>

     {/* Sidebar dan overlay */}
  <div className={`sidebar-navbar ${sidebarOpen ? 'open' : ''}`}>
        {statusLogin === "belum_login" && (
          <div className="sidebar-auth">
            <span className="button-masuk rounded-10" onClick={openModal}>Masuk</span>
            <span className="button-daftar rounded-10 mx-3" onClick={openModalRegister}>Daftar</span>
          </div>
        )}

        {statusLogin === "login" && (
          <div className="sidebar-profile">
            <img
              src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${profile}`}
              className="sidebar-profile-img"
              alt="profile"
            />
            <div className="sidebar-profile-name-dropdown" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
              {name} <i className={`fas fa-chevron-${profileDropdownOpen ? 'up' : 'down'} ms-2`}></i>
            </div>
            {profileDropdownOpen && (
              <div className="sidebar-profile-dropdown">
                <div className="sidebar-profile-link" onClick={() => Navigate('/setting')}>
                  <i className="fa-solid fa-user mx-right-1"></i> Profile
                </div>
                <div className="sidebar-profile-link" onClick={() => Navigate('/pesananku')}>
                  <i className="fa-solid fa-cart-shopping mx-right-1"></i> Pesanan Saya
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menu Sidebar Utama */}
        <ul>
  <li onClick={() => Navigate('/')}>Dashboard</li>
  <li onClick={() => Navigate('/pemetaan')}>Pemetaan</li>
  <li onClick={() => Navigate('/berita')}>Berita</li>
  <li onClick={() => Navigate('/keranjang')}>Keranjang</li>
  <li onClick={() => Navigate('/tentang')}>Tentang Kami</li>
  {statusLogin === "login" && <li onClick={Logout}>Logout</li>}
</ul>

      </div>

      {sidebarOpen && <div className="overlay-sidebar-navbar" onClick={toggleSidebar}></div>}

    </nav>
  );
}

export default Navbar;
