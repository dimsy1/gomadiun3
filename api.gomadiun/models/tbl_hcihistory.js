'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tbl_HCIHistory extends Model {
    static associate(models) {
      // Setiap entry HCI milik satu kecamatan
      tbl_HCIHistory.belongsTo(models.tbl_Kecamatan, {
        foreignKey: 'id_kecamatan',
        as: 'kecamatan'
      });
    }
  }

  tbl_HCIHistory.init({
    id_hci: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_kecamatan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    temp: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    clouds: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rain: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    wind: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hci_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hci_kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'tbl_HCIHistory',
    tableName: 'tbl_hcihistory',
    timestamps: true
  });

  return tbl_HCIHistory;
};
