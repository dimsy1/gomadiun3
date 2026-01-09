'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_detail_pesanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_detail_pesanan.hasOne(models.tbl_Wisata, {
        foreignKey: 'id_wisata',
        sourceKey: 'id_menu',
        as: "tiket_detail_as",
      });
      tbl_detail_pesanan.hasOne(models.tbl_Paket_wisata, {
        foreignKey: 'id_paket_wisata',
        sourceKey: 'id_menu',
        as: "paket_wisata_detail_as",
      });
      tbl_detail_pesanan.hasOne(models.tbl_Kamar, {
        foreignKey: 'id_kamar',
        sourceKey: 'id_menu',
        as: "kamar_detail_as",
      });
      tbl_detail_pesanan.hasOne(models.tbl_Paket_homestay, {
        foreignKey: 'id_paket_homestay',
        sourceKey: 'id_menu',
        as: "homestay_detail_as",
      });
      tbl_detail_pesanan.hasOne(models.tbl_Menu, {
        foreignKey: 'id_menu',
        sourceKey: 'id_menu',
        as: "menu_detail_as",
      });
    }
  }
  tbl_detail_pesanan.init({
    id_detail_pesanan: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_pesanan: {
      type: DataTypes.INTEGER
    },
    id_menu: {
      type: DataTypes.INTEGER
    },
    nama_menu: {
      type: DataTypes.STRING
    },
    jumlah: {
      type: DataTypes.INTEGER
    },
    harga_satuan: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'tbl_detail_pesanan',
    tableName: 'tbl_detail_pesanan',
  });
  return tbl_detail_pesanan;
};