const db = require('../models');
const tbl_Wisata = db.tbl_Wisata;
// 360===
const tbl_scenes = db.tbl_scenes;
const tbl_hotspots = db.tbl_hotspots;

const tbl_wisatawan = db.tbl_Wisatawan;
const tbl_Admin = db.tbl_Admin;
const tbl_DesaWisata = db.tbl_DesaWisata;
const tbl_Kecamatan = db.tbl_Kecamatan;
const tbl_HCIHistory = db.tbl_HCIHistory;
const tbl_fasilitas_wisata = db.tbl_fasilitas_wisata;
const tbl_ulasan = db.tbl_ulasan;
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const multer = require('multer');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const xml2js = require('xml2js');
const axios = require('axios');
require('dotenv').config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "./uploads/img/wisata";
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


const get_recomendasi_wisata = async (req, res) => {
  try {

    const {
      filter = {},
    } = req.query;

    const {
      dana,
      jumlah,
    } = req.body;

    if (!dana) {
      return res.status(400).send({ error: "Dana is required" });
    }

    const whereClause = {
      [Op.and]: [
        { status_verifikasi: 'verified' }
      ]
    };

    if (filter.rate) {
      const filterRate = Array.isArray(filter.rate)
        ? filter.rate
        : filter.rate.split(",").map(Number); // Convert to numbers
    
      if (filterRate.length > 0) {
        console.log(filterRate);
    
        // Initialize the range variables
        let minRange = Number.MAX_VALUE;
        let maxRange = Number.MIN_VALUE;
    
        // Determine the range based on the filter values
        filterRate.forEach((rate) => {
          if (rate === 1) {
            minRange = Math.min(minRange, 1.0);
            minRange = Math.min(minRange, 1.7);
          } else if (rate === 2) {
            minRange = Math.min(minRange, 1.8);
            maxRange = Math.max(maxRange, 2.7);
          } else if (rate === 3) {
            minRange = Math.min(minRange, 2.8);
            maxRange = Math.max(maxRange, 3.7);
          } else if (rate === 4) {
            minRange = Math.min(minRange, 3.8);
            maxRange = Math.max(maxRange, 4.7);
          } else if (rate === 5) {
            minRange = Math.min(minRange, 4.8);
            maxRange = Math.max(maxRange, 5);
          } 
        });
    
        // Add the range condition to the whereClause
        if (minRange !== Number.MAX_VALUE && maxRange !== Number.MIN_VALUE) {
          whereClause[Op.and].push({
            rate: {
              [Sequelize.Op.between]: [minRange, maxRange],
            },
          });
        }
      } else {
        console.log("Empty filter.rate");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Ditemukan",
        });
      }
    }

    if (filter.jenis_wisata) {
      const filterjenis_wisata = Array.isArray(filter.jenis_wisata)
        ? filter.jenis_wisata
        : filter.jenis_wisata.split(",");

      if (filterjenis_wisata.length > 0) {
        whereClause[Op.and].push({
          jenis_wisata: {
            [Sequelize.Op.or]: filterjenis_wisata.map((name) => ({
              [Sequelize.Op.like]: `%${name.trim()}%`,
            }))
          }
        });
      } else {
        console.log("Empty filter.kelas_penginapan");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    
    const data = await tbl_Wisata.findAndCountAll({ where: whereClause });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    const Bobot_Acuan = [0.26, 0.23, 0.13, 0.18, 0.2];

    function normalisasiData(matrix) {
      let dataPencocokan = [];
      let dataNormalisasi = [];

      for (let row of matrix) {
        let rowDataPencocokan = [
          row[0],
          row[1] === "1" ? 5 : row[1] === "2" ? 3 : 1,
          row[2] === "1" ? 5 : row[2] === "2" ? 3 : 1,
          row[3] === 5 ? 5 : row[3] === 4 ? 4 : row[3] === 3 ? 4 : row[3] === 2 ? 3 : row[3] === 1 ? 2 : 1,
          row[4],
        ];
        dataPencocokan.push(rowDataPencocokan);
      }

      let maxC1 = Math.max(...dataPencocokan.map(row => row[0]));
      let maxC2 = Math.max(...dataPencocokan.map(row => row[1]));
      let maxC3 = Math.max(...dataPencocokan.map(row => row[2]));
      let maxC4 = Math.max(...dataPencocokan.map(row => row[3]));
      let minC5 = Math.min(...dataPencocokan.map(row => row[4]));

      for (let row of dataPencocokan) {
        let rowDataNormalisasi = [
          // row[0] === 0 ? row[0] / 1 : row[0] / maxC1,
          maxC1 === 0 ? row[0] / 1 : row[0] / maxC1,
          row[1] / maxC2,
          row[2] / maxC3,
          row[3] / maxC4,
          minC5 / row[4],
        ];
        dataNormalisasi.push(rowDataNormalisasi);
      }

      return dataNormalisasi;
    }

    function perangkingan(matrix, weight) {
      let dataNormal = normalisasiData(matrix);
      let preferenceValues = dataNormal.map(row => {
        return row.reduce((acc, val, idx) => acc + (val * weight[idx]), 0);
      });
      return preferenceValues;
    }


    let filteredData = data.rows.filter(item => {
      let totalHarga = item.harga_tiket * jumlah;
      return totalHarga <= dana;
    });

    if (filteredData.length === 0) {
      return res.status(404).send({ error: "Tidak ada destinasi sesuai budget Anda" });
    }

    let matrix = filteredData.map(destinasi => [destinasi.total_pengunjung_destinasi, destinasi.status_jalan, destinasi.jenis_kendaraan, destinasi.jumlah_fasilitas, destinasi.harga_tiket]);
    let nilai_perangkingan = perangkingan(matrix, Bobot_Acuan);

    let destinations = filteredData.map((dest, index) => ({
      ...dest.dataValues,
      recommended: index === nilai_perangkingan.indexOf(Math.max(...nilai_perangkingan)),
      nilai_perangkingan: nilai_perangkingan[index],
      rate: parseFloat(dest.rate).toFixed(1),
      jumlah_ulasan: filteredData.length,
    }));

    // Urutkan berdasarkan nilai_perangkingan tertinggi ke terendah
    destinations.sort((a, b) => b.nilai_perangkingan - a.nilai_perangkingan);

    const result = {
      success: true,
      message: "Sukses mendapatkan rekomendasi",
      data: destinations,
    };

    res.status(200).json(result);

  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }

}

const get_all_wisata = async (req, res) => {
  try {
    const {
      keyword = '',
      order = 'DESC'
    } = req.query;

    const whereClause = {
      [Op.and]: [
        { status_verifikasi: 'verified' },
        keyword ? {
          [Op.or]: [
            { nama_desaWisata: { [Op.like]: `%${keyword}%` } },
            { desk_desaWisata: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    };

    const orderClause = [
      // Prioritaskan yang punya Virtual Tour (entry_scene_id tidak null & tidak kosong)
      [Sequelize.literal("entry_scene_id IS NOT NULL AND entry_scene_id != ''"), 'DESC'], 
      ['rate', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];


   const data = await tbl_Wisata.findAndCountAll({
      where: whereClause,
      order: orderClause
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
        pages: {
          total: 0,
          per_page: data.count,
          next_page: null,
          to: 0,
          last_page: 0,
          current_page: 1,
          from: 0,
        },
      });
    }


    const results = await Promise.all(data.rows.map(async (items) => {


      const data = await tbl_ulasan.findAndCountAll({
        where: { id_wisata: items.id_wisata },
      });

      return {
        id: items.id_wisata,
        nama: items.nama_destinasi,
        kategori: items.kategori,
        harga: items.harga_tiket,
        no_telp: items.kontak_person_destinasi,
        alamat: items.alamat_destinasi,
        latitude: items.latitude,
        longitude: items.longitude,
        pengunjung: items.total_pengunjung_destinasi,
        deskripsi: items.desk_destinasi,
        rate: parseFloat(items.rate).toFixed(1),
        jumlah_ulasan: data.count,
        imageUrl: items.sampul_destinasi,
      };
    }));


    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: results,
      pages: {
        total: data.count,
        per_page: data.count,
        next_page: null,
        to: data.count,
        last_page: 1,
        current_page: 1,
        from: 0,
      },
    };

    const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const excludePagesUrl = `${process.env.FRONTEND_APP_URL}/api/desawisata/get_all`;

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

const get_detail_wisata = async (req, res) => {
  try {
    const { id_wisata } = req.params;

    if (!id_wisata) {
      return res.status(400).send({ error: "id_wisata is required" });
    }

    const data = await tbl_Wisata.findOne({
      where: {
        id_wisata,
      },
    });

    if (!data) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null
      });
    }

    // Ambil nama kecamatan berdasarkan id_kecamatan
    const kecamatan = await tbl_Kecamatan.findOne({
      where: { id_kecamatan: data.id_kecamatan },
      attributes: ['id_kecamatan', 'nama_kecamatan']
    });

    const today = moment().tz('Asia/Jakarta').startOf('day').format('YYYY-MM-DD');

    // Ambil riwayat HCI untuk kecamatan ini (6 hari terakhir)
    const hci_list = await tbl_HCIHistory.findAll({
      where: { 
        id_kecamatan: data.id_kecamatan,
        tanggal: { [Op.gte]: today } // Hanya ambil hari ini ke depan (Forecast)
      },
      attributes: [
        'tanggal', 
        'hci_score', 
        'hci_kategori',
        'temp',       // Tambahkan ini
        'rain',       // Tambahkan ini
        'clouds',     // Tambahkan ini
        'wind',       // Tambahkan ini
        'pressure',   // Tambahkan ini
        'humidity',   // Tambahkan ini
        'visibility'  // Tambahkan ini
      ],
      order: [['tanggal', 'ASC']], // Urutkan dari hari ini ke besok (ASC)
      limit: 6
    });

    const data_fasilitas = await tbl_fasilitas_wisata.findAll({
      where: {
        id_wisata,
      },
      attributes: ['value_fasilitas_wisata', 'nama_fasilitas_wisata']
    });

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: [{
        id: data.id_wisata,
        nama: data.nama_destinasi,
        deskripsi: data.desk_destinasi,
        kategori: data.kategori,
        harga: data.harga_tiket,
        no_telp: data.kontak_person_destinasi,
        alamat: data.alamat_destinasi,
        link_iframe: data.maps_destinasi,
        latitude: data.latitude,
        longitude: data.longitude,
        status_jalan: data.status_jalan,
        rate: parseFloat(data.rate).toFixed(1),
        // 360===
        entry_scene_id: data.entry_scene_id,
        jenis_kendaraan: data.jenis_kendaraan,
        imageUrl: data.sampul_destinasi,
        data_fasilitas,
        nama_kecamatan: kecamatan?.nama_kecamatan || null,
        hci_list
      }],

    };

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

//360============================================================
const get_virtual_tour = async (req, res) => {
    try {
        const { id_wisata } = req.params;

        if (!id_wisata) {
            return res.status(400).send({ error: "id_wisata is required" });
        }

        // 1. Ambil data wisata utama untuk mendapatkan scene awal (entry point)
        const wisata = await tbl_Wisata.findOne({
            where: { id_wisata },
            attributes: ['entry_scene_id']
        });

        if (!wisata || !wisata.entry_scene_id) {
            return res.status(404).json({
            success: false,
                message: "Konfigurasi tur virtual tidak ditemukan untuk wisata ini.",
            });
        }

        // 2. Ambil semua scene yang terhubung dengan wisata ini
        const scenesData = await tbl_scenes.findAll({
            where: { wisata_id: id_wisata },
            raw: true // Dapatkan data mentah untuk performa lebih baik
        });

        // 3. Ambil semua hotspot yang terhubung dengan scene-scene tersebut
        const sceneIds = scenesData.map(s => s.sceneId);
        const hotspotsData = await tbl_hotspots.findAll({
            where: { scene_id: sceneIds },
            raw: true
        });

        // 4. Transformasi data menjadi format yang dimengerti Pannellum
        const pannellumConfig = {
            default: {
                firstScene: wisata.entry_scene_id,
                author: "GoMadiun",
                sceneFadeDuration: 1000,
                autoLoad: true,
                compass: false,
            },
            scenes: {}
        };

        // Proses setiap scene
        scenesData.forEach(scene => {
            // PERHATIAN: Pastikan path panorama adalah URL yang bisa diakses dari frontend
            const panoramaURL = `${process.env.BACKEND_IMAGE_URL}/uploads/img/virtual-tour/${scene.panorama.replace('img/', '')}`;

            pannellumConfig.scenes[scene.sceneId] = {
                title: scene.title || '',
                hfov: scene.hfov,
                pitch: parseFloat(scene.pitch),
                yaw: parseFloat(scene.yaw),
                panorama: panoramaURL,
                hotSpots: []
            };
        });

        // Tambahkan hotspot ke scene yang sesuai
        hotspotsData.forEach(hotspot => {
            const hotspotConfig = {
                pitch: parseFloat(hotspot.pitch),
                yaw: parseFloat(hotspot.yaw),
                type: hotspot.type,
                text: hotspot.text,
            };

            if (hotspot.type === 'scene') {
                hotspotConfig.sceneId = hotspot.sceneId_target;
                if (hotspot.target_yaw) hotspotConfig.targetYaw = parseFloat(hotspot.target_yaw);
                if (hotspot.target_pitch) hotspotConfig.targetPitch = parseFloat(hotspot.target_pitch);
            }

            // Pastikan scene untuk hotspot ini ada sebelum menambahkannya
            if (pannellumConfig.scenes[hotspot.scene_id]) {
                pannellumConfig.scenes[hotspot.scene_id].hotSpots.push(hotspotConfig);
            }
        });

    res.status(200).json(pannellumConfig);

    } catch (error) {
        console.log(error, 'Error fetching virtual tour data');
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

const get_all_wisata_byDesawisata = async (req, res) => {
  try {
    const { id_desaWisata } = req.params;

    if (!id_desaWisata) {
      return res.status(400).send({ error: "id_desawisata is required" });
    }

    const {
      limit = 10,
      page = 1,
      keyword = '',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.and]: [
        { id_desaWisata },
        { status_verifikasi: 'verified' },
        keyword ? {
          [Op.or]: [
            { nama_desaWisata: { [Op.like]: `%${keyword}%` } },
            { desk_desaWisata: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    };

    const orderClause = [
      ['total_pengunjung_destinasi', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];


    const data = await tbl_Wisata.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10),
      offset: offset,
      order: orderClause
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;
    if (data.count === 0) {
      return res.status(422).json({
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

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((items) => ({
        id: items.id_wisata,
        nama: items.nama_destinasi,
        kategori: items.kategori,
        rate: parseFloat(items.rate).toFixed(1),
        deskripsi: items.desk_destinasi,
        harga: items.harga_tiket,
        no_telp: items.kontak_person_destinasi,
        alamat: items.alamat_destinasi,
        id_kecamatan: items.id_kecamatan,
        latitude: items.latitude,
        longitude: items.longitude,
        imageUrl: items.sampul_destinasi,
      })),
      pages: {
        total: data.count,
        per_page: parseInt(limit, 10) || data.count,
        next_page: limit && page ? (page < totalPages ? page + 1 : null) : null,
        to: limit ? offset + data.rows.length : data.count,
        last_page: totalPages,
        current_page: parseInt(page, 10) || 1,
        from: offset,
      },

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

const add_ulasan_wisata = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_wisata } = req.params;

    if (!id_wisata) {
      return res.status(400).send({ error: "id_wisata is required" });
    }

    const data = await tbl_Wisata.findOne({
      where: {
        id_wisata,
      },
    });

    if (!data) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null
      });
    }

    const {
      id_pesanan,
      rate,
      komentar
    } = req.body;

    const dataUlasanExits = await tbl_ulasan.findOne({
      where: {
        id_wisata: id_wisata,
        id_pesanan: id_pesanan,
        id_wisatawan: id_wisatawan
      },
    });

    if (dataUlasanExits) {
      return res.status(422).json({
        success: false,
        message: "Ulasan Anda sudah ditambahkan pada wisata ini",
        data: null
      });
    }

    const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    const add_ulasan = await tbl_ulasan.create({
      id_wisatawan: id_wisatawan,
      id_pesanan: id_pesanan,
      id_wisata: id_wisata,
      rate: rate,
      komentar: komentar,
      createdAt: currentDateTime,
      updatedAt: currentDateTime
    });

    if (!add_ulasan) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Ulasan gagal ditambahkan",
      });
    }

    //update untuk rating pada data setelah ulasan terbaru ditambah
    const allReviews = await tbl_ulasan.findAll({
      where: { id_wisata },
    });

    const totalRating = allReviews.reduce((sum, review) => sum + review.rate, 0);
    const averageRating = totalRating / allReviews.length;

    await data.update({
      rate: averageRating || data.averageRating,
    });

    return res.status(200).json({
      status: "success",
      success: true,
      message: "Ulasan berhasil ditambahkan",
      data: add_ulasan
    });


  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }
};

const get_ulasan_wisata = async (req, res) => {
  try {
    const { id_wisata } = req.params;

    if (!id_wisata) {
      return res.status(400).send({ error: "id_wisata is required" });
    }

    const {
      keyword = '',
    } = req.query;

    const whereClause = {
      [Op.and]: [
        { id_wisata: id_wisata },
        keyword ? {
          [Op.or]: [
            { rate: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    };

    const data = await tbl_ulasan.findAndCountAll({
      where: whereClause,
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null
      });
    }

    const results = await Promise.all(data.rows.map(async (wisata) => {
      let detail_wisatawan = [];

      detail_wisatawan = await tbl_wisatawan.findOne({
        where: { id_wisatawan: wisata.id_wisatawan },
        attributes: [
          "id_wisatawan",
          "name",
          "profile"
        ]
      });


      return {
        detail_wisatawan,
        rate: wisata.rate,
        ulasan: wisata.komentar,
        createdAt: wisata.createdAt,
        updatedAt: wisata.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Desa Wisata",
      data: results
    });

  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }
};


//admin
const get_all_wisata_byAdmin = async (req, res) => {
  try {

    let id_admin;

    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ message: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_admin = decoded.id;


    const user_admin = await tbl_Admin.findOne({
      attributes: ['role'],
      where: {
        id_admin
      }
    });

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola" && user_admin.role !== "user pengelola") {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const {
      keyword = '',
      byAdmin = '',
      byAdminPengelola = '',
      order = 'DESC',
    } = req.query;

    const whereClause = {
      [Op.and]: [
        byAdmin ? {
          id_admin: byAdmin
        } : {},
        byAdminPengelola ? {
          id_admin_pengelola: byAdminPengelola
        } : {},
        keyword ? {
          [Op.or]: [
            { nama_destinasi: { [Op.like]: `%${keyword}%` } },
            { nib_destinasi: { [Op.like]: `%${keyword}%` } },
            { alamat_destinasi: { [Op.like]: `%${keyword}%` } },
            { kbli_destinasi: { [Op.like]: `%${keyword}%` } },
            { npwp_destinasi: { [Op.like]: `%${keyword}%` } },
            { harga_tiket: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    }

    const orderClause = [
      ['id_wisata', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];

    const data = await tbl_Wisata.findAndCountAll({
      where: whereClause,
      order: orderClause,
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    const results = await Promise.all(data.rows.map(async (wisata) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_desa_wisata = [];
      let detail_kecamatan = [];
      let detail_hci = [];
      let detail_fasilitas_wisata = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: wisata.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: wisata.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: wisata.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: wisata.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_desa_wisata = await tbl_DesaWisata.findOne({
        where: { id_desaWisata: wisata.id_desaWisata },
        attributes: [
          "id_desaWisata",
          "nama_desaWisata"
        ]
      });

       detail_kecamatan = await tbl_Kecamatan.findOne({
        where: { id_kecamatan: wisata.id_kecamatan},
        attributes: [
          "id_kecamatan",
          "nama_kecamatan"
        ]
      });

      detail_hci = await tbl_HCIHistory.findAll({
        where: { id_kecamatan: wisata.id_kecamatan},
        order: [['tanggal', 'DESC']],
        attributes: [
          "tanggal",
          "hci_score",
          "hci_kategori"
        ]
      });


      detail_fasilitas_wisata = await tbl_fasilitas_wisata.findAll({
        where: {
          id_wisata: wisata.id_wisata,
        },
        attributes: ['value_fasilitas_wisata']
      });


      return {
        id_wisata: wisata.id_wisata,
        detail_admin,
        detail_admin_verified,
        detail_author,
        detail_desa_wisata,
        detail_admin_pengelola,
        detail_kecamatan,
        nama_destinasi: wisata.nama_destinasi,
        nib_destinasi: wisata.nib_destinasi,
        kbli_destinasi: wisata.kbli_destinasi,
        npwp_destinasi: wisata.npwp_destinasi,
        alamat_destinasi: wisata.alamat_destinasi,
        npwp_pemilik_destinasi: wisata.npwp_pemilik_destinasi,
        kategori: wisata.kategori,
        desk_destinasi: wisata.desk_destinasi,
        sampul_destinasi: wisata.sampul_destinasi,
        ruang_destinasi: wisata.ruang_destinasi,
        status_jalan: wisata.status_jalan,
        jenis_kendaraan: wisata.jenis_kendaraan,
        harga_tiket: wisata.harga_tiket,
        detail_fasilitas_wisata,
        kontak_person_destinasi: wisata.kontak_person_destinasi,
        total_pengunjung_destinasi: wisata.total_pengunjung_destinasi,
        status_wisata: wisata.status_wisata,
        status_verifikasi: wisata.status_verifikasi,
        updatedAt: wisata.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Destinasi Wisata",
      data: results
    });

  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const get_detail_wisata_byAdmin = async (req, res) => {
  try {


    let id_admin;

    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ message: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_admin = decoded.id;


    const user_admin = await tbl_Admin.findOne({
      attributes: ['role'],
      where: {
        id_admin
      }
    });

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola" && user_admin.role !== "user pengelola") {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const { id_wisata } = req.params;

    if (!id_wisata) {
      return res.status(422).send({ error: "id_wisata is required" });
    }

    const data = await tbl_Wisata.findAndCountAll({
      where: {
        id_wisata,
      },
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    const results = await Promise.all(data.rows.map(async (wisata) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_desa_wisata = [];
      let detail_kecamatan = [];
      let detail_hci = [];
      let detail_fasilitas_wisata = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: wisata.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: wisata.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: wisata.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: wisata.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_desa_wisata = await tbl_DesaWisata.findOne({
        where: { id_desaWisata: wisata.id_desaWisata },
        attributes: [
          "id_desaWisata",
          "nama_desaWisata"
        ]
      });

      detail_kecamatan = await tbl_Kecamatan.findOne({
        where: { id_kecamatan: wisata.id_kecamatan},
        attributes: [
          "id_kecamatan",
          "nama_kecamatan"
        ]
      });

      detail_hci = await tbl_HCIHistory.findAll({
        where: { id_kecamatan: wisata.id_kecamatan},
        order: [['tanggal', 'DESC']],
        attributes: [
          "tanggal",
          "hci_score",
          "hci_kategori"
        ]
      });

      detail_fasilitas_wisata = await tbl_fasilitas_wisata.findAll({
        where: {
          id_wisata,
        },
        attributes: ['value_fasilitas_wisata', 'nama_fasilitas_wisata']
      });



      return {
        id_wisata: wisata.id_wisata,
        detail_admin,
        detail_admin_verified,
        detail_author,
        detail_admin_pengelola,
        detail_desa_wisata,
        detail_kecamatan,
        detail_hci,
        nama_destinasi: wisata.nama_destinasi,
        nib_destinasi: wisata.nib_destinasi,
        kbli_destinasi: wisata.kbli_destinasi,
        npwp_destinasi: wisata.npwp_destinasi,
        alamat_destinasi: wisata.alamat_destinasi,
        npwp_pemilik_destinasi: wisata.npwp_pemilik_destinasi,
        kategori: wisata.kategori,
        desk_destinasi: wisata.desk_destinasi,
        maps_destinasi: wisata.maps_destinasi,
        latitude: wisata.latitude,
        longitude: wisata.longitude,
        sampul_destinasi: wisata.sampul_destinasi,
        ruang_destinasi: wisata.ruang_destinasi,
        status_jalan: wisata.status_jalan,
        jenis_kendaraan: wisata.jenis_kendaraan,
        harga_tiket: wisata.harga_tiket,
        kontak_person_destinasi: wisata.kontak_person_destinasi,
        total_pengunjung_destinasi: wisata.total_pengunjung_destinasi,
        status_wisata: wisata.status_wisata,
        status_verifikasi: wisata.status_verifikasi,
        detail_fasilitas_wisata,
        createdAt: wisata.createdAt,
        updatedAt: wisata.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Desa Wisata",
      data: results
    });

  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }
};

const add_data_wisata_byAdmin = async (req, res) => {
  upload.fields([{ name: 'foto_depan', maxCount: 1 }, { name: 'foto_ruang', maxCount: 1 }])(req, res, async (err) => {
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

      if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola") {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

      const {
        id_admin,
        id_desaWisata,
        id_kecamatan,
        id_admin_pengelola,
        nama_destinasi,
        nib_destinasi,
        kbli_destinasi,
        alamat_destinasi,
        status_wisata,
        kategori,
        npwp_pemilik_destinasi,
        npwp_destinasi,
        status_jalan,    
        jenis_kendaraan,
        desk_destinasi,
        harga_tiket,
        kontak_person_destinasi,
        latitude, // tambahkan
        longitude, // tambahkan
      } = req.body;

      let add_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas") {

        if (
          !id_admin ||
          !id_desaWisata ||
          !id_kecamatan ||
          !id_admin_pengelola ||
          !nama_destinasi ||
          !alamat_destinasi ||
          !status_wisata ||
          !kategori ||
          !desk_destinasi ||
          !status_jalan ||
          !jenis_kendaraan ||
          !harga_tiket ||
          !latitude ||
          !longitude ||
          !kontak_person_destinasi
          
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan destinasi wisata" });
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

        const cek_desawisata = await tbl_DesaWisata.findAndCountAll({
          where: {
            id_desaWisata: id_desaWisata
          },
        });

      

        if (cek_desawisata.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Desa wisata tidak terdaftar",
          });
        }

          const cek_kecamatan = await tbl_Kecamatan.findAndCountAll({
          where: {
            id_kecamatan: id_kecamatan
          },
        });

        if (cek_kecamatan.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Kecamatan tidak terdaftar",
          });
        }

        const cek_admin_pengelola = await tbl_Admin.findAndCountAll({
          where: {
            id_admin: id_admin_pengelola
          },
        });

        if (cek_admin_pengelola.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "User pengelola tidak terdaftar",
          });
        }

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/wisata/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/wisata/${req.files['foto_ruang'][0].filename}` : null;


        add_data = await tbl_Wisata.create({
          id_desaWisata: id_desaWisata,
          id_kecamatan: id_kecamatan,
          id_admin: id_admin,
          id_admin_pengelola: id_admin_pengelola,
          nama_destinasi: nama_destinasi,
          nib_destinasi: nib_destinasi,
          kbli_destinasi: kbli_destinasi,
          alamat_destinasi: alamat_destinasi,
          npwp_destinasi: npwp_destinasi,
          npwp_pemilik_destinasi: npwp_pemilik_destinasi,
          desk_destinasi: desk_destinasi,
          kategori: kategori,
          sampul_destinasi: uploadedFile1,
          ruang_destinasi: uploadedFile2,
          harga_tiket: harga_tiket,
          status_jalan: status_jalan,
          jenis_kendaraan: jenis_kendaraan,
          kontak_person_destinasi: kontak_person_destinasi,
          status_wisata: status_wisata,
          total_pengunjung_destinasi: 0,
          jumlah_fasilitas: 0,
          rate: 0,
          id_admin_author: id_admin_login,
          latitude : latitude,
          longitude: longitude,
          status_verifikasi: 'unverified',
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

      } else {

        if (
          !id_desaWisata ||
          !id_kecamatan ||
          !id_admin_pengelola ||
          !nama_destinasi ||
          !alamat_destinasi ||
          !status_wisata ||
          !kategori ||
          !desk_destinasi ||
          !status_jalan ||
          !jenis_kendaraan ||
          !harga_tiket ||
          !latitude ||
          !longitude ||
          !kontak_person_destinasi
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan destinasi wisata" });
        }

        const cek_desawisata = await tbl_DesaWisata.findAndCountAll({
          where: {
            id_desaWisata: id_desaWisata
          },
        });

        if (cek_desawisata.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Desa wisata tidak terdaftar",
          });
        }
        const cek_kecamatan = await tbl_Kecamatan.findAndCountAll({
          where: {
            id_kecamatan: id_kecamatan
          },
        });

        if (cek_kecamatan.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Kecamatantidak terdaftar",
          });
        }

        const cek_admin_pengelola = await tbl_Admin.findAndCountAll({
          where: {
            id_admin: id_admin_pengelola
          },
        });

        if (cek_admin_pengelola.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "User pengelola tidak terdaftar",
          });
        }

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/wisata/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/wisata/${req.files['foto_ruang'][0].filename}` : null;


        add_data = await tbl_Wisata.create({
          id_desaWisata: id_desaWisata,
          id_kecamatan: id_kecamatan,
          id_admin: id_admin_login,
          id_admin_pengelola: id_admin_pengelola,
          nama_destinasi: nama_destinasi,
          nib_destinasi: nib_destinasi,
          kbli_destinasi: kbli_destinasi,
          alamat_destinasi: alamat_destinasi,
          npwp_destinasi: npwp_destinasi,
          npwp_pemilik_destinasi: npwp_pemilik_destinasi,
          kategori: kategori,
          desk_destinasi: desk_destinasi,
          sampul_destinasi: uploadedFile1,
          ruang_destinasi: uploadedFile2,
          harga_tiket: harga_tiket,
          status_jalan: status_jalan,
          jenis_kendaraan: jenis_kendaraan,
          kontak_person_destinasi: kontak_person_destinasi,
          status_wisata: status_wisata,
          total_pengunjung_destinasi: 0,
          jumlah_fasilitas: 0,
          id_admin_author: id_admin_login,
          latitude : latitude,
          longitude: longitude,
          status_verifikasi: 'unverified',
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

      }

      if (!add_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "Destinasi Wisata gagal ditambahkan",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Destinasi Wisata berhasil ditambahkan",
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

const update_data_wisata_byAdmin = async (req, res) => {
  upload.fields([{ name: 'foto_depan', maxCount: 1 }, { name: 'foto_ruang', maxCount: 1 }])(req, res, async (err) => {
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

      if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola" && user_admin.role !== "user pengelola") {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");


      const { id_wisata } = req.params;

      if (!id_wisata) {
        return res.status(400).send({ error: "id_wisata is required" });
      }

      const wisata_update = await tbl_Wisata.findOne({
        where: {
          id_wisata
        },
      });

      if (!wisata_update) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: 'Destinasi Wisata tidak terdaftar'
        });
      }

      const {
        id_desaWisata,
        id_kecamatan,
        id_admin_pengelola,
        nama_destinasi,
        nib_destinasi,
        kbli_destinasi,
        alamat_destinasi,
        status_wisata,
        kategori,
        npwp_pemilik_destinasi,
        npwp_destinasi,
        desk_destinasi,
        harga_tiket,
        status_jalan,
        jenis_kendaraan,
        kontak_person_destinasi,
        latitude,
        longitude,
      } = req.body;

      let update_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas" || user_admin.role === "admin pengelola") {

        if (
          !id_desaWisata ||
          !id_kecamatan ||
          !id_admin_pengelola ||
          !nama_destinasi ||
          !alamat_destinasi ||
          !status_wisata ||
          !kategori ||
          !desk_destinasi ||
          !status_jalan ||
          !jenis_kendaraan ||
          !harga_tiket ||
          !latitude ||
          !longitude ||
          !kontak_person_destinasi
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update destinasi wisata", req_body: req.body });
        }

        const cek_admin_pengelola = await tbl_Admin.findAndCountAll({
          where: {
            id_admin: id_admin_pengelola
          },
        });

        if (cek_admin_pengelola.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "User pengelola tidak terdaftar",
          });
        }

        let uploadedFile1 = wisata_update.sampul_destinasi
        let uploadedFile2 = wisata_update.ruang_destinasi

        if (req.files) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/wisata/${req.files['foto_depan'][0].filename}`;
          }
          if (req.files['foto_ruang']) {
            const name_file = uploadedFile2.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/wisata/${req.files['foto_ruang'][0].filename}`;
          }
        }

        update_data = await wisata_update.update({
          id_desaWisata: id_desaWisata,
          id_kecamatan: id_kecamatan,
          id_admin_pengelola: id_admin_pengelola,
          nama_destinasi: nama_destinasi,
          nib_destinasi: nib_destinasi,
          kbli_destinasi: kbli_destinasi,
          alamat_destinasi: alamat_destinasi,
          npwp_destinasi: npwp_destinasi,
          npwp_pemilik_destinasi: npwp_pemilik_destinasi,
          kategori: kategori,
          desk_destinasi: desk_destinasi,
          sampul_destinasi: uploadedFile1,
          ruang_destinasi: uploadedFile2,
          harga_tiket: harga_tiket,
          status_jalan: status_jalan,
          jenis_kendaraan: jenis_kendaraan,
          kontak_person_destinasi: kontak_person_destinasi,
          latitude: latitude,
          longitude: longitude,
          status_wisata: status_wisata,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

      } else {

        if (
          !nama_destinasi ||
          !alamat_destinasi ||
          !status_wisata ||
          !kategori ||
          !desk_destinasi ||
          !status_jalan ||
          !jenis_kendaraan ||
          !harga_tiket ||
          !latitude ||
          !longitude ||
          !kontak_person_destinasi
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update destinasi wisata", req_body: req.body });
        }

        let uploadedFile1 = wisata_update.sampul_destinasi
        let uploadedFile2 = wisata_update.ruang_destinasi

        if (req.file) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/wisata/${req.files['foto_depan'][0].filename}`;
          }
          if (req.files['foto_ruang']) {
            const name_file = uploadedFile2.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/wisata/${req.files['foto_ruang'][0].filename}`;
          }
        }

        update_data = await wisata_update.update({
          id_admin_pengelola: id_admin_login,
          nama_destinasi: nama_destinasi,
          nib_destinasi: nib_destinasi,
          kbli_destinasi: kbli_destinasi,
          alamat_destinasi: alamat_destinasi,
          npwp_destinasi: npwp_destinasi,
          npwp_pemilik_destinasi: npwp_pemilik_destinasi,
          kategori: kategori,
          desk_destinasi: desk_destinasi,
          sampul_destinasi: uploadedFile1,
          ruang_destinasi: uploadedFile2,
          harga_tiket: harga_tiket,
          status_jalan: status_jalan,
          jenis_kendaraan: jenis_kendaraan,
          kontak_person_destinasi: kontak_person_destinasi,
          latitude:latitude,
          longitude:longitude,
          status_wisata: status_wisata,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

      }

      if (!update_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "Destinasi Wisata gagal diubah",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Destinasi Wisata berhasil diubah",
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

const put_verifikasi_wisata = async (req, res) => {
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


    const { id_wisata } = req.params;

    if (!id_wisata) {
      return res.status(400).send({ error: "id_wisata is required" });
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

    const wisata_update = await tbl_Wisata.findOne({
      where: {
        id_wisata
      },
    });

    if (!wisata_update) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Destinasi Wisata tidak terdaftar'
      });
    }


    const update_data = await wisata_update.update({
      id_admin_verifed: id_admin,
      status_verifikasi: status_verifikasi,
      id_admin_author: id_admin_login,
      updatedAt: currentDateTime
    });

    if (!update_data) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Gagal mengubah data!",
      });
    }

    return res.status(200).json({
      status: 'success',
      message: "Data Destinas Wisata berhasil diverifikasi",
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

const put_update_maps_wisata = async (req, res) => {
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

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola" && user_admin.role !== "user pengelola") {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");


    const { id_wisata } = req.params;

    if (!id_wisata) {
      return res.status(400).send({ error: "id_wisata is required" });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
    }

    const wisata_update = await tbl_Wisata.findOne({
      where: {
        id_wisata
      },
    });

    if (!wisata_update) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Destinasi Wisata tidak terdaftar'
      });
    }

    const update_data = await wisata_update.update({
      maps_destinasi: url,
      id_admin_author: id_admin_login,
      updatedAt: currentDateTime
    });

    if (!update_data) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Gagal mengubah data!",
      });
    }

    return res.status(200).json({
      status: 'success',
      message: "Maps berhasil ditambahkan",
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

const delete_data_wisata_byAdmin = async (req, res) => {
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

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola") {
      return res.status(422).json({ message: "Anda tidak dapat menghapus data" });
    }


    const { id_wisata } = req.params;

    if (!id_wisata) {
      return res.status(400).send({ error: "id_wisata is required" });
    }

    const wisata_data_delete = await tbl_Wisata.findOne({
      where: {
        id_wisata
      },
    });

    if (!wisata_data_delete) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Destinasi Wisata tidak terdaftar'
      });
    }

    let url_sampul = wisata_data_delete.sampul_destinasi;
    let url_ruang = wisata_data_delete.ruang_destinasi;
    const uploadedFile = url_sampul.split('/uploads/')[1];
    const oldFilePath = `./uploads/${uploadedFile}`;
    const uploadedFile2 = url_ruang.split('/uploads/')[1];
    const oldFilePath2 = `./uploads/${uploadedFile2}`;

    fs.unlink(oldFilePath, (err) => {
      if (err) {
        console.error('Error deleting old file:', err);
      } else {
        fs.unlink(oldFilePath2, (err) => {
          if (err) {
            console.error('Error deleting old file:', err);
          } else {
            console.log('File deleted successfully.');
          }
        });
      }
    });

    const delete_desawisata = await wisata_data_delete.destroy();

    if (!delete_desawisata) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Destinasi wisata gagal dihapus",
      });
    }

    return res.status(200).json({
      status: 'success',
      success: true,
      message: "Destinasi wisata berhasil dihapus",
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

const add_fasilitas_wisata_byAdmin = async (req, res) => {
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

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola" && user_admin.role !== "user pengelola") {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    const {
      id_wisata,
      valueFasilitas = [],
    } = req.body;

    if (
      !id_wisata ||
      valueFasilitas.length === 0
    ) {
      return res.status(422).json({ status: 'error', message: "Lengkapi data inputan fasilitas wisata" });
    }

    const fasilitas_update = await tbl_fasilitas_wisata.findAndCountAll({
      where: {
        id_wisata: id_wisata
      },
    });

    if (fasilitas_update.count !== 0) {
      for (const fasilitas of fasilitas_update.rows) {
        await fasilitas.destroy();
      }
    }

    let add_data = []

    for (let row of valueFasilitas) {
      add_data = await tbl_fasilitas_wisata.create({
        id_wisata: id_wisata,
        value_fasilitas_wisata: row,
        nama_fasilitas_wisata: row === 1 ? "Musholla" : row === 2 ? "Toilet" : row === 3 ? "Penginapan" : row === 4 ? "Area Kuliner" : "Tempat Sampah",
        createdAt: currentDateTime,
        updatedAt: currentDateTime
      });
    }

    if (!add_data) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Fasilitas Wisata gagal ditambahkan",
      });
    }

    const wisata_update = await tbl_Wisata.findOne({
      where: {
        id_wisata
      },
    });

    const update_data = await wisata_update.update({
      jumlah_fasilitas: valueFasilitas.length,
      id_admin_author: id_admin_login,
      updatedAt: currentDateTime
    });

    if (!update_data) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Gagal mengubah data!",
      });
    }

    return res.status(200).json({
      status: "success",
      success: true,
      message: "Fasilitas Wisata berhasil ditambahkan",
      data: update_data
    });

  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  };
};


// API UNTUK GEOJSON ATAU MAP
const getGeoJSONCuaca = async (req, res) => {
  try {
    const apiKey = 'API_KEY_ANDA'; // Ganti dengan API key Anda
    const wisataList = await tbl_Wisata.findAll();

    const features = await Promise.all(wisataList.map(async (item) => {
      const { latitude, longitude, nama_destinasi } = item;
      if (!latitude || !longitude) return null;

      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=id`;
        const cuacaRes = await axios.get(url);
        const cuaca = cuacaRes.data.weather[0].description;

        let warna = "green";
        if (cuaca.toLowerCase().includes("hujan")) {
          warna = "red";
        }

        return {
          type: "Feature",
          properties: {
            nama: nama_destinasi,
            cuaca,
            warna
          },
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          }
        };

      } catch (err) {
        console.error(`Gagal ambil cuaca untuk ${nama_destinasi}: ${err.message}`);
        return null;
      }
    }));

    const geojson = {
      type: "FeatureCollection",
      features: features.filter(Boolean)
    };

    res.json(geojson);

  } catch (err) {
    res.status(500).json({ error: "Gagal menghasilkan data GeoJSON", detail: err.message });
  }
};

const getGeoJSONCuacaById = async (req, res) => {
  try {
    const apiKey = '7e2dbf27d8d4c8265bf6cb5b04a33831';
    const idWisata = req.params.id_wisata;

    const wisata = await tbl_Wisata.findOne({ where: { id_wisata: idWisata } });
    if (!wisata || !wisata.latitude || !wisata.longitude) {
      return res.status(404).json({ error: "Wisata tidak ditemukan atau koordinat belum diisi." });
    }

    const { latitude, longitude, nama_destinasi } = wisata;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=id`;

    const cuacaRes = await axios.get(url);
    const cuaca = cuacaRes.data.weather[0].description;

    let warna = "green";
    if (cuaca.toLowerCase().includes("hujan")) warna = "red";

    const geojson = {
      type: "Feature",
      properties: {
        nama: nama_destinasi,
        cuaca,
        warna
      },
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude]
      }
    };

    res.json(geojson);

  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data cuaca", detail: err.message });
  }
};

const get_geojson_wisata = async (req, res) => {
  try {
    const wisataList = await tbl_Wisata.findAll();

    const geojson = {
      type: "FeatureCollection",
      features: wisataList.map((wisata) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [parseFloat(wisata.longitude), parseFloat(wisata.latitude)],
        },
        properties: {
          id: wisata.id,
          nama: wisata.nama_destinasi,
          weather: wisata.weather || "Berawan",
        },
      })),
    };

    res.json(geojson);
  } catch (error) {
    console.error("Error get_geojson_wisata:", error);
    res.status(500).json({ message: "Gagal mengambil data GeoJSON destinasi wisata" });
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




// const getGeoJSONMapData = async (req, res) => {
//   try {
//     // Ambil semua desa wisata yang punya koordinat
//     const desaWisataList = await tbl_DesaWisata.findAll({
//       where: {
//         latitude: { [Op.ne]: null },
//         longitude: { [Op.ne]: null },
//       }
//     });

//     // Ambil semua wisata yang punya koordinat
//     const wisataList = await tbl_Wisata.findAll({
//       where: {
//         latitude: { [Op.ne]: null },
//         longitude: { [Op.ne]: null },
//       }
//     });

//     // GeoJSON desa wisata
//     const geoDesaWisata = {
//       type: 'FeatureCollection',
//       features: await Promise.all(desaWisataList.map(async (desa) => {
//         const weather = await getWeather(desa.latitude, desa.longitude);
//         return {
//           type: 'Feature',
//           geometry: {
//             type: 'Point',
//             coordinates: [desa.longitude, desa.latitude]
//           },
//           properties: {
//             id: desa.id_desaWisata,
//             name: desa.nama_desaWisata,
//             type: 'desa_wisata',
//             weather
//           }
//         };
//       }))
//     };

//     // GeoJSON wisata
//     const geoWisata = {
//       type: 'FeatureCollection',
//       features: await Promise.all(wisataList.map(async (wisata) => {
//         const weather = await getWeather(wisata.latitude, wisata.longitude);
//         return {
//           type: 'Feature',
//           geometry: {
//             type: 'Point',
//             coordinates: [wisata.longitude, wisata.latitude]
//           },
//           properties: {
//             id: wisata.id_wisata,
//             name: wisata.nama_destinasi,
//             type: 'wisata',
//             weather
//           }
//         };
//       }))
//     };

//     return res.json({ desa: geoDesaWisata, wisata: geoWisata });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Gagal memuat GeoJSON.' });
//   }
// };

// // Fungsi bantu ambil cuaca dari OpenWeather
// const getWeather = async (lat, lon) => {
//   try {
//     const apiKey = '7e2dbf27d8d4c8265bf6cb5b04a33831'; // ← Ganti dengan API key kamu

//     const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
//       params: {
//         lat,
//         lon,
//         appid: apiKey,
//         units: 'metric',
//         lang: 'id'
//       }
//     });

//     return {
//       description: response.data.weather[0].description,
//       icon: response.data.weather[0].icon,
//       temperature: response.data.main.temp
//     };
//   } catch (err) {
//     console.error('Cuaca gagal:', err.message);
//     return null;
//   }
// };

// module.exports = {
//   getGeoJSONMapData,
// };


// API UNTUK PREDIKSI CUACA

const getCuacaDetailById = async (req, res) => {
  try {
    const apiKey = '7e2dbf27d8d4c8265bf6cb5b04a33831';
    const idWisata = req.params.id_wisata;

    const wisata = await tbl_Wisata.findOne({ where: { id_wisata: idWisata } });
    if (!wisata || !wisata.latitude || !wisata.longitude) {
      return res.status(404).json({ error: "Wisata tidak ditemukan atau koordinat belum diisi." });
    }

    const { latitude, longitude } = wisata;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=id`;

    const response = await axios.get(url);

    res.json(response.data); // Data lengkap: 5 hari, tiap 3 jam
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data cuaca detail", detail: error.message });
  }
};


// const get_weather_madiun = async (req, res) => {
//   try {
//     const { lat, lon } = req.query;
//     if (!lat || !lon) {
//       return res.status(400).json({ error: "Latitude dan longitude wajib diisi" });
//     }

//     const apiKey = '7e2dbf27d8d4c8265bf6cb5b04a33831';
//     const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;

//     const response = await axios.get(url);
//     const data = response.data;

//     res.json({
//       kota: data.name,
//       suhu: data.main.temp,
//       cuaca: data.weather[0].description
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Gagal mengambil data cuaca", detail: error.message });
//   }
// };






module.exports = {
  get_all_wisata,
  get_recomendasi_wisata,
  get_detail_wisata,
  //360====
  get_virtual_tour,
  get_all_wisata_byDesawisata,
  add_ulasan_wisata,
  get_ulasan_wisata,
  // get_weather_madiun,
  getGeoJSONCuaca,
  getGeoJSONCuacaById,
  getCuacaDetailById,
  // getGeoJSONMapData,
  get_geojson_wisata,
  getWeatherStatus,

  //admin
  get_all_wisata_byAdmin,
  get_detail_wisata_byAdmin,
  add_data_wisata_byAdmin,
  put_verifikasi_wisata,
  delete_data_wisata_byAdmin,
  update_data_wisata_byAdmin,
  put_update_maps_wisata,
  add_fasilitas_wisata_byAdmin
};