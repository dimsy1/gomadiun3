'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_fasilitas_paket_wisata', {
      id_fasilitas_paket_wisata: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_paket_wisata: {
        type: Sequelize.INTEGER
      },
      value_fasilitas_paket_wisata: {
        type: Sequelize.INTEGER
      },
      nama_fasilitas_paket_wisata: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('tbl_fasilitas_paket_wisata');
  }
};