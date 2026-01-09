const db = require('../models');
const tbl_Kuliner = db.tbl_Kuliner;
const tbl_DesaWisata = db.tbl_DesaWisata;
const tbl_Wisatawan = db.tbl_Wisatawan;
const tbl_Admin = db.tbl_Admin;
const tbl_ulasan = db.tbl_ulasan;
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const multer = require('multer');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "./uploads/img/kuliner";
    
    // Jika req.body.gallery diisi, simpan gambar di folder gallery
    if (req.body.isGallery) {
      dest = "./uploads/img/kuliner/gallery";
    }

    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);  // Gunakan nama asli file
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


const get_all_kuliner = async (req, res) => {
  try {
    const {
      keyword = '',
      filter = {},
      order = 'DESC'
    } = req.query;

    const whereClause = {
      [Op.and]: [
          { status_verifikasi: 'verified' },
          keyword ? {
              [Op.or]: [
                  { nama_kuliner: { [Op.like]: `%${keyword}%` } },
              ]
          } : {}
      ]
  };

    const orderClause = [
      ['total_pengunjung_kuliner', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
  ];

    
    const data = await tbl_Kuliner.findAndCountAll({
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
          per_page: 0,
          next_page: null,
          to: 0,
          last_page: 0,
          current_page: 1,
          from: 0,
        },
      });
    }

    
    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((items) => ({
        id: items.id_kuliner,
        nama: items.nama_kuliner,
        alamat: items.alamat_kuliner,
        latitude: items.latitude,
        longitude: items.longitude,
        kategori: "Kuliner",
        status_buka: items.status_buka,
        imageUrl: items.sampul_kuliner,
      })),
       pages: {
        total: data.count,
        per_page: data.count,
        next_page: null,
        to: data.count,
        last_page: 1,
        current_page: 1,
        from: 0,
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

const get_detail_kuliner = async (req, res) => {
  try {
    const { id_kuliner } = req.params;

    if (!id_kuliner) {
      return res.status(400).send({ error: "id_kuliner is required" });
    }

    const data = await tbl_Kuliner.findOne({
      where: {
        id_kuliner,
      },
    });

    if (!data) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null
      });
    }
    
    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: [{
        id: data.id_kuliner,
        nama: data.nama_kuliner,
        alamat: data.alamat_kuliner,
        kategori: "Kuliner",
        no_telp: data.kontak_person_kuliner,
        link_iframe: data.maps_kuliner,
        latitude: data.latitude,
        longitude: data.longitude,
        status_buka: data.status_buka,
        imageUrl: data.sampul_kuliner,
      }],
      
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

const get_all_kuliner_ByDesawisata = async (req, res) => {
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
                  { nama_kuliner: { [Op.like]: `%${keyword}%` } },
              ]
          } : {}
      ]
  };

    const orderClause = [
      ['total_pengunjung_kuliner', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
  ];

    
    const data = await tbl_Kuliner.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10),
      offset: offset,
      order:orderClause
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;
    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Tersedia",
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
        id: items.id_kuliner,
        nama: items.nama_kuliner,
        alamat: items.alamat_kuliner,
        latitude: items.latitude,
        longitude: items.longitude,
        kategori: "Kuliner",
        status_buka: items.status_buka,
        imageUrl: items.sampul_kuliner,
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

const add_ulasan_kuliner = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_kuliner } = req.params;

    if (!id_kuliner) {
      return res.status(400).send({ error: "kuliner is required" });
    }

    const data = await tbl_Kuliner.findOne({
      where: {
        id_kuliner,
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
        id_kuliner: id_kuliner,
        id_pesanan: id_pesanan,
        id_wisatawan: id_wisatawan
      },
    });

    if (dataUlasanExits) {
      return res.status(422).json({
        success: false,
        message: "Ulasan Anda sudah ditambahkan pada tempat ini",
        data: null
      });
    }

    const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    const add_ulasan = await tbl_ulasan.create({
      id_wisatawan: id_wisatawan,
      id_pesanan: id_pesanan,
      id_kuliner: id_kuliner,
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
      where: { id_kuliner },
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

const get_ulasan_kuliner = async (req, res) => {
  try {
    const { id_kuliner} = req.params;

    if (!id_kuliner) {
      return res.status(400).send({ error: "id_kuliner is required" });
    }

    const {
      keyword = '',
    } = req.query;

    const whereClause = {
      [Op.and]: [
        { id_kuliner: id_kuliner },
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

    const results = await Promise.all(data.rows.map(async (kuliner) => {
      let detail_wisatawan = [];

      detail_wisatawan = await tbl_Wisatawan.findOne({
        where: { id_wisatawan: kuliner.id_wisatawan },
        attributes: [
          "id_wisatawan",
          "name",
          "profile"
        ]
      });


      return {
        detail_wisatawan,
        rate: kuliner.rate,
        ulasan: kuliner.komentar,
        createdAt: kuliner.createdAt,
        updatedAt: kuliner.updatedAt
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

// KULINER (RUMAH MAKAN)
const get_all_kuliner_byAdmin = async (req, res) => {
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

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin industri" && user_admin.role !== "user industri") {
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
            { nama_kuliner: { [Op.like]: `%${keyword}%` } },
            { nib_kuliner: { [Op.like]: `%${keyword}%` } },
            { alamat_kuliner: { [Op.like]: `%${keyword}%` } },
            { kbli_kuliner: { [Op.like]: `%${keyword}%` } },
            { npwp_pemilik_kuliner: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    }

    const orderClause = [
      ['id_kuliner', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];

    const data = await tbl_Kuliner.findAndCountAll({
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

    const results = await Promise.all(data.rows.map(async (kuliner) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_desa_wisata = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: kuliner.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: kuliner.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: kuliner.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: kuliner.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_desa_wisata = await tbl_DesaWisata.findOne({
        where: { id_desaWisata: kuliner.id_desaWisata },
        attributes: [
          "id_desaWisata",
          "nama_desaWisata"
        ]
      });


      return {
        id_kuliner: kuliner.id_kuliner,
        detail_admin,
        detail_admin_verified,
        detail_author,
        detail_desa_wisata,
        detail_admin_pengelola,
        nama_kuliner: kuliner.nama_kuliner,
        nib_kuliner: kuliner.nib_kuliner,
        kbli_kuliner: kuliner.kbli_kuliner,
        npwp_kuliner: kuliner.npwp_kuliner,
        alamat_kuliner: kuliner.alamat_kuliner,
        status_buka: kuliner.status_buka,
        npwp_pemilik_kuliner: kuliner.npwp_pemilik_kuliner,
        maps_kuliner: kuliner.maps_kuliner,
        sampul_kuliner: kuliner.sampul_kuliner,
        ruang_kuliner: kuliner.ruang_kuliner,
        kontak_person_kuliner: kuliner.kontak_person_kuliner,
        total_pengunjung_kuliner: kuliner.total_pengunjung_kuliner,
        status_kuliner: kuliner.status_kuliner,
        status_verifikasi: kuliner.status_verifikasi,
        updatedAt: kuliner.updatedAt
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

const get_detail_kuliner_byAdmin = async (req, res) => {
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

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin industri" && user_admin.role !== "user industri") {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const { id_kuliner } = req.params;

    if (!id_kuliner) {
      return res.status(422).send({ error: "id_kuliner is required" });
    }

    const data = await tbl_Kuliner.findAndCountAll({
      where: {
        id_kuliner,
      },
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    const results = await Promise.all(data.rows.map(async (kuliner) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_desa_wisata = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: kuliner.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: kuliner.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: kuliner.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: kuliner.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_desa_wisata = await tbl_DesaWisata.findOne({
        where: { id_desaWisata: kuliner.id_desaWisata },
        attributes: [
          "id_desaWisata",
          "nama_desaWisata"
        ]
      });



      return {
        id_kuliner: kuliner.id_kuliner,
        detail_admin,
        detail_admin_verified,
        detail_author,
        detail_admin_pengelola,
        detail_desa_wisata,
        nama_kuliner: kuliner.nama_kuliner,
        nib_kuliner: kuliner.nib_kuliner,
        kbli_kuliner: kuliner.kbli_kuliner,
        npwp_kuliner: kuliner.npwp_kuliner,
        alamat_kuliner: kuliner.alamat_kuliner,
        status_buka: kuliner.status_buka,
        npwp_pemilik_kuliner: kuliner.npwp_pemilik_kuliner,
        maps_kuliner: kuliner.maps_kuliner,
        latitude: kuliner.latitude,
        longitude: kuliner.longitude,
        sampul_kuliner: kuliner.sampul_kuliner,
        ruang_kuliner: kuliner.ruang_kuliner,
        kontak_person_kuliner: kuliner.kontak_person_kuliner,
        total_pengunjung_kuliner: kuliner.total_pengunjung_kuliner,
        status_kuliner: kuliner.status_kuliner,
        status_verifikasi: kuliner.status_verifikasi,
        createdAt: kuliner.createdAt,
        updatedAt: kuliner.updatedAt
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

const add_data_kuliner_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
    { name: 'foto_ruang', maxCount: 1 }, 

  ])(req, res, async (err) => {
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

      if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin industri") {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

      const {
        id_admin,
        id_desaWisata,
        id_admin_pengelola,
        nama_kuliner,
        nib_kuliner,
        kbli_kuliner,
        alamat_kuliner,
        latitude, // tambahkan
        longitude, // tambahkan
        status_kuliner,
        status_buka,
        npwp_pemilik_kuliner,
        npwp_kuliner,
        kontak_person_kuliner,
      } = req.body;

      let add_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas") {

        if (
          !id_admin ||
          !id_desaWisata ||
          !id_admin_pengelola ||
          !nama_kuliner ||
          !alamat_kuliner ||
          !latitude ||
          !longitude ||
          !status_kuliner||
          !status_buka||
          !kontak_person_kuliner
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan kuliner" });
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

        const cek_admin_pengelola = await tbl_Admin.findAndCountAll({
          where: {
            id_admin: id_admin_pengelola
          },
        });

        if (cek_admin_pengelola.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "User industri tidak terdaftar",
          });
        }

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/kuliner/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/kuliner/${req.files['foto_ruang'][0].filename}` : null;


        add_data = await tbl_Kuliner.create({
          id_desaWisata: id_desaWisata,
          id_admin: id_admin,
          id_admin_pengelola: id_admin_pengelola,
          nama_kuliner: nama_kuliner,
          nib_kuliner: nib_kuliner,
          kbli_kuliner: kbli_kuliner,
          alamat_kuliner: alamat_kuliner,
          latitude : latitude,
          longitude: longitude,
          npwp_kuliner: npwp_kuliner,
          npwp_pemilik_kuliner: npwp_pemilik_kuliner,
          sampul_kuliner: uploadedFile1,
          ruang_kuliner: uploadedFile2,
          kontak_person_kuliner: kontak_person_kuliner,
          status_kuliner: status_kuliner,
          total_pengunjung_kuliner: 0,
          rate: 0,
          id_admin_author: id_admin_login,
          status_verifikasi: 'unverified',
          status_buka: status_buka,
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

      } else {

        if (
          !id_desaWisata ||
          !id_admin_pengelola ||
          !nama_kuliner ||
          !alamat_kuliner ||
          !latitude ||
          !longitude ||
          !status_kuliner||
          !status_buka||
          !kontak_person_kuliner
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan Rumah Makan" });
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

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/kuliner/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/kuliner/${req.files['foto_ruang'][0].filename}` : null;


        add_data = await tbl_Kuliner.create({
            id_desaWisata: id_desaWisata,
            id_admin: id_admin,
            id_admin_pengelola: id_admin_pengelola,
            nama_kuliner: nama_kuliner,
            nib_kuliner: nib_kuliner,
            kbli_kuliner: kbli_kuliner,
            alamat_kuliner: alamat_kuliner,
            latitude : latitude,
            longitude: longitude,
            npwp_kuliner: npwp_kuliner,
            npwp_pemilik_kuliner: npwp_pemilik_kuliner,
            sampul_kuliner: uploadedFile1,
            ruang_kuliner: uploadedFile2,
            kontak_person_kuliner: kontak_person_kuliner,
            status_kuliner: status_kuliner,
            total_pengunjung_kuliner: 0,
          id_admin_author: id_admin_login,
          status_verifikasi: 'unverified',
          status_buka: status_buka,
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

      }

      if (!add_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "kuliner gagal ditambahkan",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "kuliner berhasil ditambahkan",
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

const update_data_kuliner_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
    { name: 'foto_ruang', maxCount: 1 }, 
  
  ])(req, res, async (err) => {
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

      if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin industri" && user_admin.role !== "user industri") {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");


      const { id_kuliner } = req.params;

      if (!id_kuliner) {
        return res.status(400).send({ error: "id_kuliner is required" });
      }

      const kuliner_update = await tbl_Kuliner.findOne({
        where: {
            id_kuliner
        },
      });

      if (!kuliner_update) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: 'Kuliner tidak terdaftar'
        });
      }

      const {
        id_desaWisata,
        id_admin_pengelola,
        nama_kuliner,
        nib_kuliner,
        kbli_kuliner,
        alamat_kuliner,
        latitude,
        longitude,
        status_kuliner,
        status_buka,
        npwp_pemilik_kuliner,
        npwp_kuliner,
        kontak_person_kuliner
      } = req.body;

      let update_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas" || user_admin.role === "admin industri") {

        if (
          !id_desaWisata ||
          !id_admin_pengelola ||
          !nama_kuliner ||
          !alamat_kuliner ||
          !latitude ||
          !longitude ||
          !status_kuliner||
          !status_buka||
          !kontak_person_kuliner
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update Rumah Makan Kuliner", req_body: req.body });
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

        let uploadedFile1 = kuliner_update.sampul_kuliner
        let uploadedFile2 = kuliner_update.ruang_kuliner

        if (req.files) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/kuliner/${req.files['foto_depan'][0].filename}`;
          }

          if (req.files['foto_ruang']) {
            const name_file = uploadedFile2.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/kuliner/${req.files['foto_ruang'][0].filename}`;
          }
        }

        update_data = await kuliner_update.update({
          id_desaWisata: id_desaWisata,
          id_admin_pengelola: id_admin_pengelola,
          nama_kuliner: nama_kuliner,
          nib_kuliner: nib_kuliner,
          kbli_kuliner: kbli_kuliner,
          alamat_kuliner: alamat_kuliner,
          latitude: latitude,
          longitude: longitude,
          npwp_kuliner: npwp_kuliner,
          npwp_pemilik_kuliner: npwp_pemilik_kuliner,
          sampul_kuliner: uploadedFile1,
          ruang_kuliner: uploadedFile2,
          kontak_person_kuliner: kontak_person_kuliner,
          status_kuliner: status_kuliner,
          status_buka: status_buka,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

      } else {

        if (
            !nama_kuliner ||
            !alamat_kuliner ||
            !latitude ||
            !longitude ||
            !status_kuliner||
            !status_buka||
            !kontak_person_kuliner
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update paket wisata", req_body: req.body });
        }

        let uploadedFile1 = kuliner_update.sampul_kuliner
        let uploadedFile2 = kuliner_update.ruang_kuliner

        if (req.file) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/kuliner/${req.files['foto_depan'][0].filename}`;
          }

          if (req.files['foto_ruang']) {
            const name_file = uploadedFile2.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/kuliner/${req.files['foto_ruang'][0].filename}`;
          }
        }

        update_data = await kuliner_update.update({
          id_admin_pengelola: id_admin_login,
          nama_kuliner: nama_kuliner,
          nib_kuliner: nib_kuliner,
          kbli_kuliner: kbli_kuliner,
          alamat_kuliner: alamat_kuliner,
          latitude:latitude,
          longitude:longitude,
          npwp_kuliner: npwp_kuliner,
          npwp_pemilik_kuliner: npwp_pemilik_kuliner,
          sampul_kuliner: uploadedFile1,
          ruang_kuliner: uploadedFile2,
          kontak_person_kuliner: kontak_person_kuliner,
          status_kuliner: status_kuliner,
          status_buka: status_buka,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

      }

      if (!update_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "Rumah Makan Kuliner gagal diubah",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Rumah Makan Kuliner berhasil diubah",
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

const put_verifikasi_kuliner = async (req, res) => {
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


    const { id_kuliner } = req.params;

    if (!id_kuliner) {
      return res.status(400).send({ error: "id_kuliner is required" });
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

    const kuliner_update = await tbl_Kuliner.findOne({
      where: {
        id_kuliner
      },
    });

    if (!kuliner_update) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Tempat Kuliner tidak terdaftar'
      });
    }


    const update_data = await kuliner_update.update({
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
      message: "Data Tempat Kuliner berhasil diverifikasi",
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

const put_update_maps_kuliner = async (req, res) => {
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

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin industri" && user_admin.role !== "user industri") {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");


    const { id_kuliner } = req.params;

    if (!id_kuliner) {
      return res.status(400).send({ error: "id_kuliner is required" });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
    }

    const kuliner_update = await tbl_Kuliner.findOne({
      where: {
        id_kuliner
      },
    });

    if (!kuliner_update) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Tempat Kuliner tidak terdaftar'
      });
    }

    const update_data = await kuliner_update.update({
      maps_kuliner: url,
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

const delete_data_kuliner_byAdmin = async (req, res) => {
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

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin industri") {
      return res.status(422).json({ message: "Anda tidak dapat menghapus data" });
    }


    const { id_kuliner } = req.params;

    if (!id_kuliner) {
      return res.status(400).send({ error: "id_kuliner is required" });
    }

    const kuliner_data_delete = await tbl_Kuliner.findOne({
      where: {
        id_kuliner
      },
    });

    if (!kuliner_data_delete) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Tempat Kuliner tidak terdaftar'
      });
    }

    let url_sampul = kuliner_data_delete.sampul_kuliner;
    let url_ruang = kuliner_data_delete.ruang_kuliner;
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

    const delete_desawisata = await kuliner_data_delete.destroy();

    if (!delete_desawisata) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Tempat Kuliner gagal dihapus",
      });
    }

    return res.status(200).json({
      status: 'success',
      success: true,
      message: "Tempat Kuliner berhasil dihapus",
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

module.exports = {
  get_all_kuliner,
  get_detail_kuliner,
  get_all_kuliner_ByDesawisata,
  add_ulasan_kuliner,
  get_ulasan_kuliner,
  get_all_kuliner_byAdmin,
  get_detail_kuliner_byAdmin,
  add_data_kuliner_byAdmin,
  update_data_kuliner_byAdmin,
  put_verifikasi_kuliner,
  delete_data_kuliner_byAdmin,
  put_update_maps_kuliner
};