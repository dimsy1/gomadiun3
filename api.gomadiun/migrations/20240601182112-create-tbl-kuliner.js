'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Kuliner', {
      id_kuliner: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_desaWisata: {
        type: Sequelize.INTEGER
      },
      id_admin: {
        type: Sequelize.INTEGER
      },
      id_admin_verifed: {
        type: Sequelize.INTEGER
      },
      id_admin_pengelola: {
        type: Sequelize.INTEGER
      },
      nama_kuliner: {
        type: Sequelize.STRING
      },
      nib_kuliner: {
        type: Sequelize.STRING
      },
      kbli_kuliner: {
        type: Sequelize.STRING
      },
      alamat_kuliner: {
        type: Sequelize.STRING
      },
      npwp_kuliner: {
        type: Sequelize.STRING
      },
      npwp_pemilik_kuliner: {
        type: Sequelize.STRING
      },
      maps_kuliner: {
        type: Sequelize.TEXT
      },
      sampul_kuliner: {
        type: Sequelize.STRING
      },
      ruang_kuliner: {
        type: Sequelize.STRING
      },
      kontak_person_kuliner: {
        type: Sequelize.STRING
      },
      total_pengunjung_kuliner: {
        type: Sequelize.INTEGER
      }, 
      status_buka: {
        type: Sequelize.ENUM('Buka', 'Tutup'),
      },
      status_kuliner: {
        type: Sequelize.ENUM('Pribadi', 'Bumdes', 'Pemda'),
      },
      status_verifikasi: {
        type: Sequelize.ENUM('verified', 'unverified'),
        defaultValue: 'unverified'
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
    await queryInterface.dropTable('tbl_Kuliner');
  }
};