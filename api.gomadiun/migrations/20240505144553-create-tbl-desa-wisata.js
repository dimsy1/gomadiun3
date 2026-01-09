'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_DesaWisata', {
      id_desaWisata: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_admin: {
        type: Sequelize.INTEGER
      },
      id_admin_verifed: {
        type: Sequelize.INTEGER
      },
      nama_desaWisata: {
        type: Sequelize.STRING
      },
      desk_desaWisata: {
        type: Sequelize.TEXT
      },
      sampul_desaWisata: {
        type: Sequelize.STRING
      },
      kontak_person_desawisata: {
        type: Sequelize.STRING
      },
      total_pengunjung: {
        type: Sequelize.INTEGER
      }, 
      id_admin_author: {
        type: Sequelize.INTEGER
      },
      status_verifikasi: {
        type: Sequelize.ENUM('verified', 'unverified'),
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
    await queryInterface.dropTable('tbl_DesaWisata');
  }
};