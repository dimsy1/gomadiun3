'use strict';
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('12345678', 10);
   
    return queryInterface.bulkInsert('tbl_Admin', [
      {
        nama_admin: 'Haasstt',
        namaLengkap_admin: 'Haasstt',
        email_admin: 'haasstt@gmail.com',
        password_admin: hashedPassword,
        role: "admin",
        sampul_admin: "default.jpg",
        status_akun: "aktif",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        nama_admin: 'Haasstt_dinas',
        namaLengkap_admin: 'Nurafiif Almas Azhari',
        email_admin: 'haassttDinas@gmail.com',
        nip_admin: 'V3921024',
        password_admin: hashedPassword,
        role: "dinas",
        sampul_admin: "default.jpg",
        status_akun: "aktif",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        nama_admin: 'Haasstt_pengelola1',
        namaLengkap_admin: 'Nurafiif Almas Azhari',
        email_admin: 'haassttpengelola1@gmail.com',
        password_admin: hashedPassword,
        role: "admin pengelola",
        sampul_admin: "default.jpg",
        status_akun: "aktif",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        nama_admin: 'Haasstt_pengelola2',
        namaLengkap_admin: 'Nurafiif Almas Azhari',
        email_admin: 'haassttpengelola2@gmail.com',
        password_admin: hashedPassword,
        role: "admin pengelola",
        sampul_admin: "default.jpg",
        status_akun: "aktif",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        nama_admin: 'Haasstt_pengelola3',
        namaLengkap_admin: 'Nurafiif Almas Azhari',
        email_admin: 'haassttpengelola3@gmail.com',
        password_admin: hashedPassword,
        role: "admin pengelola",
        sampul_admin: "default.jpg",
        status_akun: "aktif",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        nama_admin: 'Haasstt_pengelola4',
        namaLengkap_admin: 'Nurafiif Almas Azhari',
        email_admin: 'haassttpengelola4@gmail.com',
        password_admin: hashedPassword,
        role: "admin pengelola",
        sampul_admin: "default.jpg",
        status_akun: "aktif",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        nama_admin: 'Haasstt_industri',
        namaLengkap_admin: 'Nurafiif Almas Azhari',
        email_admin: 'haassttindustri@gmail.com',
        password_admin: hashedPassword,
        role: "admin industri",
        sampul_admin: "default.jpg",
        status_akun: "aktif",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        nama_admin: 'Haasstt_industri2',
        namaLengkap_admin: 'Nurafiif Almas Azhari',
        email_admin: 'haassttindustri2@gmail.com',
        password_admin: hashedPassword,
        role: "admin industri",
        sampul_admin: "default.jpg",
        status_akun: "aktif",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_Admin', null, {});
  }
};
