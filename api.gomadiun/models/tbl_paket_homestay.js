'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_Paket_homestay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_Paket_homestay.hasMany(models.tbl_fasilitas_paket_homestay, {
        foreignKey: 'id_paket_homestay',
        sourceKey: 'id_paket_homestay',
        as: "fasilitas_homestay_as",
      });
      tbl_Paket_homestay.hasMany(models.tbl_Gallery, {
        foreignKey: 'id_kamar',
        sourceKey: 'id_paket_homestay',
        as: "kamar_gallery_as",
      });
      tbl_Paket_homestay.belongsTo(models.tbl_Penginapan, {
        foreignKey: 'id_penginapan',
        targetKey: 'id_penginapan', 
        as: "penginapan_as",
      });
    }
  }

  tbl_Paket_homestay.init({
    id_paket_homestay: {
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
    nama_paket_homestay: {
      type: DataTypes.STRING
    },
    deskripsi_paket_homestay: {
      type: DataTypes.TEXT
    },
    harga: {
      type: DataTypes.INTEGER
    },
    sampul_paket_homestay: {
      type: DataTypes.STRING
    },
    ruang_paket_homestay: {
      type: DataTypes.STRING
    },
    ruang_paket_homestay_dua: {
      type: DataTypes.STRING
    },
    ruang_paket_homestay_tiga: {
      type: DataTypes.STRING
    },
    ruang_paket_homestay_empat: {
      type: DataTypes.STRING
    },
    ruang_paket_homestay_lima: {
      type: DataTypes.STRING
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
    modelName: 'tbl_Paket_homestay',
    tableName: 'tbl_paket_homestay'
  });
  return tbl_Paket_homestay;
};