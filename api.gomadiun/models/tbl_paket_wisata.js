'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_Paket_Wisata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_Paket_Wisata.belongsTo(models.tbl_DesaWisata, {
        foreignKey: 'id_desaWisata',
        targetKey: 'id_desaWisata', 
        as: "wisata_desawisata_as",
      });
    }
  }
  tbl_Paket_Wisata.init({
    id_paket_wisata: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_desaWisata: {
      type: DataTypes.INTEGER
    },
    id_admin: {
      type: DataTypes.INTEGER
    },
    id_admin_verifed: {
      type: DataTypes.INTEGER
    },
    id_admin_pengelola: {
      type: DataTypes.INTEGER
    },
    nama_paket_wisata: {
      type: DataTypes.STRING
    },
    nib_paket_wisata: {
      type: DataTypes.STRING
    },
    kbli_paket_wisata: {
      type: DataTypes.STRING
    },
    alamat_paket_wisata: {
      type: DataTypes.STRING
    },
    npwp_paket_wisata: {
      type: DataTypes.STRING
    },
    npwp_pemilik_paket_wisata: {
      type: DataTypes.STRING
    },
    desk_paket_wisata: {
      type: DataTypes.TEXT
    },
    content_paket_wisata: {
      type: DataTypes.TEXT
    },
    maps_paket_wisata: {
      type: DataTypes.TEXT
    },
    sampul_paket_wisata: {
      type: DataTypes.STRING
    },
    ruang_paket_wisata: {
      type: DataTypes.STRING
    },
    harga_paket_wisata: {
      type: DataTypes.INTEGER
    },
    status_jalan: {
      type: DataTypes.ENUM('1', '2', '3'),
    },
    jenis_kendaraan: {
      type: DataTypes.ENUM('1', '2', '3'),
    },
    jumlah_fasilitas: {
      type: DataTypes.INTEGER,
    },
    rate: {
      type: DataTypes.DOUBLE(10, 2),
    },
    kontak_person_paket_wisata: {
      type: DataTypes.STRING
    },
    total_pengunjung_paket_wisata: {
      type: DataTypes.INTEGER
    }, 
    status_paket_wisata: {
      type: DataTypes.ENUM('Pribadi', 'Bumdes', 'Pemda'),
    },
    jenis_paket_wisata: {
      type: DataTypes.ENUM('buatan', 'alam', 'religi', 'senibudaya'),
    },
    status_verifikasi: {
      type: DataTypes.ENUM('verifed', 'unverifed'),
      defaultValue: 'unverifed'
    },
    id_admin_author: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'tbl_Paket_wisata',
    tableName: 'tbl_paket_wisata',
  });
  return tbl_Paket_Wisata;
};
