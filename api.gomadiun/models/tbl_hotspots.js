'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_hotspots extends Model {
    static associate(models) {
      tbl_hotspots.belongsTo(models.tbl_scenes, {
        foreignKey: 'scene_id',
        targetKey: 'sceneId', // Penting: hubungkan ke sceneId, bukan 'id'
        as: 'scene'
      });
    }
  }
  tbl_hotspots.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    pitch: DataTypes.DECIMAL(10, 6),
    yaw: DataTypes.DECIMAL(10, 6),
    type: DataTypes.ENUM('scene', 'info'),
    text: DataTypes.STRING,
    sceneId_target: DataTypes.STRING(50),
    target_yaw: DataTypes.DECIMAL(10, 6),
    target_pitch: DataTypes.DECIMAL(10, 6),
    scene_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'tbl_hotspots',
    tableName: 'tbl_hotspots',
    timestamps: false
  });
  return tbl_hotspots;
};
