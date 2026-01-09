'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Menu', {
      id_menu: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_kuliner: {
        type: Sequelize.INTEGER
      },
      id_kategori_menu: {
        type: Sequelize.INTEGER
      },
      id_admin: {
        type: Sequelize.INTEGER
      }, 
      nama_menu: {
        type: Sequelize.STRING
      },
      harga_menu: {
        type: Sequelize.INTEGER
      },
      sampul_menu: {
        type: Sequelize.STRING
      },
      status_tersedia: {
        type: Sequelize.ENUM('tersedia', 'habis'),
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
    await queryInterface.dropTable('tbl_Menu');
  }
};