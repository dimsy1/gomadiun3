import React from 'react';

function HeaderDetail({ DetailDesa }) {
  // Pastikan DetailDesa adalah objek, bukan array
  const item = DetailDesa; 

  return (
    <div className="header-detail-container">
      <div className="header-detail-content">
        <div className="header-detail-image">
          <img src={item.sampul_desaWisata} alt={item.nama_desaWisata} />
        </div>
        <div className="header-detail-text">
          <h2>{item.nama_desaWisata}</h2>
          <p>{item.desk_desaWisata}</p>
        </div>
      </div>
    </div>
  );
}

export default HeaderDetail;
