'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_Gallery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  tbl_Gallery.init({
    id_gallery: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_kamar: {
      type: DataTypes.INTEGER
    },
    name_table: {
      type: DataTypes.STRING
    },
    name_image: {
      type: DataTypes.STRING
    },
    url: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'tbl_Gallery',
    tableName: 'tbl_gallery',
  });
  return tbl_Gallery;
};