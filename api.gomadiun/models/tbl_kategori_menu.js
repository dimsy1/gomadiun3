'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_Kategori_menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_Kategori_menu.belongsTo(models.tbl_Kuliner, {
        foreignKey: 'id_kuliner',
        sourceKey: 'id_kuliner',
        as: "kuliner_as",
      });
      tbl_Kategori_menu.belongsTo(models.tbl_Menu, {
        foreignKey: 'id_kategori_menu',
        targetKey: 'id_kategori_menu',
        as: "menu_as",
      });
    }
  }
  tbl_Kategori_menu.init({
    id_kategori_menu: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_admin: {
      type: DataTypes.INTEGER
    },
    id_kuliner: {
      type: DataTypes.INTEGER
    },
    id_menu: {
      type: DataTypes.INTEGER
    },
    nama_kategori_menu: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'tbl_Kategori_menu',
    tableName: 'tbl_kategori_menu',
  });
  return tbl_Kategori_menu;
};