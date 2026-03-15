'use strict';

const db = require('../models');
const tbl_Admin = db.tbl_Admin;
const tbl_Kecamatan = db.tbl_Kecamatan;
const tbl_HCIHistory = db.tbl_HCIHistory
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const multer = require('multer');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Pastikan axios sudah terpasang
require('dotenv').config();

// Setup storage untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "./uploads/geojson";
    cb(null, dest); // Menyimpan file di folder uploads/geojson
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Menggunakan nama asli file yang di-upload
  }
});


// Filter untuk hanya menerima file GeoJSON
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/json' || path.extname(file.originalname) === '.geojson') {
    cb(null, true); // Terima file GeoJSON
  } else {
    cb(new Error('Hanya file GeoJSON yang diperbolehkan!'), false); // Tolak file lain
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).single('geojson'); // 'geojson' adalah nama field pada form-data


const getAllKecamatan = async (req, res) => {
  try {
    const data = await tbl_Kecamatan.findAll({
      attributes: [
        'id_kecamatan',
        'nama_kecamatan',
        'geojson',
        'zoom_level',
        'latitude',
        'longitude',
        'createdAt',
        'updatedAt'
      ],
      include: [
        {
          model: tbl_HCIHistory,
          as: 'hci_history',
          attributes: [
            'tanggal', 'temp', 'clouds', 'rain', 'wind', 'hci_score', 'hci_kategori', 'pressure', 'humidity', 'visibility',
          ],
          order: [['tanggal', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const parsedData = data.map(item => ({
      ...item.toJSON(),
      geojson: typeof item.geojson === 'string' ? JSON.parse(item.geojson) : item.geojson
    }));

    return res.status(200).json({
      status: "success",
      message: "Data kecamatan beserta riwayat HCI berhasil diambil",
      data: parsedData
    });
  } catch (error) {
    console.error("❌ Gagal mengambil data kecamatan:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      data: null
    });
  }
};


  
// Fungsi untuk menambahkan kecamatan oleh Admin
const add_kecamatan_byAdmin = async (req, res) => {
  try {
    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ message: "Akun Belum Login!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_admin_login = decoded.id;

    const user_admin = await tbl_Admin.findOne({
      attributes: ['role'],
      where: { id_admin: id_admin_login }
    });

    if (!user_admin || (user_admin.role !== "admin" && user_admin.role !== "dinas")) {
      return res.status(403).json({ message: "Hak akses ditolak" });
    }

    // Menggunakan middleware multer untuk menghandle file upload
    upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
      
        const { nama_kecamatan, zoom_level, latitude, longitude } = req.body;
      
        if (!nama_kecamatan || !zoom_level || !latitude || !longitude || !req.file) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan kecamatan dan unggah file GeoJSON" });
        }
      
        const existingKecamatan = await tbl_Kecamatan.findOne({
          where: { nama_kecamatan }
        });
      
        if (existingKecamatan) {
          return res.status(409).json({ status: 'error', message: "Nama kecamatan sudah terdaftar" });
        }
      
        // Baca dan parse isi file GeoJSON
        let geojsonData = null;
        try {
          const geojsonContent = fs.readFileSync(req.file.path, 'utf-8');
          geojsonData = JSON.parse(geojsonContent);
        
          // Validasi dasar
          if (!geojsonData.type || geojsonData.type !== "FeatureCollection") {
            return res.status(400).json({ status: 'error', message: 'File GeoJSON harus berupa FeatureCollection yang valid.' });
          }
        
        } catch (err) {
          return res.status(400).json({ status: 'error', message: 'Gagal membaca file GeoJSON: ' + err.message });
        }
      
        const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
      
        const newKecamatan = await tbl_Kecamatan.create({
          id_admin: id_admin_login,
          nama_kecamatan,
          geojson: geojsonData, // ⬅️ SIMPAN OBJEK GEOMETRY LANGSUNG
          zoom_level,
          latitude,
          longitude,
          createdAt: currentDateTime,
          updatedAt: currentDateTime,
          // hci_score: null,
          // hci_kategori: null,
          // tanggal_perhitungan: null
        });
      
        return res.status(201).json({
          status: "success",
          message: "Kecamatan berhasil ditambahkan",
          data: newKecamatan
        });
      });
  } catch (error) {
    console.error("Error saat menambahkan kecamatan:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }};

  // Fungsi untuk update kecamatan
const update_kecamatan = async (req, res) => {
  try {
    const token = req.cookies.tokenadmin;
    if (!token) {
      return res.status(401).json({ message: "Akun Belum Login!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_admin_login = decoded.id;

    const user_admin = await tbl_Admin.findOne({
      attributes: ['role'],
      where: { id_admin: id_admin_login }
    });

    if (!user_admin || (user_admin.role !== "admin" && user_admin.role !== "dinas")) {
      return res.status(403).json({ message: "Hak akses ditolak" });
    }

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { nama_kecamatan, zoom_level, latitude, longitude } = req.body;
      const { id } = req.params;

      if (!nama_kecamatan || !zoom_level || !latitude || !longitude || !req.file) {
        return res.status(422).json({ status: 'error', message: "Lengkapi semua input dan unggah GeoJSON" });
      }

      const kecamatan = await tbl_Kecamatan.findByPk(id);
      if (!kecamatan) {
        return res.status(404).json({ status: 'error', message: "Data kecamatan tidak ditemukan" });
      }

      // Baca dan validasi GeoJSON
      let geojsonData;
      try {
        const geojsonContent = fs.readFileSync(req.file.path, 'utf-8');
        geojsonData = JSON.parse(geojsonContent);
        if (!geojsonData.type || geojsonData.type !== "FeatureCollection") {
          return res.status(400).json({ status: 'error', message: 'File GeoJSON harus berupa FeatureCollection yang valid.' });
        }
      } catch (err) {
        return res.status(400).json({ status: 'error', message: 'Gagal membaca file GeoJSON: ' + err.message });
      }

      // Update data
      await kecamatan.update({
        id_admin: id_admin_login,
        nama_kecamatan,
        geojson: geojsonData,
        zoom_level,
        latitude,
        longitude,
        updatedAt: moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
      });

      // Hapus file geojson setelah digunakan
      fs.unlinkSync(req.file.path);

      return res.status(200).json({
        status: 'success',
        message: 'Data kecamatan berhasil diupdate',
        data: kecamatan
      });
    });

  } catch (error) {
    console.error("❌ Error update kecamatan:", error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      data: null
    });
  }
};

const delete_kecamatan_byId = async (req, res) => {
  try {
    const token = req.cookies.tokenadmin;
    if (!token) {
      return res.status(401).json({ message: "Akun Belum Login!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_admin_login = decoded.id;

    const user_admin = await tbl_Admin.findOne({
      attributes: ['role'],
      where: { id_admin: id_admin_login }
    });

    if (!user_admin || (user_admin.role !== "admin" && user_admin.role !== "dinas")) {
      return res.status(403).json({ message: "Hak akses ditolak" });
    }

    const { id } = req.params;

    const kecamatan = await tbl_Kecamatan.findByPk(id);
    if (!kecamatan) {
      return res.status(404).json({ status: 'error', message: 'Data kecamatan tidak ditemukan' });
    }

    await kecamatan.destroy();

    return res.status(200).json({
      status: 'success',
      message: 'Data kecamatan berhasil dihapus'
    });

  } catch (error) {
    console.error('❌ Error saat menghapus kecamatan:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      data: null
    });
  }
};


module.exports = {
  add_kecamatan_byAdmin,
  update_kecamatan,
  // calculateHCI,
  getAllKecamatan,
  delete_kecamatan_byId
};
