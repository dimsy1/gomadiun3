import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContentTop = ({ dataTop }) => {
  const navigate = useNavigate();

 const TopDatas = [
  {
    title: 'Desa Wisata',
    desc: 'Meningkatkan efisiensi dengan solusi IoT yang terintegrasi untuk bisnis Anda.',
    icon: '/icons/desa.png',
    link: '/desawisata',
  },
  {
    title: 'Kuliner',
    desc: 'Meningkatkan efisiensi dengan solusi IoT yang terintegrasi untuk bisnis Anda.',
    icon: '/icons/kuliner.png',
    link: '/kuliner',
  },
  {
    title: 'Penginapan',
    desc: 'Meningkatkan efisiensi dengan solusi IoT yang terintegrasi untuk bisnis Anda.',
    icon: '/icons/penginapan.png',
    link: '/penginapan',
  },
];


  return (
    <section className="content-top">
      <h2 className="content-top-title">Mau kemana?</h2>
      <p className="content-top-subtitle">
        Bersama mitra-mitra terpercaya, kami membangun sinergi untuk mendorong inovasi
      </p>
      <div className="content-top-grid">
        {dataTop.map((card, index) => (
          <div key={index} className="content-top-card" onClick={() => navigate(card.link)}>
            <img src={card.icon} alt={card.title} className="content-top-icon" />
            <div className="content-top-text">
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default ContentTop;
