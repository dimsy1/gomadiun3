'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_announcement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_announcement.init({
    id_announcements: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    judul_event: {
      type: DataTypes.STRING
    },
    url_poster: {
      type: DataTypes.STRING
    },
    name_poster: {
      type: DataTypes.STRING
    },
    desk_event: {
      type: DataTypes.TEXT
    },
    url_announcements: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'tbl_announcement',
    tableName: 'tbl_announcement',
  });
  return tbl_announcement;
};