'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_fasilitas_wisata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_fasilitas_wisata.init({
    id_fasilitas_wisata: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_wisata: {
      type: DataTypes.INTEGER
    },
    value_fasilitas_wisata: {
      type: DataTypes.INTEGER
    },
    nama_fasilitas_wisata: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'tbl_fasilitas_wisata',
    tableName: 'tbl_fasilitas_wisata',
  });
  return tbl_fasilitas_wisata;
};