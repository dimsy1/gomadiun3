import React, { useState, useEffect } from 'react';
import DesaIcon from "./../../assets/img/DesaIcon_blue.png"

function HeaderDetail({ Detailwisata }) {
    const namaDesa = Detailwisata[0].nama;
    const alamatDesa = Detailwisata[0].alamat;
    const kelas = Detailwisata[0].kelas;
    const harga = Detailwisata[0].harga_terendah;
    const kategori = Detailwisata[0].kategori;

    const handleScrollToKamar = () => {
        const element = document.getElementById('kamar');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const StarRating = ({ count }) => {
        return (
            <div>
                {Array.from({ length: count }, (_, index) => (
                    <i className="fa-solid fa-star text-warning" key={index}></i>
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="cover-detail-penginapan">
                <div className="d-flex flex-column">
  {/* Bagian atas: Nama, kategori, dan alamat */}
  <div className="my-top-2">
    <span className="detail-penginapan-nama">{namaDesa}</span>
    <div className="d-flex flex-row align-items-center py-2">
      <span className="detail-penginapan-kategori budge-default px-2">{kategori}</span>
      <StarRating count={kelas} />
    </div>
    <div className="d-flex flex-row align-items-center py-2">
      <i className="fas fa-map-marker-alt penginapan-location-icon" style={{ marginRight: '8px' }}></i>
      <span className="detail-penginapan-location">{alamatDesa}</span>
    </div>
  </div>

  {/* Bagian bawah: Harga dan tombol */}
  <div className="d-flex flex-column my-3 align-self-start">
    <span className="text-size-12">Harga Kamar Mulai dari</span>
    <span className="detail-penginapan-harga text-size-18 text-bold my-2">
      {Number(harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
    </span>
    {/* <button className="penginapan-button-price" onClick={handleScrollToKamar}>
      Pilih Kamar
    </button> */}
  </div>
</div>

            </div>
        </div>
    );
};

export default HeaderDetail;
