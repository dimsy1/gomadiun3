'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Penginapan', {
      id_penginapan: {
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
      nama_penginapan: {
        type: Sequelize.STRING
      },
      nib_penginapan: {
        type: Sequelize.STRING
      },
      kbli_penginapan: {
        type: Sequelize.STRING
      },
      alamat_penginapan: {
        type: Sequelize.STRING
      },
      npwp_penginapan: {
        type: Sequelize.STRING
      },
      npwp_pemilik_penginapan: {
        type: Sequelize.STRING
      },
      desk_penginapan: {
        type: Sequelize.TEXT
      },
      kelas_penginapan: {
        type: Sequelize.STRING
      },
      harga_terendah_penginapan: {
        type: Sequelize.STRING
      },
      sampul_penginapan: {
        type: Sequelize.STRING
      },
      ruang_penginapan: {
        type: Sequelize.STRING
      },
      kontak_person_penginapan: {
        type: Sequelize.STRING
      },
      total_pengunjung_penginapan: {
        type: Sequelize.INTEGER
      },
      kategori_penginapan: {
        type: Sequelize.ENUM('Hotel', 'Homestay'),
      },
      status_penginapan: {
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
    await queryInterface.dropTable('tbl_Penginapan');
  }
};