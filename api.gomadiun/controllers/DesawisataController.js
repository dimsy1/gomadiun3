const db = require('../models');
const tbl_DesaWisata = db.tbl_DesaWisata;
const tbl_Wisata = db.tbl_Wisata;
const tbl_Admin = db.tbl_Admin;
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Sequelize } = require("sequelize");
const multer = require('multer');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "./uploads/img/desawisata";
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Hanya support format .jpg, .jpeg, .png"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 300 * 1024 * 1024 }, // Limit file size to 300MB
});

//customer
const get_all_desawisata = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      keyword = '',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.and]: [
        { status_verifikasi: "verified" },
        keyword ? {
          [Op.or]: [
            { nama_desaWisata: { [Op.like]: `%${keyword}%` } },
            { desk_desaWisata: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    };

const data = await tbl_DesaWisata.findAndCountAll({
  where: whereClause,
  // hapus limit & offset biar semua data keluar
  include: [
    {
      model: tbl_Wisata,
      as: "desawisata_wisata_as",
      attributes: ["id_wisata"],
    },
  ],
});

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    if (data.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
        pages: {
          total: 0,
          per_page: limit || 0,
          next_page: null,
          to: 0,
          last_page: 0,
          current_page: page || 1,
          from: 0,
        },
      });
    }

    data.rows.sort((a, b) => {
      return b.desawisata_wisata_as.length - a.desawisata_wisata_as.length;
    });

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((items) => {
        let polygonGeometry = items.geometry;

        // Jika geometry belum ada, generate manual berdasarkan lat/lon
        if (!polygonGeometry || !polygonGeometry.coordinates || polygonGeometry.coordinates.length === 0) {
          const lat = parseFloat(items.latitude);
          const lon = parseFloat(items.longitude);
          const delta = 0.001; // ukuran polygon kecil

          polygonGeometry = {
            type: "Polygon",
            coordinates: [[
              [lon - delta, lat - delta],
              [lon + delta, lat - delta],
              [lon + delta, lat + delta],
              [lon - delta, lat + delta],
              [lon - delta, lat - delta],
            ]]
          };
        }

        return {
          id_desaWisata: items.id_desaWisata,
          nama_desaWisata: items.nama_desaWisata,
          desk_desaWisata: items.desk_desaWisata,
          latitude: items.latitude,
          longitude: items.longitude,
          sampul_desaWisata: items.sampul_desaWisata,
          kontak_person_desawisata: items.kontak_person_desawisata,
          data_wisata: {
            jumlah_wisata: items.desawisata_wisata_as.length
          },
          // geometry: polygonGeometry
        };
      }),
      pages: {
        total: data.count,
        per_page: parseInt(limit, 10) || data.count,
        next_page: limit && page ? (page < totalPages ? page + 1 : null) : null,
        to: limit ? offset + data.rows.length : data.count,
        last_page: totalPages,
        current_page: parseInt(page, 10) || 1,
        from: offset,
      }
    };

    const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const excludePagesUrl = "http://localhost:3001/api/desawisata/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);

  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }
};

const get_detail_desawisata = async (req, res) => {
  try {
    const { id_desaWisata } = req.params;

    if (!id_desaWisata) {
      return res.status(400).json({ success: false, message: "id_desaWisata is required" });
    }

    const data = await tbl_DesaWisata.findOne({
      where: { id_desaWisata },
    });

    if (!data) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    let polygonGeometry = data.geometry;

    // Fallback Polygon dari lat/lon jika geometry null
    if (!polygonGeometry || !polygonGeometry.coordinates || polygonGeometry.coordinates.length === 0) {
      const lat = parseFloat(data.latitude);
      const lon = parseFloat(data.longitude);
      const delta = 0.001;

      polygonGeometry = {
        type: "Polygon",
        coordinates: [[
          [lon - delta, lat - delta],
          [lon + delta, lat - delta],
          [lon + delta, lat + delta],
          [lon - delta, lat + delta],
          [lon - delta, lat - delta],
        ]]
      };
    }

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: {
        id_desaWisata: data.id_desaWisata,
        nama_desaWisata: data.nama_desaWisata,
        desk_desaWisata: data.desk_desaWisata,
        latitude: data.latitude,
        longitude: data.longitude,
        sampul_desaWisata: data.sampul_desaWisata,
        kontak_person_desawisata: data.kontak_person_desawisata,
        geometry: polygonGeometry
      }
    };

    res.status(200).json(result);

  } catch (error) {
    console.log("Data Error", error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }
};



//admin
const get_all_desawisata_byAdmin = async (req, res) => {
  try {
    const token = req.cookies.tokenadmin;
    if (!token) {
      return res.status(401).json({ message: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_admin = decoded.id;

    const user_admin = await tbl_Admin.findOne({
      attributes: ['role'],
      where: { id_admin }
    });

    if (!["admin", "dinas", "admin pengelola", "admin industri"].includes(user_admin.role)) {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const {
      keyword = '',
      byAdmin = '',
      order = 'DESC',
    } = req.query;

    const whereClause = {
      [Op.and]: [
        byAdmin ? { id_admin: byAdmin } : {},
        keyword ? {
          [Op.or]: [
            { nama_desaWisata: { [Op.like]: `%${keyword}%` } },
            { desk_desaWisata: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    };

    const orderClause = [['id_desaWisata', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];

    const data = await tbl_DesaWisata.findAndCountAll({
      where: whereClause,
      order: orderClause,
      include: [
        {
          model: tbl_Wisata,
          as: "desawisata_wisata_as",
          attributes: ["id_wisata"],
        },
      ],
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    const results = await Promise.all(data.rows.map(async (desawisata) => {
      const [
        detail_author,
        detail_admin,
        detail_admin_verified
      ] = await Promise.all([
        tbl_Admin.findOne({
          where: { id_admin: desawisata.id_admin_author },
          attributes: ["id_admin", "nama_admin", "role", "namaLengkap_admin", "sampul_admin"]
        }),
        tbl_Admin.findOne({
          where: { id_admin: desawisata.id_admin },
          attributes: ["id_admin", "nama_admin", "role", "namaLengkap_admin", "sampul_admin"]
        }),
        tbl_Admin.findOne({
          where: { id_admin: desawisata.id_admin_verifed },
          attributes: ["id_admin", "nama_admin", "role", "namaLengkap_admin", "sampul_admin"]
        })
      ]);

      // Validasi polygon geometry
      let polygonGeometry = desawisata.geometry;

      if (
        !polygonGeometry ||
        !polygonGeometry.coordinates ||
        polygonGeometry.coordinates.length === 0
      ) {
        const lat = parseFloat(desawisata.latitude);
        const lon = parseFloat(desawisata.longitude);
        const delta = 0.001;

        polygonGeometry = {
          type: "Polygon",
          coordinates: [[
            [lon - delta, lat - delta],
            [lon + delta, lat - delta],
            [lon + delta, lat + delta],
            [lon - delta, lat + delta],
            [lon - delta, lat - delta],
          ]]
        };
      }

      return {
        id_desaWisata: desawisata.id_desaWisata,
        nama_desaWisata: desawisata.nama_desaWisata,
        desk_desaWisata: desawisata.desk_desaWisata,
        kontak_person_desawisata: desawisata.kontak_person_desawisata,
        latitude: desawisata.latitude,
        longitude: desawisata.longitude,
        geometry: polygonGeometry,
        sampul_desaWisata: desawisata.sampul_desaWisata,
        status_verifikasi: desawisata.status_verifikasi,
        detail_author,
        detail_admin,
        detail_admin_verified,
        updatedAt: desawisata.updatedAt,
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Desa Wisata",
      data: results
    });

  } catch (error) {
    console.error("Data Error:", error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }
};


const get_detail_desawisata_byAdmin = async (req, res) => {
  try {
    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ message: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_admin = decoded.id;

    const user_admin = await tbl_Admin.findOne({
      attributes: ['role'],
      where: { id_admin }
    });

    if (!["admin", "dinas", "admin pengelola", "admin industri"].includes(user_admin.role)) {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const { id_desaWisata } = req.params;
    if (!id_desaWisata) {
      return res.status(400).json({ error: "id_desaWisata is required" });
    }

    const data = await tbl_DesaWisata.findAndCountAll({
      where: { id_desaWisata }
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null
      });
    }

    const results = await Promise.all(data.rows.map(async (desawisata) => {
      const [
        detail_author,
        detail_admin,
        detail_admin_verified
      ] = await Promise.all([
        tbl_Admin.findOne({
          where: { id_admin: desawisata.id_admin_author },
          attributes: ["id_admin", "nama_admin", "role", "namaLengkap_admin", "sampul_admin"]
        }),
        tbl_Admin.findOne({
          where: { id_admin: desawisata.id_admin },
          attributes: ["id_admin", "nama_admin", "role", "namaLengkap_admin", "sampul_admin"]
        }),
        tbl_Admin.findOne({
          where: { id_admin: desawisata.id_admin_verifed },
          attributes: ["id_admin", "nama_admin", "role", "namaLengkap_admin", "sampul_admin"]
        })
      ]);

      // Cek & susun geometry
      let polygonGeometry = desawisata.geometry;

      if (
        !polygonGeometry ||
        !polygonGeometry.coordinates ||
        polygonGeometry.coordinates.length === 0
      ) {
        const lat = parseFloat(desawisata.latitude);
        const lon = parseFloat(desawisata.longitude);
        const delta = 0.001;

        polygonGeometry = {
          type: "Polygon",
          coordinates: [[
            [lon - delta, lat - delta],
            [lon + delta, lat - delta],
            [lon + delta, lat + delta],
            [lon - delta, lat + delta],
            [lon - delta, lat - delta],
          ]]
        };
      }

      return {
        id_desaWisata: desawisata.id_desaWisata,
        nama_desaWisata: desawisata.nama_desaWisata,
        desk_desaWisata: desawisata.desk_desaWisata,
        kontak_person_desawisata: desawisata.kontak_person_desawisata,
        latitude: desawisata.latitude,
        longitude: desawisata.longitude,
        geometry: polygonGeometry,
        sampul_desaWisata: desawisata.sampul_desaWisata,
        status_verifikasi: desawisata.status_verifikasi,
        total_pengunjung: desawisata.total_pengunjung,
        detail_author,
        detail_admin,
        detail_admin_verified,
        createdAt: desawisata.createdAt,
        updatedAt: desawisata.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Desa Wisata",
      data: results
    });

  } catch (error) {
    console.error("Data Error:", error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }
};



const generatePolygonSQL = (lat, lon) => {
  const delta = 0.001; // kira-kira 100 meter
  const coords = [
    [lon - delta, lat - delta],
    [lon + delta, lat - delta],
    [lon + delta, lat + delta],
    [lon - delta, lat + delta],
    [lon - delta, lat - delta]
  ];
  const coordString = coords.map(c => `${c[0]} ${c[1]}`).join(",");
  return `POLYGON((${coordString}))`;
};

const add_data_desawisata_byAdmin = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: err.message
      });
    }

    try {


      let id_admin_login;

      const token = req.cookies.tokenadmin;

      if (!token) {
        return res.status(401).json({ message: "Akun Belum Login!", token });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      id_admin_login = decoded.id;


      const user_admin = await tbl_Admin.findOne({
        attributes: ['role'],
        where: {
          id_admin: id_admin_login
        }
      });

      if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola" && user_admin.role !== "admin industri") {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

      let { id_admin, nama_desaWisata, desk_desaWisata, no_hp, latitude, longitude } = req.body;

      // Konversi latitude & longitude kosong menjadi null
      latitude = latitude && latitude.trim() !== "" ? latitude : null;
      longitude = longitude && longitude.trim() !== "" ? longitude : null;  
      
      const geometry = latitude && longitude
      ? Sequelize.fn('ST_GeomFromText', generatePolygonSQL(latitude, longitude), 4326)
      : null;

      let add_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas") {

        if (!id_admin || !nama_desaWisata || !desk_desaWisata || !no_hp) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan desa wisata" });
        }

        const cek_admin = await tbl_Admin.findAndCountAll({
          where: {
            id_admin: id_admin
          },
        });

        if (cek_admin.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Admin tidak terdaftar",
          });
        }

        if (user_admin.role === "dinas") {

          const uploadedFile = req.file.filename ? `${req.protocol}://${req.get("host")}/uploads/img/desawisata/${req.file.filename}` : null;

          add_data = await tbl_DesaWisata.create({
            id_admin,
            id_admin_author: id_admin_login,
            nama_desaWisata,
            desk_desaWisata,
            latitude,
            longitude,
            geometry,
            sampul_desaWisata: uploadedFile,
            kontak_person_desawisata: no_hp,
            total_pengunjung: 0,
            status_verifikasi: 'unverified',
            createdAt: currentDateTime,
            updatedAt: currentDateTime
          });

        } else {

          const uploadedFile = req.file.filename ? `${req.protocol}://${req.get("host")}/uploads/img/desawisata/${req.file.filename}` : null;

          add_data = await tbl_DesaWisata.create({
            id_admin,
            id_admin_author: id_admin_login,
            nama_desaWisata,
            desk_desaWisata,
            latitude,
            longitude,
            geometry,
            sampul_desaWisata: uploadedFile,
            kontak_person_desawisata: no_hp,
            total_pengunjung: 0,
            status_verifikasi: 'unverified',
            createdAt: currentDateTime,
            updatedAt: currentDateTime
          });

        }
      } else {

        if (!nama_desaWisata || !desk_desaWisata || !no_hp) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
        }

        const uploadedFile = `${req.protocol}://${req.get("host")}/uploads/img/desawisata/${req.file.filename}`;

        add_data = await tbl_DesaWisata.create({
          id_admin: '',
          id_admin_author: id_admin_login,
          nama_desaWisata: nama_desaWisata,
          desk_desaWisata: desk_desaWisata,
          latitude: latitude,
          longitude: longitude,
          geometry: geometry,
          sampul_desaWisata: uploadedFile,
          kontak_person_desawisata: no_hp,
          total_pengunjung: 0,
          status_verifikasi: 'unverified',
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

      }

      if (!add_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "Desa Wisata gagal ditambahkan",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Desa Wisata berhasil ditambahkan",
        data: add_data
      });

    } catch (error) {
      console.log(error, 'Data Error');
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        data: null
      });
    }
  });
};

const update_data_desawisata_byAdmin = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(422).json({ status: 'error', success: false, message: err.message });
    }

    try {
      const token = req.cookies.tokenadmin;
      if (!token) return res.status(401).json({ message: "Akun Belum Login!", token });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id_admin_login = decoded.id;

      const user_admin = await tbl_Admin.findOne({
        attributes: ['role'],
        where: { id_admin: id_admin_login }
      });

      if (!["admin", "dinas", "admin pengelola", "admin industri"].includes(user_admin.role)) {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
      const { id_desaWisata } = req.params;
      const { nama_desaWisata, desk_desaWisata, no_hp, latitude, longitude } = req.body;

      if (!id_desaWisata) return res.status(400).send({ error: "id_desaWisata is required" });

      const desawisata_update = await tbl_DesaWisata.findOne({ where: { id_desaWisata } });
      if (!desawisata_update) return res.status(422).json({ status: 'error', success: false, message: 'Desa Wisata tidak terdaftar' });

      if (!nama_desaWisata || !desk_desaWisata || !no_hp) {
        return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update desa wisata" });
      }

      let uploadedFile = desawisata_update.sampul_desaWisata;
      if (req.file) {
        const name_file = uploadedFile.split('/uploads/')[1];
        const oldFilePath = `./uploads/${name_file}`;
        fs.unlink(oldFilePath, (err) => { if (err) console.error('Error deleting old file:', err); });
        uploadedFile = `${req.protocol}://${req.get("host")}/uploads/img/desawisata/${req.file.filename}`;
      }

      // Fungsi untuk membuat geometry Polygon
      const generatePolygonGeometry = (lat, lon) => {
        const delta = 0.001;
        return {
          type: "Polygon",
          coordinates: [[
            [parseFloat(lon) - delta, parseFloat(lat) - delta],
            [parseFloat(lon) + delta, parseFloat(lat) - delta],
            [parseFloat(lon) + delta, parseFloat(lat) + delta],
            [parseFloat(lon) - delta, parseFloat(lat) + delta],
            [parseFloat(lon) - delta, parseFloat(lat) - delta]
          ]]
        };
      };

      // Siapkan field update
      const updateFields = {
        id_admin_author: id_admin_login,
        nama_desaWisata,
        desk_desaWisata,
        latitude,
        longitude,
        sampul_desaWisata: uploadedFile,
        kontak_person_desawisata: no_hp,
        updatedAt: currentDateTime
      };

      // Tambahkan geometry jika latitude dan longitude valid
      if (latitude && longitude) {
        updateFields.geometry = generatePolygonGeometry(latitude, longitude);
      }

      // Jalankan update
      const update_data = await desawisata_update.update(updateFields);

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Desa Wisata berhasil diubah",
        data: update_data
      });

    } catch (error) {
      console.log(error, 'Data Error');
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        data: null
      });
    }
  });
};


const put_verifikasi_desawisata = async (req, res) => {
  try {

    let id_admin_login;

    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_admin_login = decoded.id;

    const user_admin = await tbl_Admin.findOne({
      attributes: ['role'],
      where: {
        id_admin: id_admin_login
      }
    });

    if (user_admin.role !== "admin" && user_admin.role !== "dinas") {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    const { id_desaWisata } = req.params;

    if (!id_desaWisata) {
      return res.status(400).send({ error: "id_admin is required" });
    }

    const { id_admin, status_verifikasi } = req.body;

    if (!id_admin || !status_verifikasi) {
      return res.status(422).json({ status: 'error', message: "Lengkapi data inputan verifikasi desa" });
    }

    const admin_verifikator = await tbl_Admin.findOne({
      where: {
        [Op.and]: [
          { id_admin: id_admin },
          { role: "dinas" }
        ]
      }
    });

    if (!admin_verifikator) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Admin verifikator tidak valid'
      });
    }

    const desawisata_update = await tbl_DesaWisata.findOne({
      where: {
        id_desaWisata
      },
    });

    if (!desawisata_update) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Desa Wisata tidak terdaftar'
      });
    }

    const update_data = await desawisata_update.update({
      id_admin_verifed: id_admin,
      status_verifikasi: status_verifikasi,
      id_admin_author: id_admin_login,
      updatedAt: currentDateTime
    });

    if (!update_data) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Gagal memverifikasi data!",
      });
    }

    return res.status(200).json({
      status: 'success',
      message: "Data Desa Wisata berhasil diverifikasi",
      data: update_data
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      success: false,
      message: "internal server error",
      data: null,
    });
  }
};

const delete_data_desawisata_byAdmin = async (req, res) => {
  try {

    let id_admin_login;

    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_admin_login = decoded.id;

    const user_admin = await tbl_Admin.findOne({
      attributes: ['role'],
      where: {
        id_admin: id_admin_login
      }
    });

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola" && user_admin.role !== "admin industri") {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const { id_desaWisata } = req.params;

    if (!id_desaWisata) {
      return res.status(400).send({ error: "id_desaWisata is required" });
    }

    const desawisata_data_delete = await tbl_DesaWisata.findOne({
      where: {
        id_desaWisata: id_desaWisata
      },
    });

    if (!desawisata_data_delete) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Desa Wisata tidak terdaftar'
      });
    }

    let url_sampul = desawisata_data_delete.sampul_desaWisata;
    const uploadedFile = url_sampul.split('/uploads/')[1];
    const oldFilePath = `./uploads/${uploadedFile}`;

    fs.unlink(oldFilePath, (err) => {
      if (err) {
        console.error('Error deleting old file:', err);
      } else {
        console.log('File deleted successfully.');
      }
    });

    const delete_desawisata = await desawisata_data_delete.destroy();

    if (!delete_desawisata) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Desa wisata gagal dihapus",
      });
    }

    return res.status(200).json({
      status: 'success',
      success: true,
      message: "Desa wisata berhasil dihapus",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "internal server error",
    });
  }

};

// GET GEO JSON API
const get_geojson_desa = async (req, res) => {
  try {
    const desaList = await tbl_DesaWisata.findAll();

    const features = await Promise.all(
      desaList.map(async (desa) => {
        const lat = parseFloat(desa.latitude);
        const lon = parseFloat(desa.longitude);
        const cuaca = await getWeatherStatus(lat, lon);

        // Cek apakah geometry tersedia dan valid
        let geometry = null;
        if (desa.geometry) {
          try {
            geometry = JSON.parse(desa.geometry);
          } catch (err) {
            console.warn(`Gagal parse geometry untuk desa ID ${desa.id_desaWisata}`);
          }
        }

        if (!geometry || geometry.type !== "Polygon") {
          // Jika tidak ada geometry valid, SKIP (atau buat polygon dummy untuk testing)
          return null;
        }

        return {
          type: "Feature",
          geometry: geometry, // format sudah Polygon
          properties: {
            id: desa.id_desaWisata,
            nama: desa.nama_desaWisata,
            weather: cuaca,
          },
        };
      })
    );

    const geojson = {
      type: "FeatureCollection",
      features: features.filter(Boolean), // Hapus yang null
    };

    res.json(geojson);
  } catch (error) {
    console.error("Error get_geojson_desa:", error);
    res.status(500).json({ message: "Gagal mengambil data GeoJSON desa wisata" });
  }
};


const getWeatherStatus = async (lat, lon) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const weatherMain = response.data.weather[0].main;

    return weatherMain; // Contoh: Rain, Clear, Clouds
  } catch (err) {
    console.error("Gagal mengambil data cuaca:", err.message);
    return "Unknown";
  }
};




module.exports = {
  get_all_desawisata,
  get_detail_desawisata,
  get_geojson_desa,
  getWeatherStatus,

  //admin
  get_all_desawisata_byAdmin,
  get_detail_desawisata_byAdmin,
  add_data_desawisata_byAdmin,
  put_verifikasi_desawisata,
  delete_data_desawisata_byAdmin,
  update_data_desawisata_byAdmin
};