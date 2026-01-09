'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_pesanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_pesanan.hasOne(models.tbl_Wisata, {
        foreignKey: 'id_wisata',
        sourceKey: 'id_destinasi',
        as: "wisata_detail_as",
      });
      tbl_pesanan.hasOne(models.tbl_Paket_wisata, {
        foreignKey: 'id_paket_wisata',
        sourceKey: 'id_destinasi',
        as: "paket_wisata_detail_as",
      });
      tbl_pesanan.hasOne(models.tbl_Kamar, {
        foreignKey: 'id_kamar',
        sourceKey: 'id_destinasi',
        as: "kamar_detail_as",
      });
      tbl_pesanan.hasOne(models.tbl_Paket_homestay, {
        foreignKey: 'id_paket_homestay',
        sourceKey: 'id_destinasi',
        as: "homestay_detail_as",
      });
      tbl_pesanan.hasOne(models.tbl_Kuliner, {
        foreignKey: 'id_kuliner',
        sourceKey: 'id_destinasi',
        as: "kuliner_detail_as",
      });
      tbl_pesanan.hasMany(models.tbl_detail_pesanan, {
        foreignKey: 'id_pesanan',
        sourceKey: 'id_pesanan',
        as: "pesanan_detail_as",
      });
    }
  }
  tbl_pesanan.init({
    id_pesanan: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_pembayaran: {
      type: DataTypes.INTEGER
    },
    id_wisatawan: {
      type: DataTypes.INTEGER
    },
    id_destinasi: {
      type: DataTypes.INTEGER
    },
    nama_destinasi: {
      type: DataTypes.STRING
    },
    kode_pesanan: {
      type: DataTypes.STRING
    },
    kode_qr: {
      type: DataTypes.STRING
    },
    tgl_booking: {
      type: DataTypes.DATE
    },
    total_pesanan: {
      type: DataTypes.INTEGER
    },
    status_pesanan: {
      type: DataTypes.ENUM('keranjang', 'proses', 'selesai'),
    },
  }, {
    sequelize,
    modelName: 'tbl_pesanan',
    tableName: 'tbl_pesanan',
  });
  return tbl_pesanan;
};