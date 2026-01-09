'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_Kategori_menu', [
      {
        id_kuliner: 1,
        id_admin: 7,
        nama_kategori_menu : "Makanan",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 2,
        id_admin: 7,
        nama_kategori_menu : "Makanan",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 3,
        id_admin: 7,
        nama_kategori_menu : "Makanan",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 4,
        id_admin: 7,
        nama_kategori_menu : "Makanan",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_admin: 7,
        nama_kategori_menu : "Minuman",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 2,
        id_admin: 7,
        nama_kategori_menu : "Minuman",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 3,
        id_admin: 7,
        nama_kategori_menu : "Minuman",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 4,
        id_admin: 7,
        nama_kategori_menu : "Minuman",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_admin: 7,
        nama_kategori_menu : "Snack",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 2,
        id_admin: 7,
        nama_kategori_menu : "Snack",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 3,
        id_admin: 7,
        nama_kategori_menu : "Snack",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 4,
        id_admin: 7,
        nama_kategori_menu : "Snack",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('tbl_Kategori_menu', null, {});
  }
};
