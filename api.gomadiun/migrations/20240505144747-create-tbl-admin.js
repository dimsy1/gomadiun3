'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Admin', {
      id_admin: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_admin_pemilik: {
        type: Sequelize.INTEGER
      },
      nama_admin: {
        type: Sequelize.STRING
      },
      namaLengkap_admin: {
        type: Sequelize.STRING
      },
      email_admin: {
        type: Sequelize.STRING
      },
      password_admin: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.ENUM('admin', 'dinas', 'admin pengelola', 'admin industri', 'user pengelola', 'user industri')
      },
      nip_admin: {
        type: Sequelize.STRING
      },
      nohp_admin: {
        type: Sequelize.STRING
      },
      alamat_admin: {
        type: Sequelize.STRING
      },
      sampul_admin: {
        type: Sequelize.STRING
      },
      status_akun: {
        type: Sequelize.ENUM('aktif', 'suspend'),
        defaultValue: 'aktif'
      },
      refresh_token: {
        type: Sequelize.TEXT
      },
      id_admin_author: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_Admin');
  }
};