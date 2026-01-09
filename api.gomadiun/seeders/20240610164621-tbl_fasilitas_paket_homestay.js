'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_fasilitas_paket_homestay', [
      {
        id_paket_homestay: 1,
        nama_fasilitas_paket: 'Terdapat 4 kamar',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_paket_homestay: 1,
        nama_fasilitas_paket: '3 Kamar mandi (1 dalam)',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_paket_homestay: 1,
        nama_fasilitas_paket: 'Garasi mobil',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_paket_homestay: 1,
        nama_fasilitas_paket: 'Free Wifi',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_paket_homestay: 2,
        nama_fasilitas_paket: 'Terdapat 4 kamar',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_paket_homestay: 2,
        nama_fasilitas_paket: '3 Kamar mandi (1 dalam)',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_paket_homestay: 2,
        nama_fasilitas_paket: 'Garasi mobil',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_paket_homestay: 2,
        nama_fasilitas_paket: 'Free Wifi',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_paket_homestay: 2,
        nama_fasilitas_paket: 'Sarapan dan Makan Siang',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tbl_fasilitas_paket_homestay', null, {});
  }
};
