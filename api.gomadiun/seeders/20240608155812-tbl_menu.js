'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_Menu', [
      {
        id_kuliner: 1,
        id_kategori_menu: 1,
        id_admin: 7,
        nama_menu: "Ayam Goreng",
        harga_menu: 12000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/ayam.png",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_kategori_menu: 1,
        id_admin: 7,
        nama_menu: "Bakso",
        harga_menu: 8000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/bakso.png",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_kategori_menu: 1,
        id_admin: 7,
        nama_menu: "Mie Ayam",
        harga_menu: 9000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/mie.png",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_kategori_menu: 1,
        id_admin: 7,
        nama_menu: "Nasi Putih",
        harga_menu: 4000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/Nasi.png",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_kategori_menu: 5,
        id_admin: 7,
        nama_menu: "Es Teh",
        harga_menu: 3000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/esteh.jpg",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_kategori_menu: 5,
        id_admin: 7,
        nama_menu: "Es Jeruk",
        harga_menu: 3000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/esjeruk.png",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_kategori_menu: 5,
        id_admin: 7,
        nama_menu: "Coffe Latte",
        harga_menu: 6000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/coffelatte.png",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_kategori_menu: 5,
        id_admin: 7,
        nama_menu: "Kopi Tubruk",
        harga_menu: 4000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/kopitubruk.png",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_kategori_menu: 9,
        id_admin: 7,
        nama_menu: "Tempe Goreng",
        harga_menu: 10000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/tempegoreng.jpg",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_kuliner: 1,
        id_kategori_menu: 9,
        id_admin: 7,
        nama_menu: "Kentang Goreng",
        harga_menu: 12000,
        sampul_menu: "http://localhost:3001/uploads/img/menu/kentanggoreng.png",
        status_tersedia: 'tersedia',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tbl_Menu', null, {});
  }
};
