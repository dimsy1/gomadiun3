'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_fasilitas_paket_homestay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_fasilitas_paket_homestay.init({
    id_fasilitas_paket: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_paket_homestay: {
      type: DataTypes.INTEGER
    },
    value_fasilitas_paket: {
      type: DataTypes.INTEGER
    },
    nama_fasilitas_paket: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'tbl_fasilitas_paket_homestay',
    tableName: 'tbl_fasilitas_paket_homestay',
  });
  return tbl_fasilitas_paket_homestay;
};