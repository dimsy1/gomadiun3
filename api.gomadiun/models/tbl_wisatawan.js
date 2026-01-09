'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_Wisatawan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_Wisatawan.hasMany(models.tbl_pembayaran, {
        foreignKey: 'id_wisatawan',
        sourceKey: 'id_wisatawan',
        as: "pembayaran_detail_as",
      });
    }
  }
  tbl_Wisatawan.init({
    id_wisatawan: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(50),
    },
    name: DataTypes.STRING,
    nama_lengkap: DataTypes.STRING,
    no_hp: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    profile: DataTypes.STRING,
    refresh_token: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'tbl_Wisatawan',
    tableName: 'tbl_wisatawan',
  });
  return tbl_Wisatawan;
};