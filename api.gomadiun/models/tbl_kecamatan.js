'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tbl_Kecamatan extends Model {
    static associate(models) {
      tbl_Kecamatan.hasMany(models.tbl_HCIHistory, {
        foreignKey: 'id_kecamatan',
        as: 'hci_history'
      });
      tbl_Kecamatan.hasMany(models.tbl_Wisata, {
        foreignKey: 'id_kecamatan',
        as: 'hci_wisata'
      });
    }
  }

  tbl_Kecamatan.init({
    id_kecamatan: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_admin: {
      type: DataTypes.INTEGER
    },
    nama_kecamatan: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    geojson: {
      type: DataTypes.JSON,
      allowNull: true
    },
    zoom_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'tbl_Kecamatan',
    tableName: 'tbl_kecamatan',
  });

  return tbl_Kecamatan;
};
