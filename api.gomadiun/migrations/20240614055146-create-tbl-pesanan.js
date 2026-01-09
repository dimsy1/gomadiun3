'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_pesanan', {
      id_pesanan: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_pembayaran: {
        type: Sequelize.INTEGER
      },
      id_wisatawan: {
        type: Sequelize.INTEGER
      },
      id_destinasi: {
        type: Sequelize.INTEGER
      },
      nama_destinasi: {
        type: Sequelize.STRING
      },
      kode_pesanan: {
        type: Sequelize.STRING
      },
      kode_qr: {
        type: Sequelize.STRING
      },
      tgl_booking: {
        type: Sequelize.DATE
      },
      total_pesanan: {
        type: Sequelize.INTEGER
      },
      status_pesanan: {
        type: Sequelize.ENUM('keranjang', 'proses', 'selesai'),
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
    await queryInterface.dropTable('tbl_pesanan');
  }
};