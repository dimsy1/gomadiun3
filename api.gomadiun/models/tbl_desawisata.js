'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_DesaWisata extends Model {
    static associate(models) {
      tbl_DesaWisata.hasMany(models.tbl_Wisata, {
        foreignKey: 'id_desaWisata',
        sourceKey: 'id_desaWisata',
        as: "desawisata_wisata_as",
      });

      tbl_DesaWisata.hasMany(models.tbl_Kuliner, {
        foreignKey: 'id_desaWisata',
        sourceKey: 'id_desaWisata',
        as: "desawisata_kuliner_as",
      });

      tbl_DesaWisata.hasMany(models.tbl_Penginapan, {
        foreignKey: 'id_desaWisata',
        sourceKey: 'id_desaWisata',
        as: "desawisata_penginapan_as",
      });
    }
  }
  tbl_DesaWisata.init({
    id_desaWisata: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_admin: {
      type: DataTypes.INTEGER
    },
    id_admin_verifed: {
      type: DataTypes.INTEGER
    },
    nama_desaWisata: {
      type: DataTypes.STRING
    },
    desk_desaWisata: {
      type: DataTypes.TEXT
    },
    sampul_desaWisata: {
      type: DataTypes.STRING
    },
    kontak_person_desawisata: {
      type: DataTypes.STRING
    },
    total_pengunjung: {
      type: DataTypes.INTEGER
    }, 
    id_admin_author: {
      type: DataTypes.INTEGER
    },
     // 🌍 Tambahan untuk pemetaan
     latitude: {
      type: DataTypes.FLOAT,
        allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
        allowNull: true
        },
    status_verifikasi: {
      type: DataTypes.ENUM('verified', 'unverified'),
      defaultValue: 'unverified'
    },
    geometry: {
      type: DataTypes.GEOMETRY('POLYGON'),
      allowNull: true
    }    
  }, {
    sequelize,
    modelName: 'tbl_DesaWisata',
    tableName: 'tbl_desawisata',
  });
  return tbl_DesaWisata;
};