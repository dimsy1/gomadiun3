'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_Menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_Menu.hasMany(models.tbl_Kategori_menu, {
        foreignKey: 'id_menu',
        sourceKey: 'id_menu',
        as: "kategori_menu_as",
      });
      tbl_Menu.belongsTo(models.tbl_Kuliner, {
        foreignKey: 'id_kuliner',
        sourceKey: 'id_kuliner',
        as: "kuliner_as",
      });
      tbl_Menu.hasMany(models.tbl_Kategori_menu, {
        foreignKey: 'id_kategori_menu',
        sourceKey: 'id_kategori_menu',
        as: "kategori_as",
      });
    }
  }
  tbl_Menu.init({
    id_menu: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_kuliner: {
      type: DataTypes.INTEGER
    },
    id_kategori_menu: {
      type: DataTypes.INTEGER
    },
    id_admin: {
      type: DataTypes.INTEGER
    },
    id_admin_pengelola: {
      type: DataTypes.INTEGER
    },
    nama_menu: {
      type: DataTypes.STRING
    },
    harga_menu: {
      type: DataTypes.INTEGER
    },
    sampul_menu: {
      type: DataTypes.STRING
    },
    id_admin_author: {
      type: DataTypes.INTEGER
    },
    status_tersedia: {
      type: DataTypes.ENUM('tersedia', 'habis'),
    },
  }, {
    sequelize,
    modelName: 'tbl_Menu',
    tableName: 'tbl_menu',
  });
  return tbl_Menu;
};