'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Kamar', {
      id_kamar: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_penginapan: {
        type: Sequelize.INTEGER
      },
      nama_kamar: {
        type: Sequelize.STRING
      },
      deskripsi: {
        type: Sequelize.TEXT
      },
      harga: {
        type: Sequelize.INTEGER
      },
      kapasitas: {
        type: Sequelize.INTEGER
      },
      jumlah_kamar: {
        type: Sequelize.INTEGER
      },
      bebas_rokok: {
        type: Sequelize.ENUM('true', 'false'),
      },
      fasilitas_sarapan: {
        type: Sequelize.ENUM('true', 'false'),
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
    await queryInterface.dropTable('tbl_Kamar');
  }
};