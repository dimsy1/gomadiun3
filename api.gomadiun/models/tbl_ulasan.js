'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_ulasan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_ulasan.init({
    id_ulasan: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_wisatawan: {
      type: DataTypes.INTEGER
    },
    id_pesanan: {
      type: DataTypes.INTEGER
    },
    id_wisata: {
      type: DataTypes.INTEGER
    },
    id_paket_wisata: {
      type: DataTypes.INTEGER
    },
    rate: {
      type: DataTypes.INTEGER
    },
    komentar: {
      type: DataTypes.TEXT
    },
  }, {
    sequelize,
    modelName: 'tbl_ulasan',
    tableName: 'tbl_ulasan',
  });
  return tbl_ulasan;
};