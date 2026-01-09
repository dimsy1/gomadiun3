'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Paket_homestay', {
      id_paket_homestay: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_penginapan: {
        type: Sequelize.INTEGER
      },
      nama_paket_homestay: {
        type: Sequelize.STRING
      },
      deskripsi_paket_homestay: {
        type: Sequelize.TEXT
      },
      sampul_paket_homestay: {
        type: Sequelize.STRING
      },
      harga: {
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
    await queryInterface.dropTable('tbl_Paket_homestay');
  }
};