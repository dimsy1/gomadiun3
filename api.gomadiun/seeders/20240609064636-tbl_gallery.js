'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_Gallery', [
      {
        id_table: 1,
        name_table: 'tbl_penginapan',
        name_image: 'Aston.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/Aston.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_penginapan',
        name_image: 'kolam_renang.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kolam_renang.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_penginapan',
        name_image: 'ruang_dalam.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/ruang_dalam.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_penginapan',
        name_image: 'image3.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/Aston.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_penginapan',
        name_image: 'kamar1.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar1.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_penginapan',
        name_image: 'kamar2.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar2.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_penginapan',
        name_image: 'kamarmandi.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamarmandi.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_penginapan',
        name_image: 'Aston.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/Aston.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_penginapan',
        name_image: 'kolam_renang.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kolam_renang.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_penginapan',
        name_image: 'ruang_dalam.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/ruang_dalam.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_penginapan',
        name_image: 'image3.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/Aston.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_penginapan',
        name_image: 'kamar1.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar1.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_penginapan',
        name_image: 'kamar2.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar2.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 3,
        name_table: 'tbl_penginapan',
        name_image: 'Aston.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/Aston.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 3,
        name_table: 'tbl_penginapan',
        name_image: 'kolam_renang.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kolam_renang.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 3,
        name_table: 'tbl_penginapan',
        name_image: 'ruang_dalam.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/ruang_dalam.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 3,
        name_table: 'tbl_penginapan',
        name_image: 'image3.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/Aston.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 3,
        name_table: 'tbl_penginapan',
        name_image: 'kamar1.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar1.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 3,
        name_table: 'tbl_penginapan',
        name_image: 'kamar2.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar2.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 4,
        name_table: 'tbl_penginapan',
        name_image: 'Aston.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/Aston.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 4,
        name_table: 'tbl_penginapan',
        name_image: 'kolam_renang.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kolam_renang.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 4,
        name_table: 'tbl_penginapan',
        name_image: 'ruang_dalam.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/ruang_dalam.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 4,
        name_table: 'tbl_penginapan',
        name_image: 'image3.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/Aston.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 4,
        name_table: 'tbl_penginapan',
        name_image: 'kamar1.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar1.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 4,
        name_table: 'tbl_penginapan',
        name_image: 'kamar2.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar2.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_Kamar',
        name_image: 'kamar2.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar2.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_Kamar',
        name_image: 'kamarmandi.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamarmandi.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_Kamar',
        name_image: 'kamarmandi1.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamarmandi1.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 1,
        name_table: 'tbl_Kamar',
        name_image: 'kamar1.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar1.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_Kamar',
        name_image: 'kamar3.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar3.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_Kamar',
        name_image: 'kamar4.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamar4.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_Kamar',
        name_image: 'kamarmandi2.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamarmandi2.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_table: 2,
        name_table: 'tbl_Kamar',
        name_image: 'kamarmandi3.jpg',
        url: 'http://localhost:3001/uploads/img/penginapan/gallery/kamarmandi3.jpg',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tbl_Gallery', null, {});
  }
};
