import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Navbar = ({profile, statusLogin}) => {

  const Logout = async () => {
      try {
          const data = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/logout?keyword=admin`)
          if (data) {
              window.location.reload();
          }
      } catch (error) {
          //   if (error.response.status === 401) {
          console.log(error);
          //   }
      }
  }

  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
        <a className="navbar-brand brand-logo mr-4">GoMadiun Data</a>
      </div>
      
      <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
        <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
          <span className="icon-menu"></span>
        </button>
        {statusLogin === "login" && (
        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item nav-profile dropdown">
            <a className="nav-link dropdown-toggle" data-toggle="dropdown" id="profileDropdown">
              <img src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${profile}`} alt="profile"/>
            </a>
            <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="profileDropdown">
              <span className="dropdown-item" onClick={Logout}>
                <i className="ti-power-off text-primary"></i>
                Logout
              </span>
            </div>
          </li>
        </ul>
        )} 
        <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
          <span className="icon-menu"></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
