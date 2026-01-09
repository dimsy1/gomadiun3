'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_Paket_homestay', [
      {
        id_penginapan: 4,
        nama_paket_homestay: 'Paket 1',
        deskripsi_paket_homestay: 'Homestay satu ini memiliki bangunan rapi bertingkat 2, dimana pada lantai 2 Anda bisa menikmati suasana desa Dieng, melihat danau maupun hutan dengan suhu udara yang sejuk.',
        harga: 200000,
        sampul_paket_homestay: 'http://localhost:3001/uploads/img/penginapan/homestay.png',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 4,
        nama_paket_homestay: 'Paket 2',
        deskripsi_paket_homestay: 'Homestay satu ini memiliki bangunan rapi bertingkat 2, dimana pada lantai 2 Anda bisa menikmati suasana desa Dieng, melihat danau maupun hutan dengan suhu udara yang sejuk.',
        harga: 220000,
        sampul_paket_homestay: 'http://localhost:3001/uploads/img/penginapan/homestay.png',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tbl_Paket_homestay', null, {});
  }
};
