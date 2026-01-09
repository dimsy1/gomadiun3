import React from 'react';
import AboutImage from "./../landingPage/assets/img/wisatahero2.jpg";

const AboutUs = () => {
  return (
    <section className="about-container">
      <div className="about-wrapper">
       <div className="about-image">
  <img src={AboutImage} alt="Desa Kare" />
</div>

        <div className="about-text">
          <h2>Tentang GoMadiun</h2>
          <p>
            GoMadiun adalah sebuah aplikasi digital berbasis web yang dikembangkan dengan tujuan utama untuk mendukung promosi pariwisata dan industri pendukungnya seperti penginapan dan kuliner di Kabupaten Madiun. 
            Aplikasi ini merupakan hasil kerja sama antara tim pengembang dengan Dinas Pariwisata, Kepemudaan, dan Olahraga Kabupaten Madiun, sebagai langkah strategis dalam meningkatkan daya tarik, kemudahan akses informasi, 
            serta pelayanan wisata daerah.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
