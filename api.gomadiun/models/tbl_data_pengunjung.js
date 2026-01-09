'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_data_pengunjung extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi dinamis berdasarkan nilai id_table
      tbl_data_pengunjung.belongsTo(models.tbl_Wisata, {
        foreignKey: 'id_table',
        targetKey: 'id_wisata',
        constraints: false, // Disable foreign key constraints, so it works across different tables
        as: 'wisata', // Alias untuk relasi wisata
      });

       tbl_data_pengunjung.belongsTo(models.tbl_Paket_wisata, {
    foreignKey: 'id_table',
    targetKey: 'id_paket_wisata',
    constraints: false,
    as: 'paket_wisata',
  });
    
      tbl_data_pengunjung.belongsTo(models.tbl_Penginapan, {
        foreignKey: 'id_table',
        targetKey: 'id_penginapan',
        constraints: false,
        as: 'penginapan', // Alias untuk relasi penginapan
      });
    
      tbl_data_pengunjung.belongsTo(models.tbl_Kuliner, {
        foreignKey: 'id_table',
        targetKey: 'id_kuliner',
        constraints: false,
        as: 'kuliner', // Alias untuk relasi kuliner
      });
    }
  }    
  tbl_data_pengunjung.init({
    id_data_pengunjung: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_table: {
      type: DataTypes.INTEGER
    },
    id_admin_verifed: {
      type: DataTypes.INTEGER
    },
    nama_table: {
      type: DataTypes.STRING
    },
    tahun_data_pengunjung: {
      type: DataTypes.INTEGER
    },
    bulan_data_pengunjung: {
      type: DataTypes.INTEGER
    },
    jumlah_pengunjung_aplikasi: {
      type: DataTypes.INTEGER
    },
    jumlah_pengunjung_lokal: {
      type: DataTypes.INTEGER
    },
    jumlah_pengunjung_mancanegara: {
      type: DataTypes.INTEGER
    },
    jumlah_pegawai_laki: {
      type: DataTypes.INTEGER
    },
    jumlah_pegawai_perempuan: {
      type: DataTypes.INTEGER
    },
    status_verifikasi: {
      type: DataTypes.ENUM('verified', 'unverified', 'rejected'),
      defaultValue: 'unverified'
    },
  }, {
    sequelize,
    modelName: 'tbl_data_pengunjung',
    tableName: 'tbl_data_pengunjung',
  });
  return tbl_data_pengunjung;
};