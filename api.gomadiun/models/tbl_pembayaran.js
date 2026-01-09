'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_pembayaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // tbl_pembayaran.hasOne(models.tbl_Wisatawan, {
      //   foreignKey: 'id_wisatawan',
      //   sourceKey: 'id_wisatawan',
      //   as: "wisatawan_detail_as",
      // });
     tbl_pembayaran.belongsTo(models.tbl_Wisatawan, {
  foreignKey: 'id_wisatawan',
  targetKey: 'id_wisatawan',
  as: 'wisatawan_detail_as',
});

    }
  }
  tbl_pembayaran.init({
    id_pembayaran: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_wisatawan: {
      type: DataTypes.INTEGER,
    },
    kode_pembayaran: {
      type: DataTypes.STRING
    },
    total_pembayaran: {
      type: DataTypes.INTEGER
    },
    data_pembayaran_snap_token: {
      type: DataTypes.TEXT
    },
    data_pembayaran_snap_redirect_url: {
      type: DataTypes.TEXT
    },
    batas_pembayaran: {
        type: DataTypes.DATE,
        // allowNull: false,
    },
    tgl_pembayaran: {
      type: DataTypes.DATE,
    },
    metode_pembayaran: {
      type: DataTypes.STRING
    },
    status_pembayaran: {
      type: DataTypes.ENUM('belum_bayar', 'bayar', 'selesai', 'batal'),
    },
    keterangan_pembayaran: {
      type: DataTypes.TEXT
    },
  }, {
    sequelize,
    modelName: 'tbl_pembayaran',
    tableName: 'tbl_pembayaran',
  });
  return tbl_pembayaran;
};