'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_Kamar', [
      {
        id_penginapan: 1,
        nama_kamar: 'Deluxe Room',
        deskripsi: 'Kamar Standard dengan 1 Ranjang ukuran Double, fasilitas LCD TV , AC dengan kamar mandi sharing (di luar kamar) yang membuat harga menjadi lebih terjangkau. Kapasitas kamar max 2 orang dewasa, selebihnya ada charge tambahan. Perlu diingat Kamar kami non smoking, mohon bagi yang merokok untuk merokok di balkon.',
        harga: 500000,
        kapasitas: 2,
        jumlah_kamar: 10,
        bebas_rokok: 'true',
        fasilitas_sarapan: 'true',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 1,
        nama_kamar: 'Superior Room',
        deskripsi: 'Kamar Standard dengan 1 Ranjang ukuran Double, fasilitas LCD TV , AC dengan kamar mandi sharing (di luar kamar) yang membuat harga menjadi lebih terjangkau. Kapasitas kamar max 2 orang dewasa, selebihnya ada charge tambahan.',
        harga: 800000,
        kapasitas: 2,
        jumlah_kamar: 15,
        bebas_rokok: 'true',
        fasilitas_sarapan: 'false',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 1,
        nama_kamar: 'Suite Room',
        deskripsi: 'Kamar Standard dengan 1 Ranjang ukuran Double, fasilitas LCD TV , AC dengan kamar mandi dalam yang membuat harga menjadi lebih mahal dari lainnya. Kapasitas kamar max 2 orang dewasa, selebihnya ada charge tambahan.',
        harga: 1500000,
        kapasitas: 4,
        jumlah_kamar: 5,
        bebas_rokok: 'false',
        fasilitas_sarapan: 'true',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 2,
        nama_kamar: 'Standard Room',
        deskripsi: '',
        harga: 276000,
        kapasitas: 1,
        jumlah_kamar: 5,
        bebas_rokok: 'false',
        fasilitas_sarapan: 'false',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 2,
        nama_kamar: 'Standard Room',
        deskripsi: '',
        harga: 310000,
        kapasitas: 2,
        jumlah_kamar: 3,
        bebas_rokok: 'false',
        fasilitas_sarapan: 'false',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 2,
        nama_kamar: 'Standard Room',
        deskripsi: '',
        harga: 350000,
        kapasitas: 2,
        jumlah_kamar: 3,
        bebas_rokok: 'false',
        fasilitas_sarapan: 'true',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 2,
        nama_kamar: 'Superior Room',
        deskripsi: '',
        harga: 355000,
        kapasitas: 2,
        jumlah_kamar: 5,
        bebas_rokok: 'false',
        fasilitas_sarapan: 'false',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 2,
        nama_kamar: 'Superior Room',
        deskripsi: '',
        harga: 376000,
        kapasitas: 2,
        jumlah_kamar: 5,
        bebas_rokok: 'false',
        fasilitas_sarapan: 'true',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 3,
        nama_kamar: 'Superior Staycation Room',
        deskripsi: 'Superior Room Promo Staycation Hemat dengan kamar Twin Bed/ 2 Bed terpisah, memiliki view kota, pemandangan gunung lawu dan gunung wilis.',
        harga: 438000,
        kapasitas: 2,
        jumlah_kamar: 4,
        bebas_rokok: 'false',
        fasilitas_sarapan: 'false',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 3,
        nama_kamar: 'Superior Room',
        deskripsi: '',
        harga: 488000,
        kapasitas: 2,
        jumlah_kamar: 5,
        bebas_rokok: 'false',
        fasilitas_sarapan: 'false',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_penginapan: 3,
        nama_kamar: 'Superior Room',
        deskripsi: 'Breakfast Ready On Buffee',
        harga: 568000,
        kapasitas: 2,
        jumlah_kamar: 5,
        bebas_rokok: 'false',
        fasilitas_sarapan: 'true',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tbl_Kamar', null, {});
  }
};
