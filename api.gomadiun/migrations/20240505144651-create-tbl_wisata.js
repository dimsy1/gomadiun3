'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Wisata', {
      id_wisata: {
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
      nama_destinasi: {
        type: Sequelize.STRING
      },
      nib_destinasi: {
        type: Sequelize.STRING
      },
      kbli_destinasi: {
        type: Sequelize.STRING
      },
      alamat_destinasi: {
        type: Sequelize.STRING
      },
      npwp_destinasi: {
        type: Sequelize.STRING
      },
      npwp_pemilik_destinasi: {
        type: Sequelize.STRING
      },
      desk_destinasi: {
        type: Sequelize.TEXT
      },
      maps_destinasi: {
        type: Sequelize.TEXT
      },
      sampul_destinasi: {
        type: Sequelize.STRING
      },
      ruang_destinasi: {
        type: Sequelize.STRING
      },
      harga_tiket: {
        type: Sequelize.INTEGER
      },
      status_jalan: {
        type: Sequelize.ENUM('1', '2', '3'),
      },
      jenis_kendaraan: {
        type: Sequelize.ENUM('1', '2', '3'),
      },
      jumlah_fasilitas: {
        type: Sequelize.INTEGER,
      },
      rate: {
        type: Sequelize.DOUBLE(10, 2),
      },
      kontak_person_destinasi: {
        type: Sequelize.STRING
      },
      total_pengunjung_destinasi: {
        type: Sequelize.INTEGER
      }, 
      status_wisata: {
        type: Sequelize.ENUM('Pribadi', 'Bumdes', 'Pemda'),
      },
      jenis_wisata: {
        type: Sequelize.ENUM('buatan', 'alam', 'religi', 'senibudaya'),
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
    await queryInterface.dropTable('tbl_Wisata');
  }
};