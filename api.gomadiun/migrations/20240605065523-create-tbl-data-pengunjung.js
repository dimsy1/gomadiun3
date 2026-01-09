'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_data_pengunjung', {
      id_data_pengunjung: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_table: {
        type: Sequelize.INTEGER
      },
      id_admin_verifed: {
        type: Sequelize.INTEGER
      },
      nama_table: {
        type: Sequelize.STRING
      },
      tahun_data_pengunjung: {
        type: Sequelize.INTEGER
      },
      bulan_data_pengunjung: {
        type: Sequelize.INTEGER
      },
      jumlah_pengunjung_aplikasi: {
        type: Sequelize.INTEGER
      },
      jumlah_pengunjung_lokal: {
        type: Sequelize.INTEGER
      },
      jumlah_pengunjung_mancanegara: {
        type: Sequelize.INTEGER
      },
      jumlah_pegawai_laki: {
        type: Sequelize.INTEGER
      },
      jumlah_pegawai_perempuan: {
        type: Sequelize.INTEGER
      },
      status_verifikasi: {
        type: Sequelize.ENUM('verified', 'unverified', 'rejected'),
        defaultValue: 'unverified'
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
    await queryInterface.dropTable('tbl_data_pengunjung');
  }
};