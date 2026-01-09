'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_ulasan', {
      id_ulasan: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_wisatawan: {
        type: Sequelize.INTEGER
      },
      id_pesanan: {
        type: Sequelize.INTEGER
      },
      id_wisata: {
        type: Sequelize.INTEGER
      },
      rate: {
        type: Sequelize.INTEGER
      },
      komentar: {
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
    await queryInterface.dropTable('tbl_ulasan');
  }
};