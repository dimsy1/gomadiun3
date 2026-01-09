'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Paket_Wisata', {
      id_paket_wisata: {
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
      nama_paket_wisata: {
        type: Sequelize.STRING
      },
      nib_paket_wisata: {
        type: Sequelize.STRING
      },
      kbli_paket_wisata: {
        type: Sequelize.STRING
      },
      alamat_paket_wisata: {
        type: Sequelize.STRING
      },
      npwp_paket_wisata: {
        type: Sequelize.STRING
      },
      npwp_pemilik_paket_wisata: {
        type: Sequelize.STRING
      },
      desk_paket_wisata: {
        type: Sequelize.TEXT
      },
      maps_paket_wisata: {
        type: Sequelize.TEXT
      },
      sampul_paket_wisata: {
        type: Sequelize.STRING
      },
      ruang_paket_wisata: {
        type: Sequelize.STRING
      },
      harga_paket_wisata: {
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
      kontak_person_paket_wisata: {
        type: Sequelize.STRING
      },
      total_pengunjung_paket_wisata: {
        type: Sequelize.INTEGER
      }, 
      status_paket_wisata: {
        type: Sequelize.ENUM('Pribadi', 'Bumdes', 'Pemda'),
      },
      jenis_paket_wisata: {
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
    await queryInterface.dropTable('tbl_Paket_Wisata');
  }
};