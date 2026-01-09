'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_Penginapan', [
      {
        id_desaWisata: 1,
        id_admin: 8,
        id_admin_verifed: 2,
        nama_penginapan: 'Aston Madiun Hotel',
        nib_penginapan: null,
        kbli_penginapan: null,
        alamat_penginapan: 'Jl. Mayjen Sungkono No.41, Nambangan Kidul, Kec. Manguharjo, Kota Madiun, Jawa Timur 63128',
        npwp_penginapan: null,
        npwp_pemilik_penginapan: null,
        kelas_penginapan: "4",
        harga_terendah_penginapan: '500000',
        sampul_penginapan: 'http://localhost:3001/uploads/img/penginapan/HotelAston.png',
        ruang_penginapan: '',
        kontak_person_penginapan: "0824324322432",
        status_penginapan: 'Pribadi',
        status_verifikasi: 'verified',
        total_pengunjung_penginapan: 0,
        kategori_penginapan: 'Hotel',
        id_admin_author: 1,
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_desaWisata: 1,
        id_admin: 8,
        id_admin_verifed: 2,
        nama_penginapan: 'Merdeka Madiun Hotel',
        nib_penginapan: null,
        kbli_penginapan: null,
        alamat_penginapan: 'Jl. Pahlawan No.42, Pangongangan, Kec. Manguharjo, Kota Madiun, Jawa Timur 63121',
        npwp_penginapan: null,
        npwp_pemilik_penginapan: null,
        kelas_penginapan: "3",
        harga_terendah_penginapan: '276000',
        sampul_penginapan: 'http://localhost:3001/uploads/img/penginapan/HotelMerdeka.png',
        ruang_penginapan: '',
        kontak_person_penginapan: "0824324322432",
        status_penginapan: 'Pribadi',
        status_verifikasi: 'verified',
        total_pengunjung_penginapan: 0,
        kategori_penginapan: 'Hotel',
        id_admin_author: 1,
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_desaWisata: 1,
        id_admin: 8,
        id_admin_verifed: 2,
        nama_penginapan: 'The Sun Hotel',
        nib_penginapan: null,
        kbli_penginapan: null,
        alamat_penginapan: 'Kawasan Bisnis dan Rekreasi Suncity Festival Jl. Let.Jend. S Parman No. 8 Kec. Kel, Rejomulyo, Kec. Kartoharjo, Kota Madiun, Jawa Timur 63111',
        npwp_penginapan: null,
        npwp_pemilik_penginapan: null,
        kelas_penginapan: "3",
        harga_terendah_penginapan: "438000",
        sampul_penginapan: 'http://localhost:3001/uploads/img/penginapan/theSun.png',
        ruang_penginapan: '',
        kontak_person_penginapan: "0824324322432",
        status_penginapan: 'Pribadi',
        status_verifikasi: 'verified',
        total_pengunjung_penginapan: 0,
        kategori_penginapan: 'Hotel',
        id_admin_author: 1,
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_desaWisata: 1,
        id_admin: 8,
        id_admin_verifed: 2,
        nama_penginapan: 'Joko homestay',
        nib_penginapan: null,
        kbli_penginapan: null,
        alamat_penginapan: ' Slaji, Randualas, Kec. Kare, Kabupaten Madiun, Jawa Timur 63182',
        npwp_penginapan: null,
        npwp_pemilik_penginapan: null,
        kelas_penginapan: "2",
        harga_terendah_penginapan: "200000",
        sampul_penginapan: 'http://localhost:3001/uploads/img/penginapan/homestay.png',
        ruang_penginapan: '',
        kontak_person_penginapan: "081807050492",
        status_penginapan: 'Pribadi',
        status_verifikasi: 'verified',
        total_pengunjung_penginapan: 0,
        kategori_penginapan: 'Homestay',
        id_admin_author: 1,
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tbl_Penginapan', null, {});
  }
};
