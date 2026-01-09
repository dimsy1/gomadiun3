import React from 'react';
import goMadiunLogo from "../src/landingPage/assets/img/logo_1.png";
import unsLogo from "./landingPage/assets/img/unsLogo.png";
import svLogo from "./landingPage/assets/img/svLogo.png";
import lppmLogo from "./landingPage/assets/img/lppmLogo.png";
import d3tiunsLogo from "./landingPage/assets/img/d3tiunsLogo.png";
import kabmadiunLogo from "./landingPage/assets/img/kabmadiunLogo.png";
import wonderfulLogo from "./landingPage/assets/img/wonderfulLogo.png";
import kedairekaLogo from "./landingPage/assets/img/kedairekaLogo.png";
import "./landingPage/assets/css/styles.css";


const Footer = () => {
  const partners = [
    unsLogo,
    svLogo,
    lppmLogo,
    d3tiunsLogo,
    kabmadiunLogo,
    wonderfulLogo,
    kedairekaLogo,
  ];

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-info">
          <h3>DISPARPORA Kab. Madiun</h3>
          <p>
            Jl. Singoludro, Kronggahan,<br />
            Mejayan, Kec. Mejayan, Kabupaten<br />
            Madiun, Jawa Timur 63153
          </p>
          <div className="footer-logo">
            <img src={goMadiunLogo} alt="Go Madiun" />
          </div>
        </div>

        <div className="footer-about-social">
          <div className="footer-about">
            <h4>Konten</h4>
            <ul>
              <li>Berita</li>
              <li>Destinasi Wisata</li>
              <li>Desa Wisata</li>
              <li>Kuliner</li>
              <li>Penginapan</li>
            </ul>
          </div>
        </div>
          <div className="footer-social">
            <h4>Ikuti Kami</h4>
            <div className="social-icons">
              <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#"><i className="fa-brands fa-facebook"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-youtube"></i></a>
              <a href="#"><i className="fa-brands fa-tiktok"></i></a>
            </div>
          </div>

        <div className="footer-partners">
          <h4>Partner kami</h4>
          <div className="partner-logos">
            {partners.map((logo, index) => (
              <img src={logo} alt={`partner-${index}`} key={index} />
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Website GoMadiun. All rights reserved. Design by tifpsdku</p>
      </div>
    </footer>
  );
};

export default Footer;