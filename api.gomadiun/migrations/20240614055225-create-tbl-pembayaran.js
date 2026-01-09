'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_pembayaran', {
      id_pembayaran: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_wisatawan: {
        type: Sequelize.INTEGER(50),
      },
      kode_pembayaran: {
        type: Sequelize.STRING
      },
      total_pembayaran: {
        type: Sequelize.INTEGER
      },
      data_pembayaran_snap_token: {
        type: Sequelize.TEXT
      },
      data_pembayaran_snap_redirect_url: {
        type: Sequelize.TEXT
      },
      batas_pembayaran: {
          type: Sequelize.DATE,
      },
      tgl_pembayaran: {
          type: Sequelize.DATE,
      },
      metode_pembayaran: {
        type: Sequelize.STRING
      },
      status_pembayaran: {
        type: Sequelize.ENUM('belum_bayar', 'bayar', 'selesai', 'batal'),
      },
      keterangan_pembayaran: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('tbl_pembayaran');
  }
};