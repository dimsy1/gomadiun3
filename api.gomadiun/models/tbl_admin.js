'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_Admin extends Model {
    static associate(models) {
      // define association here
    }
  }
  tbl_Admin.init({
    id_admin: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_admin_pemilik: {
      type: DataTypes.INTEGER
    },
    nama_admin: {
      type: DataTypes.STRING
    },
    namaLengkap_admin: {
      type: DataTypes.STRING
    },
    email_admin: {
      type: DataTypes.STRING
    },
    password_admin: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.ENUM('admin', 'dinas', 'admin pengelola', 'admin industri', 'user pengelola', 'user industri')
    },
    nip_admin: {
      type: DataTypes.STRING
    },
    nohp_admin: {
      type: DataTypes.STRING
    },
    alamat_admin: {
      type: DataTypes.STRING
    },
    sampul_admin: {
      type: DataTypes.STRING
    },
    status_akun: {
      type: DataTypes.ENUM('aktif', 'suspend'),
      defaultValue: 'aktif'
    },
    refresh_token: {
      type: DataTypes.TEXT
    },
    id_admin_author: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'tbl_Admin',
    tableName: 'tbl_admin',
  });
  return tbl_Admin;
};