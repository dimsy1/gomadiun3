'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_data_pengunjung', [
      {
        id_table: 1,
        id_admin_verifed: 2,
        nama_table: "tbl_desawisata",
        tahun_data_pengunjung: "2024",
        bulan_data_pengunjung: 1,
        jumlah_pengunjung_aplikasi: 0,
        jumlah_pengunjung_lokal: 10,
        jumlah_pengunjung_mancanegara: 5,
        jumlah_pegawai_laki: 10,
        jumlah_pegawai_perempuan: 10,
        status_verifikasi: 'verified',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        id_admin_verifed: 2,
        nama_table: "tbl_desawisata",
        tahun_data_pengunjung: "2024",
        bulan_data_pengunjung: 1,
        jumlah_pengunjung_aplikasi: 0,
        jumlah_pengunjung_lokal: 8,
        jumlah_pengunjung_mancanegara: 2,
        jumlah_pegawai_laki: 10,
        jumlah_pegawai_perempuan: 10,
        status_verifikasi: 'verified',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 3,
        id_admin_verifed: 2,
        nama_table: "tbl_desawisata",
        tahun_data_pengunjung: "2024",
        bulan_data_pengunjung: 1,
        jumlah_pengunjung_aplikasi: 0,
        jumlah_pengunjung_lokal: 7,
        jumlah_pengunjung_mancanegara: 0,
        jumlah_pegawai_laki: 10,
        jumlah_pegawai_perempuan: 10,
        status_verifikasi: 'verified',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_data_pengunjung', null, {});
  }
};
