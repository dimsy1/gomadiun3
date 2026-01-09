'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_fasilitas_utama_penginapan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_fasilitas_utama_penginapan.init({
    id_fasilitas_utama: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_penginapan: {
      type: DataTypes.INTEGER
    },
    value_fasilitas_penginapan: {
      type: DataTypes.INTEGER
    },
    fasilitas: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'tbl_fasilitas_utama_penginapan',
    tableName: 'tbl_fasilitas_utama_penginapan',
  });
  return tbl_fasilitas_utama_penginapan;
};