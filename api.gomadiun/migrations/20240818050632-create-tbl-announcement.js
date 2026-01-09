'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_announcement', {
      id_announcements: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      judul_event: {
        type: Sequelize.STRING
      },
      url_poster: {
        type: Sequelize.STRING
      },
      name_poster: {
        type: Sequelize.STRING
      },
      desk_event: {
        type: Sequelize.TEXT
      },
      url_announcements: {
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
    await queryInterface.dropTable('tbl_announcement');
  }
};