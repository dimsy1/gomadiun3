'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_Kamar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_Kamar.hasMany(models.tbl_Gallery, {
        foreignKey: 'id_kamar',
        sourceKey: 'id_kamar',
        as: "kamar_gallery_as",
      });
      tbl_Kamar.belongsTo(models.tbl_Penginapan, {
        foreignKey: 'id_penginapan',
        targetKey: 'id_penginapan', 
        as: "penginapan_as",
      });
    }
  }
  tbl_Kamar.init({
    id_kamar: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_penginapan: {
      type: DataTypes.INTEGER
    },
    id_admin: {
      type: DataTypes.INTEGER
    },
    id_admin_verifed: {
      type: DataTypes.INTEGER
    },
    id_admin_pengelola: {
      type: DataTypes.INTEGER
    },
    nama_kamar: {
      type: DataTypes.STRING
    },
    deskripsi: {
      type: DataTypes.TEXT
    },
    harga: {
      type: DataTypes.INTEGER
    },
    sampul_kamar: {
      type: DataTypes.STRING
    },
    ruang_kamar: {
      type: DataTypes.STRING
    },
    ruang_kamar_dua: {
      type: DataTypes.STRING
    },
    ruang_kamar_tiga: {
      type: DataTypes.STRING
    },
    ruang_kamar_empat: {
      type: DataTypes.STRING
    },
    ruang_kamar_lima: {
      type: DataTypes.STRING
    },
    kapasitas: {
      type: DataTypes.INTEGER
    },
    jumlah_kamar: {
      type: DataTypes.INTEGER
    },
    bebas_rokok: {
      type: DataTypes.ENUM('true', 'false'),
    },
    fasilitas_sarapan: {
      type: DataTypes.ENUM('true', 'false'),
    },
    id_admin_author: {
      type: DataTypes.INTEGER
    },
    status_verifikasi: {
      type: DataTypes.ENUM('verified', 'unverified'),
      defaultValue: 'unverified'
    },
  }, {
    sequelize,
    modelName: 'tbl_Kamar',
    tableName: 'tbl_kamar',
  });
  return tbl_Kamar;
};