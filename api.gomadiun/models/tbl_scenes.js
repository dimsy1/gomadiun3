'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_scenes extends Model {
    static associate(models) {
      // Definisikan asosiasi: Satu scene dimiliki oleh satu wisata
      tbl_scenes.belongsTo(models.tbl_Wisata, {
        foreignKey: 'wisata_id',
        as: 'wisata'
      });
      // Definisikan asosiasi: Satu scene bisa memiliki banyak hotspot
      tbl_scenes.hasMany(models.tbl_hotspots, {
        foreignKey: 'scene_id',
        sourceKey: 'sceneId', // Penting: hubungkan ke sceneId, bukan 'id'
        as: 'hotspots'
      });
    }
  }
  tbl_scenes.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    sceneId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    title: DataTypes.STRING,
    panorama: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hfov: DataTypes.INTEGER,
    pitch: DataTypes.DECIMAL(10, 6),
    yaw: DataTypes.DECIMAL(10, 6),
    wisata_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'tbl_scenes',
    tableName: 'tbl_scenes',
    timestamps: false // Tabel tidak memiliki createdAt/updatedAt
  });
  return tbl_scenes;
};
