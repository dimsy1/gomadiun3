//  DITANYAKAN

const db = require('../models');
const tbl_Penginapan = db.tbl_Penginapan;
const tbl_Gallery = db.tbl_Gallery;
const tbl_fasilitas_utama_penginapan = db.tbl_fasilitas_utama_penginapan;
const tbl_Wisatawan = db.tbl_Wisatawan;
const tbl_Admin = db.tbl_Admin;
const tbl_Kamar = db.tbl_Kamar;
const tbl_DesaWisata = db.tbl_DesaWisata;
const tbl_Paket_homestay = db.tbl_Paket_homestay;
const tbl_ulasan = db.tbl_ulasan;
const tbl_fasilitas_paket_homestay = db.tbl_fasilitas_paket_homestay;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const moment = require('moment-timezone');
const path = require('path');
const Sequelize = require('sequelize');
const fs = require('fs');
const { Op, fn, col } = require('sequelize');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "./uploads/img/penginapan"; // Default folder untuk penginapan
    
    // Jika req.body.gallery diisi, simpan gambar di folder gallery
    if (req.body.isGallery) {
      dest = "./uploads/img/penginapan/gallery";
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




const get_all_penginapan = async (req, res) => {
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
            { nama_penginapan: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    };

    if (filter.kelas_penginapan) {
      const filterKelas = Array.isArray(filter.kelas_penginapan)
        ? filter.kelas_penginapan
        : filter.kelas_penginapan.split(",");

      if (filterKelas.length > 0) {
        whereClause[Op.and].push({
          kelas_penginapan: {
            [Sequelize.Op.or]: filterKelas.map((name) => ({
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

    if (filter.kategori_penginapan) {
      const filterkategori = Array.isArray(filter.kategori_penginapan)
        ? filter.kategori_penginapan
        : filter.kategori_penginapan.split(",");

      if (filterkategori.length > 0) {
        whereClause[Op.and].push({
          kategori_penginapan: {
            [Sequelize.Op.or]: filterkategori.map((name) => ({
              [Sequelize.Op.like]: `%${name.trim()}%`,
            }))
          }
        });
      } else {
        console.log("Empty filter.kategori_penginapan");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }

    const orderClause = [
      ['total_pengunjung_penginapan', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];


     const data = await tbl_Penginapan.findAndCountAll({
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
        id: items.id_penginapan,
        nama: items.nama_penginapan,
        alamat: items.alamat_penginapan,
        latitude: items.latitude,
        longitude: items.longitude,
        kategori: items.kategori_penginapan,
        pengunjung: items.total_pengunjung_penginapan,
        kelas: items.kelas_penginapan,
        harga_terendah: items.harga_terendah_penginapan,
        imageUrl: items.sampul_penginapan,
        gallery: [
          items.ruang_penginapan,
          items.ruang_penginapan_dua,
          items.ruang_penginapan_tiga,
          items.ruang_penginapan_empat,
          items.ruang_penginapan_lima,
          // Jika ada kolom tambahan, tambahkan di sini
        ].filter(img => img)  // Mengambil hanya gambar yang ada
      })),
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

const get_detail_penginapan = async (req, res) => {
  try {
    const { id_penginapan } = req.params;

    if (!id_penginapan) {
      return res.status(400).send({ error: "id_penginapan is required" });
    }

    const data = await tbl_Penginapan.findOne({
      where: {
        id_penginapan,
      },
      include: [
        {
          model: tbl_Gallery,
          as: "penginapan_gallery_as",
          attributes: [
            "id_gallery",
            "url"
          ],
          where: {
            name_table: "tbl_Penginapan"
          },
          required: false
        },
        {
          model: tbl_fasilitas_utama_penginapan,
          as: "penginapan_fasilitas_utama_as",
          attributes: [
            "id_fasilitas_utama",
            "fasilitas"
          ],
        },
      ],
    });

       // Ambil gallery dari properti yang sesuai
       const gallery = [
        data.ruang_penginapan,
        data.ruang_penginapan_dua,
        data.ruang_penginapan_tiga,
        data.ruang_penginapan_empat,
        data.ruang_penginapan_lima,
        // Tambahkan kolom tambahan jika ada
      ].filter(img => img); // Menghapus item yang tidak ada
  
      const result = {
        success: true,
        message: "Sukses mendapatkan data",
        data: [{
          id: data.id_penginapan,
          nama: data.nama_penginapan,
          alamat: data.alamat_penginapan,
          latitude: data.latitude,
          longitude: data.longitude,
          kategori: data.kategori_penginapan,
          kelas: data.kelas_penginapan,
          harga_terendah: data.harga_terendah_penginapan,
          imageUrl: data.sampul_penginapan,
          gallery: gallery, // Menggunakan variabel gallery yang sudah dibentuk
          fasilitas_utama: data.penginapan_fasilitas_utama_as ? data.penginapan_fasilitas_utama_as.map(item => ({
            id: item.id_fasilitas_utama,
            fasilitas: item.fasilitas,
          })) : [],
        }],
      };

    const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const excludePagesUrl = "https://apigomadiun.tifpsdku.com/api/desawisata/get_all";

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

const get_all_penginapan_ByDesawisata = async (req, res) => {
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
            { nama_penginapan: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    };

    const orderClause = [
      ['total_pengunjung_penginapan', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];


    const data = await tbl_Penginapan.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10),
      offset: offset,
      order: orderClause
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
        id: items.id_penginapan,
        nama: items.nama_penginapan,
        alamat: items.alamat_penginapan,
        latitude: items.latitude,
        longitude: items.longitude,
        kelas: items.kelas_penginapan,
        harga_terendah: items.harga_terendah_penginapan,
        kategori_penginapan : items.kategori_penginapan,
        harga: items.harga_terendah_penginapan,
        imageUrl: items.sampul_penginapan,
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
    const excludePagesUrl = "https://apigomadiun.tifpsdku.com/api/desawisata/get_all";

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

const add_ulasan_penginapan = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_penginapan } = req.params;

    if (!id_penginapan) {
      return res.status(400).send({ error: "penginapan is required" });
    }

    const data = await tbl_Penginapan.findOne({
      where: {
        id_penginapan,
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
        id_penginapan: id_penginapan,
        id_pesanan: id_pesanan,
        id_wisatawan: id_wisatawan
      },
    });

    if (dataUlasanExits) {
      return res.status(422).json({
        success: false,
        message: "Ulasan Anda sudah ditambahkan pada penginapan ini",
        data: null
      });
    }

    const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    const add_ulasan = await tbl_ulasan.create({
      id_wisatawan: id_wisatawan,
      id_pesanan: id_pesanan,
      id_penginapan: id_penginapan,
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
      where: { id_penginapan },
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

const get_ulasan_penginapan = async (req, res) => {
  try {
    const { id_penginapan} = req.params;

    if (!id_penginapan) {
      return res.status(400).send({ error: "id_penginapan is required" });
    }

    const {
      keyword = '',
    } = req.query;

    const whereClause = {
      [Op.and]: [
        { id_penginapan: id_penginapan },
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

    const results = await Promise.all(data.rows.map(async (penginapan) => {
      let detail_wisatawan = [];

      detail_wisatawan = await tbl_Wisatawan.findOne({
        where: { id_wisatawan: penginapan.id_wisatawan },
        attributes: [
          "id_wisatawan",
          "name",
          "profile"
        ]
      });


      return {
        detail_wisatawan,
        rate: penginapan.rate,
        ulasan: penginapan.komentar,
        createdAt: penginapan.createdAt,
        updatedAt: penginapan.updatedAt
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


//KAMAR HOTEL
const get_all_kamar_byAdmin = async (req, res) => {
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
            { nama_kamar: { [Op.like]: `%${keyword}%` } },
            { jumlah_kamar: { [Op.like]: `%${keyword}%` } },
            { kapasitas: { [Op.like]: `%${keyword}%` } },
            { bebas_rokok: { [Op.like]: `%${keyword}%` } },
            { fasilitas_sarapan: { [Op.like]: `%${keyword}%` } },
            { harga: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    }

    const orderClause = [
      ['id_kamar', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];

    const data = await tbl_Kamar.findAndCountAll({
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

    const results = await Promise.all(data.rows.map(async (kamar) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_penginapan = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: kamar.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: kamar.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: kamar.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: kamar.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_penginapan = await tbl_Penginapan.findOne({
        where: { id_penginapan: kamar.id_penginapan },
        attributes: [
          "id_penginapan",
          "nama_penginapan"
        ]
      });


      return {
        id_kamar: kamar.id_kamar,
        detail_admin,
        detail_admin_verified,
        detail_author,
        detail_penginapan,
        detail_admin_pengelola,
        nama_kamar: kamar.nama_kamar,
        deskripsi: kamar.deskripsi,
        harga: kamar.harga,
        kapasitas: kamar.kapasitas,
        jumlah_kamar: kamar.jumlah_kamar,
        bebas_rokok: kamar.bebas_rokok,
        fasilitas_sarapan: kamar.fasilitas_sarapan,
        sampul_kamar: kamar.sampul_kamar,
        ruang_kamar: kamar.ruang_kamar,
        ruang_kamar_dua: kamar.ruang_kamar_dua,
        ruang_kamar_tiga: kamar.ruang_kamar_tiga,
        ruang_kamar_empat: kamar.ruang_kamar_empat,
        ruang_kamar_lima: kamar.ruang_kamar_lima,
        status_verifikasi: kamar.status_verifikasi,
        updatedAt: kamar.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Kamar Hotel",
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

const get_all_kamar_ByPenginapan = async (req, res) => {
  try {
    const { id_penginapan } = req.params;

    if (!id_penginapan) {
      return res.status(400).send({ error: "id_penginapan is required" });
    }

    const { order = 'ASC' } = req.query;

    const whereClause = {
      [Op.and]: [
        { status_verifikasi: 'verified' },
        { id_penginapan },
      ]
    };

    const orderClause = [
      ['harga', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];

    // Mengambil data kamar berdasarkan kondisi yang ditentukan
    const data = await tbl_Kamar.findAndCountAll({
      where: whereClause,
      order: orderClause,
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Tersedia",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((items) => ({
        id: items.id_kamar,
        nama_kamar: items.nama_kamar,
        deskripsi: items.deskripsi,
        harga: items.harga,
        kapasitas: items.kapasitas,
        jumlah_kamar: items.jumlah_kamar,
        bebas_rokok: items.bebas_rokok,
        fasilitas_sarapan: items.fasilitas_sarapan,
        sampul_kamar: items.sampul_kamar,
        ruang_kamar: items.ruang_kamar,
        ruang_kamar_dua: items.ruang_kamar_dua,
        ruang_kamar_tiga: items.ruang_kamar_tiga,
        ruang_kamar_empat: items.ruang_kamar_empat,
        ruang_kamar_lima: items.ruang_kamar_lima,
      })),
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

const get_detail_kamar_byAdmin = async (req, res) => {
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

    const { id_kamar } = req.params;

    if (!id_kamar) {
      return res.status(422).send({ error: "id_kamar is required" });
    }

    const data = await tbl_Kamar.findAndCountAll({
      where: {
        id_kamar,
      },
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    const results = await Promise.all(data.rows.map(async (kamar) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_penginapan = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: kamar.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: kamar.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: kamar.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: kamar.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_penginapan = await tbl_Penginapan.findOne({
        where: { id_penginapan: kamar.id_penginapan },
        attributes: [
          "id_penginapan",
          "nama_penginapan"
        ]
      });


      return {
        id_kamar: kamar.id_kamar,
        detail_admin,
      detail_admin_verified,
      detail_author,
      detail_admin_pengelola,
      detail_penginapan,
      id: kamar.id_kamar,
      nama_kamar: kamar.nama_kamar,
      deskripsi: kamar.deskripsi,
      sampul_kamar: kamar.sampul_kamar,
        ruang_kamar: kamar.ruang_kamar,
        ruang_kamar_dua: kamar.ruang_kamar_dua,
        ruang_kamar_tiga: kamar.ruang_kamar_tiga,
        ruang_kamar_empat: kamar.ruang_kamar_empat,
        ruang_kamar_lima: kamar.ruang_kamar_lima,
      harga: kamar.harga,
      kapasitas: kamar.kapasitas,
      jumlah_kamar: kamar.jumlah_kamar,
      bebas_rokok: kamar.bebas_rokok,
      fasilitas_sarapan: kamar.fasilitas_sarapan,
      status_verifikasi: kamar.status_verifikasi,
        createdAt: kamar.createdAt,
        updatedAt: kamar.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Kamar",
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

const add_data_kamar_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
    { name: 'foto_ruang', maxCount: 1 }, 
    { name: 'foto_ruang_dua', maxCount: 1 }, 
    { name: 'foto_ruang_tiga', maxCount: 1 }, 
    { name: 'foto_ruang_empat', maxCount: 1 }, 
    { name: 'foto_ruang_lima', maxCount: 1 }
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
        id_penginapan,
        id_admin_pengelola,
        nama_kamar,
        deskripsi,
        harga,
        kapasitas,
        jumlah_kamar,
        bebas_rokok,
        fasilitas_sarapan,
      } = req.body;

      let add_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas") {

        if (
          !id_admin ||
          !id_penginapan ||
          !id_admin_pengelola ||
          !nama_kamar ||
          !deskripsi ||
          !harga ||
          !kapasitas ||
          !jumlah_kamar ||
          !bebas_rokok ||
          !fasilitas_sarapan
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan kamar" });
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

        const cek_penginapan = await tbl_Penginapan.findAndCountAll({
          where: {
            id_penginapan: id_penginapan
          },
        });

        if (cek_penginapan.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Penginapan tidak terdaftar",
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

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}` : null;
        const uploadedFile3 = req.files['foto_ruang_dua'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}` : null;
        const uploadedFile4 = req.files['foto_ruang_tiga'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}` : null;
        const uploadedFile5 = req.files['foto_ruang_empat'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}` : null;
        const uploadedFile6 = req.files['foto_ruang_lima'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}` : null;

        // Simpan data kamar
        add_data = await tbl_Kamar.create({
          id_penginapan: id_penginapan,
          id_admin: id_admin,
          id_admin_pengelola: id_admin_pengelola,
          nama_kamar: nama_kamar,
          deskripsi: deskripsi,
          sampul_kamar: uploadedFile1,
          ruang_kamar: uploadedFile2,
          ruang_kamar_dua: uploadedFile3,
          ruang_kamar_tiga: uploadedFile4,
          ruang_kamar_empat: uploadedFile5,
          ruang_kamar_lima: uploadedFile6,
          harga: harga,
          kapasitas: kapasitas,
          jumlah_kamar: jumlah_kamar,
          bebas_rokok: bebas_rokok,
          fasilitas_sarapan: fasilitas_sarapan,
          id_admin_author: id_admin_login,
          status_verifikasi: 'unverified',
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

      } else {
        // Proses jika role bukan admin
        if (
          !id_admin ||
          !id_penginapan ||
          !id_admin_pengelola ||
          !nama_kamar ||
          !deskripsi ||
          !harga ||
          !kapasitas ||
          !jumlah_kamar ||
          !bebas_rokok ||
          !fasilitas_sarapan
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan paket wisata" });
        }

        // Cek penginapan dan admin pengelola
        const cek_penginapan = await tbl_Penginapan.findAndCountAll({
          where: {
            id_penginapan: id_penginapan
          },
        });

        if (cek_penginapan.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Penginapan tidak terdaftar",
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

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}` : null;
        const uploadedFile3 = req.files['foto_ruang_dua'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}` : null;
        const uploadedFile4 = req.files['foto_ruang_tiga'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}` : null;
        const uploadedFile5 = req.files['foto_ruang_empat'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}` : null;
        const uploadedFile6 = req.files['foto_ruang_lima'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}` : null;

        // Simpan data kamar
        add_data = await tbl_Kamar.create({
          id_penginapan: id_penginapan,
          id_admin: id_admin,
          id_admin_pengelola: id_admin_pengelola,
          nama_kamar: nama_kamar,
          deskripsi: deskripsi,
          sampul_kamar: uploadedFile1,
          ruang_kamar: uploadedFile2,
          ruang_kamar_dua: uploadedFile3,
          ruang_kamar_tiga: uploadedFile4,
          ruang_kamar_empat: uploadedFile5,
          ruang_kamar_lima: uploadedFile6,
          harga: harga,
          kapasitas: kapasitas,
          jumlah_kamar: jumlah_kamar,
          bebas_rokok: bebas_rokok,
          fasilitas_sarapan: fasilitas_sarapan,
          id_admin_author: id_admin_login,
          status_verifikasi: 'unverified',
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });
      }

      if (!add_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "Kamar gagal ditambahkan",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Kamar berhasil ditambahkan",
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

const update_data_kamar_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
    { name: 'foto_ruang', maxCount: 1 }, 
    { name: 'foto_ruang_dua', maxCount: 1 }, 
    { name: 'foto_ruang_tiga', maxCount: 1 }, 
    { name: 'foto_ruang_empat', maxCount: 1 }, 
    { name: 'foto_ruang_lima', maxCount: 1 }

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
        where: { id_admin: id_admin_login }
      });

      if (!["admin", "dinas", "admin industri", "user industri"].includes(user_admin.role)) {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
      const { id_kamar } = req.params;

      if (!id_kamar) {
        return res.status(400).send({ error: "id_kamar is required" });
      }

      const kamar_update = await tbl_Kamar.findOne({ where: { id_kamar } });
      if (!kamar_update) {
        return res.status(422).json({ status: 'error', success: false, message: 'Kamar tidak terdaftar' });
      }
      if (!kamar_update) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: 'Kamar tidak terdaftar'
        });
      }

      const {
        id_penginapan,
        id_admin_pengelola,
        nama_kamar,
        deskripsi,
        harga,
        kapasitas,
        jumlah_kamar,
        bebas_rokok,
        fasilitas_sarapan,
      } = req.body;

      let update_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas" || user_admin.role === "admin industri") {

    if (
        !id_penginapan ||
        !id_admin_pengelola ||
        !nama_kamar ||
        !deskripsi ||
        !harga || 
        !kapasitas ||
        !jumlah_kamar ||
        !bebas_rokok ||
        !fasilitas_sarapan
      ) {
        return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update kamar", req_body: req.body });
      }
       

        const cek_admin_pengelola = await tbl_Admin.findAndCountAll({
          where: { id_admin: id_admin_pengelola },
        });

        if (cek_admin_pengelola.count === 0) {
          return res.status(422).json({ status: 'error', success: false, message: "User industri tidak terdaftar" });
        }

        let uploadedFile1 = kamar_update.sampul_kamar
        let uploadedFile2 = kamar_update.ruang_kamar
        let uploadedFile3 = kamar_update.ruang_kamar_dua
        let uploadedFile4 = kamar_update.ruang_kamar_tiga
        let uploadedFile5 = kamar_update.ruang_kamar_empat
        let uploadedFile6 = kamar_update.ruang_kamar_lima

        if (req.files) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}`;
          }

          if (req.files['foto_ruang']) {
            const name_file = uploadedFile2.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}`;
          }

          if (req.files['foto_ruang_dua']) {
            const name_file = uploadedFile3.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile3 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}`;
          }

          if (req.files['foto_ruang_tiga']) {
            const name_file = uploadedFile4.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile4 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}`;
          }

          if (req.files['foto_ruang_empat']) {
            const name_file = uploadedFile5.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile5 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}`;
          }
          if (req.files['foto_ruang_lima']) {
            const name_file = uploadedFile6.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile6 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}`;
          }
        }

        update_data = await kamar_update.update({
          id_penginapan: id_penginapan,
          id_admin_pengelola: id_admin_pengelola,
          nama_kamar: nama_kamar,
          deskripsi: deskripsi,
          harga: harga,
          sampul_kamar: uploadedFile1,
          ruang_kamar: uploadedFile2,
          ruang_kamar_dua: uploadedFile3,
          ruang_kamar_tiga: uploadedFile4,
          ruang_kamar_empat: uploadedFile5,
          ruang_kamar_lima: uploadedFile6,
          kapasitas: kapasitas,
          jumlah_kamar: jumlah_kamar,
          bebas_rokok: bebas_rokok,
          fasilitas_sarapan: fasilitas_sarapan,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

      } else {

        if (
          !id_penginapan ||
          !id_admin_pengelola ||
          !nama_kamar ||
          !deskripsi ||
          !harga || 
          !kapasitas ||
          !jumlah_kamar ||
          !bebas_rokok ||
          !fasilitas_sarapan
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update kamar", req_body: req.body });
        }

        let uploadedFile1 = kamar_update.sampul_kamar
        let uploadedFile2 = kamar_update.ruang_kamar
        let uploadedFile3 = kamar_update.ruang_kamar_dua
        let uploadedFile4 = kamar_update.ruang_kamar_tiga
        let uploadedFile5 = kamar_update.ruang_kamar_empat
        let uploadedFile6 = kamar_update.ruang_kamar_lima


        if (req.file) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}`;
          }

          if (req.files['foto_ruang']) {
            const name_file = uploadedFile2.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}`;
          }

          if (req.files['foto_ruang_dua']) {
            const name_file = uploadedFile3.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile3 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}`;
          }

          if (req.files['foto_ruang_tiga']) {
            const name_file = uploadedFile4.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile4 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}`;
          }

          if (req.files['foto_ruang_empat']) {
            const name_file = uploadedFile5.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile5 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}`;
          }

          if (req.files['foto_ruang_lima']) {
            const name_file = uploadedFile6.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile6 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}`;
          }
        }

        update_data = await kamar_update.update({
          id_admin_pengelola: id_admin_pengelola,
          nama_kamar: nama_kamar,
          deskripsi: deskripsi,
          harga: harga,
          sampul_kamar: uploadedFile1,
          ruang_kamar: uploadedFile2,
          ruang_kamar_dua: uploadedFile3,
          ruang_kamar_tiga: uploadedFile4,
          ruang_kamar_empat: uploadedFile5,
          ruang_kamar_lima: uploadedFile6,
          kapasitas: kapasitas,
          jumlah_kamar: jumlah_kamar,
          bebas_rokok: bebas_rokok,
          fasilitas_sarapan: fasilitas_sarapan,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });
      }

      return res.status(200).json({
        status: 'success',
        message: "Data kamar berhasil diperbarui",
        data: update_data
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 'error',
        success: false,
        message: 'Internal Server Error',
        data: null
      });
    }
  });
};

const put_verifikasi_kamar = async (req, res) => {
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


    const { id_kamar } = req.params;

    if (!id_kamar) {
      return res.status(400).send({ error: "id_kamar is required" });
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

    const kamar_update = await tbl_Kamar.findOne({
      where: {
        id_kamar
      },
    });

    if (!kamar_update) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Kamar tidak terdaftar'
      });
    }


    const update_data = await kamar_update.update({
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
      message: "Data Kamar berhasil diverifikasi",
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

const delete_data_kamar_byAdmin = async (req, res) => {
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


    const { id_kamar } = req.params;

    if (!id_kamar) {
      return res.status(400).send({ error: "id_kamar is required" });
    }

    const kamar_data_delete = await tbl_Kamar.findOne({
      where: {
        id_kamar
      },
    });

    if (!kamar_data_delete) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Kamar tidak terdaftar'
      });
    }

    const galleryData = await tbl_Gallery.findAll({
      where: {
        id_kamar: id_kamar,
        name_table: 'tbl_Kamar',
      },
    });

    // Hapus gambar dari sistem file
    if (galleryData.length > 0) {
      for (const image of galleryData) {
        const filePath = `./uploads/img/penginapan/${image.name_image}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${image.name_image}:`, err);
          }
        });
      }

      // Hapus gambar dari tabel tbl_Gallery
      await tbl_Gallery.destroy({
        where: {
          id_kamar: id_kamar,
          name_table: 'tbl_Kamar',
        },
      });
    }

    // Hapus data kamar
    const delete_kamar = await kamar_data_delete.destroy();


    if (!delete_kamar) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Kamar gagal dihapus",
      });
    }

    return res.status(200).json({
      status: 'success',
      success: true,
      message: "Kamar berhasil dihapus",
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


//PAKET HOMESTAY (PILIHAN KAMAR HOMESTAY)
const get_all_homestay_byAdmin = async (req, res) => {
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
            { nama_paket_homestay: { [Op.like]: `%${keyword}%` } },
            { deskripsi_paket_homestay: { [Op.like]: `%${keyword}%` } },
            { harga: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    }

    const orderClause = [
      ['id_paket_homestay', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];

    const data = await tbl_Paket_homestay.findAndCountAll({
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

    const results = await Promise.all(data.rows.map(async (paket_homestay) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_penginapan = [];
      let detail_fasilitas_homestay = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: paket_homestay.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: paket_homestay.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: paket_homestay.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: paket_homestay.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_penginapan = await tbl_Penginapan.findOne({
        where: { id_penginapan: paket_homestay.id_penginapan },
        attributes: [
          "id_penginapan",
          "nama_penginapan"
        ]
      });

      detail_fasilitas_homestay = await tbl_fasilitas_paket_homestay.findAll({
        where: {
          id_paket_homestay: paket_homestay.id_paket_homestay,
        },
        attributes: ['value_fasilitas_paket']
      });


      return {
        id_paket_homestay: paket_homestay.id_paket_homestay,
        detail_admin,
        detail_admin_verified,
        detail_author,
        detail_penginapan,
        detail_admin_pengelola,
        nama_paket_homestay: paket_homestay.nama_paket_homestay,
        deskripsi_paket_homestay: paket_homestay.deskripsi_paket_homestay,
        harga: paket_homestay.harga,
        sampul_paket_homestay: paket_homestay.sampul_paket_homestay,
        ruang_paket_homestay: paket_homestay.ruang_paket_homestay,
        ruang_paket_homestay_dua: paket_homestay.ruang_paket_homestay_dua,
        ruang_paket_homestay_tiga: paket_homestay.ruang_paket_homestay_tiga,
        ruang_paket_homestay_empat: paket_homestay.ruang_paket_homestay_empat,
        ruang_paket_homestay_lima: paket_homestay.ruang_paket_homestay_lima,
        detail_fasilitas_homestay,
        status_verifikasi: paket_homestay.status_verifikasi,
        updatedAt: paket_homestay.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Kamar Homestay",
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

const get_all_homestay_ByPenginapan = async (req, res) => {
  try {
    const { id_penginapan } = req.params;

    if (!id_penginapan) {
      return res.status(400).send({ error: "id_penginapan is required" });
    }

    const { order = 'ASC' } = req.query;

    const whereClause = {
      [Op.and]: [
        { status_verifikasi: 'verified' },
        { id_penginapan },
      ]
    };

    const orderClause = [
      ['harga', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];

    const data = await tbl_Paket_homestay.findAndCountAll({
      where: whereClause,
      order: orderClause,
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Tersedia",
        data: null,
      });
    }

    // Fetch fasilitas for each paket homestay
    const paketWithFasilitas = await Promise.all(data.rows.map(async (items) => {
      const fasilitas = await tbl_fasilitas_paket_homestay.findAll({
        where: {
          id_paket_homestay: items.id_paket_homestay,
        },
        attributes: ['value_fasilitas_paket', 'nama_fasilitas_paket']
      });

      return {
        id: items.id_paket_homestay,
        nama_paket_homestay: items.nama_paket_homestay,
        deskripsi_paket_homestay: items.deskripsi_paket_homestay,
        harga: items.harga,
        sampul_paket_homestay: items.sampul_paket_homestay,
        ruang_paket_homestay: items.ruang_paket_homestay,
        ruang_paket_homestay_dua: items.ruang_paket_homestay_dua,
        ruang_paket_homestay_tiga: items.ruang_paket_homestay_tiga,
        ruang_paket_homestay_empat: items.ruang_paket_homestay_empat,
        ruang_paket_homestay_lima: items.ruang_paket_homestay_lima,
        fasilitas: fasilitas.map((fasilitasItem) => ({
          value: fasilitasItem.value_fasilitas_paket,
          nama: fasilitasItem.nama_fasilitas_paket,
        })),
      };
    }));

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: paketWithFasilitas,
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

const add_data_homestay_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
    { name: 'foto_ruang', maxCount: 1 }, 
    { name: 'foto_ruang_dua', maxCount: 1 }, 
    { name: 'foto_ruang_tiga', maxCount: 1 }, 
    { name: 'foto_ruang_empat', maxCount: 1 }, 
    { name: 'foto_ruang_lima', maxCount: 1 }
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
        id_penginapan,
        id_admin_pengelola,
        nama_paket_homestay,
        deskripsi_paket_homestay,
        harga,
      } = req.body;

      let add_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas") {

        if (
          !id_admin ||
          !id_penginapan ||
          !id_admin_pengelola ||
          !nama_paket_homestay ||
          !deskripsi_paket_homestay ||
          !harga
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan kamar" });
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

        const cek_penginapan = await tbl_Penginapan.findAndCountAll({
          where: {
            id_penginapan: id_penginapan
          },
        });

        if (cek_penginapan.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Penginapan tidak terdaftar",
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

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}` : null;
        const uploadedFile3 = req.files['foto_ruang_dua'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}` : null;
        const uploadedFile4 = req.files['foto_ruang_tiga'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}` : null;
        const uploadedFile5 = req.files['foto_ruang_empat'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}` : null;
        const uploadedFile6 = req.files['foto_ruang_lima'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}` : null;

        // Simpan data kamar
        add_data = await tbl_Paket_homestay.create({
          id_penginapan: id_penginapan,
          id_admin: id_admin,
          id_admin_pengelola: id_admin_pengelola,
          nama_paket_homestay: nama_paket_homestay,
          deskripsi_paket_homestay: deskripsi_paket_homestay,
          harga: harga,
          sampul_paket_homestay: uploadedFile1,
          ruang_paket_homestay: uploadedFile2,
          ruang_paket_homestay_dua: uploadedFile3,
          ruang_paket_homestay_tiga: uploadedFile4,
          ruang_paket_homestay_empat: uploadedFile5,
          ruang_paket_homestay_lima: uploadedFile6,
          id_admin_author: id_admin_login,
          status_verifikasi: 'unverified',
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

      } else {
        // Proses jika role bukan admin
        if (
          !id_admin ||
          !id_penginapan ||
          !id_admin_pengelola ||
          !nama_paket_homestay ||
          !deskripsi_paket_homestay ||
          !harga
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan kamar" });
        }

        // Cek penginapan dan admin pengelola
        const cek_penginapan = await tbl_Penginapan.findAndCountAll({
          where: {
            id_penginapan: id_penginapan
          },
        });

        if (cek_penginapan.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Penginapan tidak terdaftar",
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

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}` : null;
        const uploadedFile3 = req.files['foto_ruang_dua'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}` : null;
        const uploadedFile4 = req.files['foto_ruang_tiga'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}` : null;
        const uploadedFile5 = req.files['foto_ruang_empat'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}` : null;
        const uploadedFile6 = req.files['foto_ruang_lima'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}` : null;

        // Simpan data kamar
        add_data = await tbl_Paket_homestay.create({
          id_penginapan: id_penginapan,
          id_admin: id_admin,
          id_admin_pengelola: id_admin_pengelola,
          nama_kamar: nama_paket_homestay,
          deskripsi: deskripsi_paket_homestay,
          harga: harga,
          sampul_paket_homestay: uploadedFile1,
          ruang_paket_homestay: uploadedFile2,
          ruang_paket_homestay_dua: uploadedFile3,
          ruang_paket_homestay_tiga: uploadedFile4,
          ruang_paket_homestay_empat: uploadedFile5,
          ruang_paket_homestay_lima: uploadedFile6,
          id_admin_author: id_admin_login,
          status_verifikasi: 'unverified',
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });
      }

      if (!add_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "Kamar gagal ditambahkan",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Kamar berhasil ditambahkan",
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

const update_data_homestay_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
    { name: 'foto_ruang', maxCount: 1 }, 
    { name: 'foto_ruang_dua', maxCount: 1 }, 
    { name: 'foto_ruang_tiga', maxCount: 1 }, 
    { name: 'foto_ruang_empat', maxCount: 1 }, 
    { name: 'foto_ruang_lima', maxCount: 1 }
  
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
        where: { id_admin: id_admin_login }
      });

      if (!["admin", "dinas", "admin industri", "user industri"].includes(user_admin.role)) {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
      const { id_paket_homestay } = req.params;

      if (!id_paket_homestay) {
        return res.status(400).send({ error: "id_paket_homestay is required" });
      }

      const paket_homestay_update = await tbl_Paket_homestay.findOne({ where: { id_paket_homestay } });
      if (!paket_homestay_update) {
        return res.status(422).json({ status: 'error', success: false, message: 'Kamar tidak terdaftar' });
      }
      if (!paket_homestay_update) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: 'Kamar tidak terdaftar'
        });
      }
      

      const {
        id_penginapan,
        id_admin_pengelola,
        nama_paket_homestay,
        deskripsi_paket_homestay,
        harga,
      } = req.body;

      let update_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas" || user_admin.role === "admin industri") {

      if (
        !id_penginapan ||
        !id_admin_pengelola ||
        !nama_paket_homestay ||
        !deskripsi_paket_homestay ||
        !harga
      ) {
        return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update kamar", req_body: req.body });
      }

        const cek_admin_pengelola = await tbl_Admin.findAndCountAll({
          where: { id_admin: id_admin_pengelola },
        });

        if (cek_admin_pengelola.count === 0) {
          return res.status(422).json({ status: 'error', success: false, message: "User industri tidak terdaftar" });
        }

        let uploadedFile1 = paket_homestay_update.sampul_paket_homestay
        let uploadedFile2 = paket_homestay_update.ruang_paket_homestay
        let uploadedFile3 = paket_homestay_update.ruang_paket_homestay_dua
        let uploadedFile4 = paket_homestay_update.ruang_paket_homestay_tiga
        let uploadedFile5 = paket_homestay_update.ruang_paket_homestay_empat
        let uploadedFile6 = paket_homestay_update.ruang_paket_homestay_lima

        if (req.files) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}`;
          }

          if (req.files['foto_ruang']) {
            const name_file = uploadedFile2.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}`;
          }

          if (req.files['foto_ruang_dua']) {
            const name_file = uploadedFile3.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile3 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}`;
          }

          if (req.files['foto_ruang_tiga']) {
            const name_file = uploadedFile4.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile4 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}`;
          }

          if (req.files['foto_ruang_empat']) {
            const name_file = uploadedFile5.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile5 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}`;
          }
          if (req.files['foto_ruang_lima']) {
            const name_file = uploadedFile6.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile6 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}`;
          }
        }

        update_data = await paket_homestay_update.update({
          id_penginapan: id_penginapan,
          id_admin_pengelola: id_admin_pengelola,
          nama_paket_homestay: nama_paket_homestay,
          deskripsi_paket_homestay: deskripsi_paket_homestay,
          harga: harga,
          sampul_paket_homestay: uploadedFile1,
          ruang_paket_homestay: uploadedFile2,
          ruang_paket_homestay_dua: uploadedFile3,
          ruang_paket_homestay_tiga: uploadedFile4,
          ruang_paket_homestay_empat: uploadedFile5,
          ruang_paket_homestay_lima: uploadedFile6,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

      } else {

      if (
        !id_penginapan ||
        !id_admin_pengelola ||
        !nama_paket_homestay ||
        !deskripsi_paket_homestay ||
        !harga
      ) {
        return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update kamar", req_body: req.body });
      }

      let uploadedFile1 = paket_homestay_update.sampul_paket_homestay
      let uploadedFile2 = paket_homestay_update.ruang_paket_homestay
      let uploadedFile3 = paket_homestay_update.ruang_paket_homestay_dua
      let uploadedFile4 = paket_homestay_update.ruang_paket_homestay_tiga
      let uploadedFile5 = paket_homestay_update.ruang_paket_homestay_empat
      let uploadedFile6 = paket_homestay_update.ruang_paket_homestay_lima

      if (req.file) {
        if (req.files['foto_depan']) {
          const name_file = uploadedFile1.split('/uploads/')[1];
          const oldFilePath = `./uploads/${name_file}`;

          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            }
          });

          uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}`;
        }

        if (req.files['foto_ruang']) {
          const name_file = uploadedFile2.split('/uploads/')[1];
          const oldFilePath = `./uploads/${name_file}`;

          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            }
          });

          uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}`;
        }

        if (req.files['foto_ruang_dua']) {
          const name_file = uploadedFile3.split('/uploads/')[1];
          const oldFilePath = `./uploads/${name_file}`;

          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            }
          });

          uploadedFile3 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}`;
        }

        if (req.files['foto_ruang_tiga']) {
          const name_file = uploadedFile4.split('/uploads/')[1];
          const oldFilePath = `./uploads/${name_file}`;

          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            }
          });

          uploadedFile4 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}`;
        }

        if (req.files['foto_ruang_empat']) {
          const name_file = uploadedFile5.split('/uploads/')[1];
          const oldFilePath = `./uploads/${name_file}`;

          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            }
          });

          uploadedFile5 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}`;
        }

        if (req.files['foto_ruang_lima']) {
          const name_file = uploadedFile6.split('/uploads/')[1];
          const oldFilePath = `./uploads/${name_file}`;

          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            }
          });

          uploadedFile6 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}`;
        }
      }

        update_data = await paket_homestay_update.update({
          id_admin_pengelola: id_admin_pengelola,
          nama_paket_homestay: nama_paket_homestay,
          deskripsi_paket_homestay: deskripsi_paket_homestay,
          harga: harga,
          sampul_paket_homestay: uploadedFile1,
          ruang_paket_homestay: uploadedFile2,
          ruang_paket_homestay_dua: uploadedFile3,
          ruang_paket_homestay_tiga: uploadedFile4,
          ruang_paket_homestay_empat: uploadedFile5,
          ruang_paket_homestay_lima: uploadedFile6,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });
      }

      return res.status(200).json({
        status: 'success',
        message: "Data kamar berhasil diperbarui",
        data: update_data
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 'error',
        success: false,
        message: 'Internal Server Error',
        data: null
      });
    }
  });
};

const put_verifikasi_homestay = async (req, res) => {
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


    const { id_paket_homestay } = req.params;

    if (!id_paket_homestay) {
      return res.status(400).send({ error: "id_paket_homestay is required" });
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

    const paket_homestay__update = await tbl_Paket_homestay.findOne({
      where: {
        id_paket_homestay
      },
    });

    if (!paket_homestay__update) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Kamar tidak terdaftar'
      });
    }


    const update_data = await paket_homestay__update.update({
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
      message: "Data Kamar berhasil diverifikasi",
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

const delete_data_homestay_byAdmin = async (req, res) => {
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


    const { id_paket_homestay } = req.params;

    if (!id_paket_homestay) {
      return res.status(400).send({ error: "id_paket_homestay is required" });
    }

    const paket_homestay_data_delete = await tbl_Paket_homestay.findOne({
      where: {
        id_paket_homestay
      },
    });

    if (!paket_homestay_data_delete) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Paket Homestay tidak terdaftar'
      });
    }

    const galleryData = await tbl_Gallery.findAll({
      where: {
        id_kamar: id_paket_homestay,
        name_table: 'tbl_Paket_homestay',
      },
    });

    // Hapus gambar dari sistem file
    if (galleryData.length > 0) {
      for (const image of galleryData) {
        const filePath = `./uploads/img/penginapan/${image.name_image}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${image.name_image}:`, err);
          }
        });
      }

      // Hapus gambar dari tabel tbl_Gallery
      await tbl_Gallery.destroy({
        where: {
          id_kamar: id_paket_homestay,
          name_table: 'tbl_Paket_homestay',
        },
      });
    }

    // Hapus data kamar
    const delete_paket_homestay = await paket_homestay_data_delete.destroy();


    if (!delete_paket_homestay) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Kamar Homestay gagal dihapus",
      });
    }

    return res.status(200).json({
      status: 'success',
      success: true,
      message: "Kamar Homestay berhasil dihapus",
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

const get_detail_homestay_byAdmin = async (req, res) => {
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

    const { id_paket_homestay } = req.params;

    if (!id_paket_homestay) {
      return res.status(422).send({ error: "id_paket_homestay is required" });
    }

    const data = await tbl_Paket_homestay.findAndCountAll({
      where: {
        id_paket_homestay,
      },
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    const results = await Promise.all(data.rows.map(async (paket_homestay) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_penginapan = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: paket_homestay.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: paket_homestay.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: paket_homestay.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: paket_homestay.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_penginapan = await tbl_Penginapan.findOne({
        where: { id_penginapan: paket_homestay.id_penginapan },
        attributes: [
          "id_penginapan",
          "nama_penginapan"
        ]
      });

      detail_fasilitas_homestay = await tbl_fasilitas_paket_homestay.findAll({
        where: {
          id_paket_homestay,
        },
        attributes: ['value_fasilitas_paket', 'nama_fasilitas_paket']
      });


      return {
        id_paket_homestay: paket_homestay.id_paket_homestay,
        detail_admin,
      detail_admin_verified,
      detail_author,
      detail_admin_pengelola,
      detail_penginapan,
      detail_fasilitas_homestay,
      id: paket_homestay.id_paket_homestay,
      nama_paket_homestay: paket_homestay.nama_paket_homestay,
      deskripsi_paket_homestay: paket_homestay.deskripsi_paket_homestay,
      harga: paket_homestay.harga,
      sampul_paket_homestay: paket_homestay.sampul_paket_homestay,
        ruang_paket_homestay: paket_homestay.ruang_paket_homestay,
        ruang_paket_homestay_dua: paket_homestay.ruang_paket_homestay_dua,
        ruang_paket_homestay_tiga: paket_homestay.ruang_paket_homestay_tiga,
        ruang_paket_homestay_empat: paket_homestay.ruang_paket_homestay_empat,
        ruang_paket_homestay_lima: paket_homestay.ruang_paket_homestay_lima,
      status_verifikasi: paket_homestay.status_verifikasi,
      createdAt: paket_homestay.createdAt,
      updatedAt: paket_homestay.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Kamar",
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

const add_fasilitas_homestay_byAdmin = async (req, res) => {
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

    const {
      id_paket_homestay,
      valueFasilitas = [],
    } = req.body;

    if (
      !id_paket_homestay ||
      valueFasilitas.length === 0
    ) {
      return res.status(422).json({ status: 'error', message: "Lengkapi data inputan fasilitas kamar" });
    }

    const fasilitas_update = await tbl_fasilitas_paket_homestay.findAndCountAll({
      where: {
        id_paket_homestay: id_paket_homestay
      },
    });

    if (fasilitas_update.count !== 0) {
      for (const nama_fasilitas_paket of fasilitas_update.rows) {
        await nama_fasilitas_paket.destroy();
      }
    }

    let add_data = []

    for (let row of valueFasilitas) {
      add_data = await tbl_fasilitas_paket_homestay.create({
        id_paket_homestay: id_paket_homestay,
        value_fasilitas_paket: row,
        nama_fasilitas_paket: row === 1 ? "Air Conditioner" : row === 2 ? "Kamar Mandi Bersama" : row === 3 ? "Wifi" : row === 4 ? "TV" : row === 5 ? "Perlengkapan Mandi" : row === 6 ? "Parkiran" : row === 7 ? "Kolam Renang" : "Mushola",
        createdAt: currentDateTime,
        updatedAt: currentDateTime
      });
    }

    if (!add_data) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Fasilitas Kamar gagal ditambahkan",
      });
    }

    const paket_homestay_update = await tbl_Paket_homestay.findOne({
      where: {
        id_paket_homestay
      },
    });

    const update_data = await paket_homestay_update.update({
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
      message: "Fasilitas Kamar berhasil ditambahkan",
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

//ADMIN
const get_all_penginapan_byAdmin = async (req, res) => {
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
        byAdminPengelola? {
          id_admin_pengelola: byAdminPengelola
        } : {},
        keyword ? {
          [Op.or]: [
            { nama_penginapan: { [Op.like]: `%${keyword}%` } },
            { nib_penginapan: { [Op.like]: `%${keyword}%` } },
            { alamat_penginapan: { [Op.like]: `%${keyword}%` } },
            { kbli_penginapan: { [Op.like]: `%${keyword}%` } },
            { npwp_pemilik_penginapan: { [Op.like]: `%${keyword}%` } },
            { harga_terendah_penginapan: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    }

    const orderClause = [
      ['id_penginapan', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];

    const data = await tbl_Penginapan.findAndCountAll({
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

    const results = await Promise.all(data.rows.map(async (penginapan) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_desa_wisata = [];
      let detail_fasilitas_penginapan = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: penginapan.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: penginapan.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: penginapan.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: penginapan.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_desa_wisata = await tbl_DesaWisata.findOne({
        where: { id_desaWisata: penginapan.id_desaWisata },
        attributes: [
          "id_desaWisata",
          "nama_desaWisata"
        ]
      });

      detail_fasilitas_penginapan = await tbl_fasilitas_utama_penginapan.findAll({
        where: {
          id_penginapan: penginapan.id_penginapan,
        },
        attributes: ['value_fasilitas_penginapan']
      });


      return {
        id_penginapan: penginapan.id_penginapan,
        detail_admin,
        detail_admin_verified,
        detail_author,
        detail_desa_wisata,
        detail_admin_pengelola,
        nama_penginapan: penginapan.nama_penginapan,
        nib_penginapan: penginapan.nib_penginapan,
        kbli_penginapan: penginapan.kbli_penginapan,
        npwp_penginapan: penginapan.npwp_penginapan,
        alamat_penginapan: penginapan.alamat_penginapan,
        npwp_pemilik_penginapan: penginapan.npwp_pemilik_penginapan,
        kategori_penginapan: penginapan.kategori_penginapan,
        kelas_penginapan: penginapan.kelas_penginapan,
        desk_penginapan: penginapan.desk_penginapan,
        sampul_penginapan: penginapan.sampul_penginapan,
        ruang_penginapan: penginapan.ruang_penginapan,
        ruang_penginapan_dua: penginapan.ruang_penginapan_dua,
        ruang_penginapan_tiga: penginapan.ruang_penginapan_tiga,
        ruang_penginapan_empat: penginapan.ruang_penginapan_empat,
        ruang_penginapan_lima: penginapan.ruang_penginapan_lima,
        jenis_kendaraan: penginapan.jenis_kendaraan,
        harga_terendah_penginapan: penginapan.harga_terendah_penginapan,
        detail_fasilitas_penginapan,
        kontak_person_penginapan: penginapan.kontak_person_penginapan,
        total_pengunjung_penginapan: penginapan.total_pengunjung_penginapan,
        status_penginapan: penginapan.status_penginapan,
        status_verifikasi: penginapan.status_verifikasi,
        updatedAt: penginapan.updatedAt
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

const get_detail_penginapan_byAdmin = async (req, res) => {
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

    const { id_penginapan } = req.params;

    if (!id_penginapan) {
      return res.status(422).send({ error: "id_penginapan is required" });
    }

    const data = await tbl_Penginapan.findAndCountAll({
      where: {
        id_penginapan,
      },
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    const results = await Promise.all(data.rows.map(async (penginapan) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_verified = [];
      let detail_admin_pengelola = [];
      let detail_desa_wisata = [];
      let detail_fasilitas_penginapan = [];

      detail_author = await tbl_Admin.findOne({
        where: { id_admin: penginapan.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_Admin.findOne({
        where: { id_admin: penginapan.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_verified = await tbl_Admin.findOne({
        where: { id_admin: penginapan.id_admin_verifed },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_Admin.findOne({
        where: { id_admin: penginapan.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_desa_wisata = await tbl_DesaWisata.findOne({
        where: { id_desaWisata: penginapan.id_desaWisata },
        attributes: [
          "id_desaWisata",
          "nama_desaWisata"
        ]
      });

      detail_fasilitas_penginapan = await tbl_fasilitas_utama_penginapan.findAll({
        where: {
          id_penginapan,
        },
        attributes: ['value_fasilitas_penginapan', 'fasilitas']
      });



      return {
        id_penginapan: penginapan.id_penginapan,
        detail_admin,
        detail_admin_verified,
        detail_author,
        detail_admin_pengelola,
        detail_desa_wisata,
        nama_penginapan: penginapan.nama_penginapan,
        nib_penginapan: penginapan.nib_penginapan,
        kbli_penginapan: penginapan.kbli_penginapan,
        npwp_penginapan: penginapan.npwp_penginapan,
        alamat_penginapan: penginapan.alamat_penginapan,
        latitude: penginapan.latitude,
        longitude: penginapan.longitude,
        npwp_pemilik_penginapan: penginapan.npwp_pemilik_penginapan,
        kategori_penginapan: penginapan.kategori_penginapan,
        kelas_penginapan: penginapan.kelas_penginapan,
        desk_penginapan: penginapan.desk_penginapan,
        sampul_penginapan: penginapan.sampul_penginapan,
        ruang_penginapan: penginapan.ruang_penginapan,
        ruang_penginapan_dua: penginapan.ruang_penginapan_dua,
        ruang_penginapan_tiga: penginapan.ruang_penginapan_tiga,
        ruang_penginapan_empat: penginapan.ruang_penginapan_empat,
        ruang_penginapan_lima: penginapan.ruang_penginapan_lima,
        harga_terendah_penginapan: penginapan.harga_terendah_penginapan,
        kontak_person_penginapan: penginapan.kontak_person_penginapan,
        total_pengunjung_penginapan: penginapan.total_pengunjung_penginapan,
        status_penginapan: penginapan.status_penginapan,
        status_verifikasi: penginapan.status_verifikasi,
        detail_fasilitas_penginapan,
        createdAt: penginapan.createdAt,
        updatedAt: penginapan.updatedAt
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

const add_data_penginapan_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
    { name: 'foto_ruang', maxCount: 1 }, 
    { name: 'foto_ruang_dua', maxCount: 1 }, 
    { name: 'foto_ruang_tiga', maxCount: 1 }, 
    { name: 'foto_ruang_empat', maxCount: 1 }, 
    { name: 'foto_ruang_lima', maxCount: 1 }

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
        nama_penginapan,
        nib_penginapan,
        kbli_penginapan,
        alamat_penginapan,
        status_penginapan,
        npwp_pemilik_penginapan,
        npwp_penginapan,
        kategori_penginapan,
        kelas_penginapan,
        desk_penginapan,
        harga_terendah_penginapan,
        kontak_person_penginapan,
        latitude, // tambahkan
        longitude, // tambahkan
      } = req.body;

      let add_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas") {

        if (
          !id_admin ||
          !id_desaWisata ||
          !id_admin_pengelola ||
          !nama_penginapan ||
          !alamat_penginapan ||
          !status_penginapan||
          !desk_penginapan ||
          !kategori_penginapan ||
          !kelas_penginapan ||
          !harga_terendah_penginapan ||
          !latitude ||
          !longitude ||
          !kontak_person_penginapan
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan penginapan" });
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
            message: "User Pengelola tidak terdaftar",
          });
        }

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}` : null;
        const uploadedFile3 = req.files['foto_ruang_dua'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}` : null;
        const uploadedFile4 = req.files['foto_ruang_tiga'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}` : null;
        const uploadedFile5 = req.files['foto_ruang_empat'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}` : null;
        const uploadedFile6 = req.files['foto_ruang_lima'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}` : null;


        add_data = await tbl_Penginapan.create({
          id_desaWisata: id_desaWisata,
          id_admin: id_admin,
          id_admin_pengelola: id_admin_pengelola, //ganti pengelola ae
          nama_penginapan: nama_penginapan,
          nib_penginapan: nib_penginapan,
          kbli_penginapan: kbli_penginapan,
          alamat_penginapan: alamat_penginapan,
          npwp_penginapan: npwp_penginapan,
          npwp_pemilik_penginapan: npwp_pemilik_penginapan,
          desk_penginapan: desk_penginapan,
          sampul_penginapan: uploadedFile1,
          ruang_penginapan: uploadedFile2,
          ruang_penginapan_dua: uploadedFile3,
          ruang_penginapan_tiga: uploadedFile4,
          ruang_penginapan_empat: uploadedFile5,
          ruang_penginapan_lima: uploadedFile6,
          harga_terendah_penginapan: harga_terendah_penginapan,
          kategori_penginapan: kategori_penginapan,
          kelas_penginapan: kelas_penginapan,
          kontak_person_penginapan: kontak_person_penginapan,
          status_penginapan: status_penginapan,
          total_pengunjung_penginapan: 0,
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
          !id_admin_pengelola ||
          !nama_penginapan ||
          !alamat_penginapan ||
          !status_penginapan||
          !desk_penginapan ||
          !kategori_penginapan ||
          !kelas_penginapan ||
          !harga_terendah_penginapan ||
          !latitude ||
          !longitude ||
          !kontak_person_penginapan
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan penginapan" });
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

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}` : null;
        const uploadedFile2 = req.files['foto_ruang'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}` : null;
        const uploadedFile3 = req.files['foto_ruang_dua'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}` : null;
        const uploadedFile4 = req.files['foto_ruang_tiga'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}` : null;
        const uploadedFile5 = req.files['foto_ruang_empat'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}` : null;
        const uploadedFile6 = req.files['foto_ruang_lima'] ? `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}` : null;


        add_data = await tbl_Penginapan.create({
            id_desaWisata: id_desaWisata,
            id_admin: id_admin,
            id_admin_pengelola: id_admin_pengelola,
            nama_penginapan: nama_penginapan,
            nib_penginapan: nib_penginapan,
            kbli_penginapan: kbli_penginapan,
            alamat_penginapan: alamat_penginapan,
            npwp_penginapan: npwp_penginapan,
            npwp_pemilik_penginapan: npwp_pemilik_penginapan,
            desk_penginapan: desk_penginapan,
            sampul_penginapan: uploadedFile1,
            ruang_penginapan: uploadedFile2,
            ruang_penginapan_dua: uploadedFile3,
            ruang_penginapan_tiga: uploadedFile4,
            ruang_penginapan_empat: uploadedFile5,
            ruang_penginapan_lima: uploadedFile6,
            harga_terendah_penginapan: harga_terendah_penginapan,
            kategori_penginapan: kategori_penginapan,
            kelas_penginapan: kelas_penginapan,
            kontak_person_penginapan: kontak_person_penginapan,
            status_penginapan: status_penginapan,
            total_pengunjung_penginapan: 0,
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
          message: "Penginapan gagal ditambahkan",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Penginapan berhasil ditambahkan",
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

const update_data_penginapan_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
    { name: 'foto_ruang', maxCount: 1 }, 
    { name: 'foto_ruang_dua', maxCount: 1 }, 
    { name: 'foto_ruang_tiga', maxCount: 1 }, 
    { name: 'foto_ruang_empat', maxCount: 1 }, 
    { name: 'foto_ruang_lima', maxCount: 1 }
  
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


      const { id_penginapan } = req.params;

      if (!id_penginapan) {
        return res.status(400).send({ error: "id_penginapan is required" });
      }

      const penginapan_update = await tbl_Penginapan.findOne({
        where: {
            id_penginapan
        },
      });

      if (!penginapan_update) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: 'Penginapan tidak terdaftar'
        });
      }

      const {
        id_desaWisata,
        id_admin_pengelola,
        nama_penginapan,
        nib_penginapan,
        kbli_penginapan,
        alamat_penginapan,
        status_penginapan,
        npwp_pemilik_penginapan,
        npwp_penginapan,
        desk_penginapan,
        kategori_penginapan,
        kelas_penginapan,
        harga_terendah_penginapan,
        kontak_person_penginapan,
        latitude,
        longitude,
      } = req.body;

      let update_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas" || user_admin.role === "admin industri") {

        if (
          !id_desaWisata ||
          !id_admin_pengelola ||
          !nama_penginapan ||
          !alamat_penginapan ||
          !status_penginapan||
          !desk_penginapan ||
          !kategori_penginapan ||
          !kelas_penginapan ||
          !harga_terendah_penginapan ||
          !latitude ||
          !longitude ||
          !kontak_person_penginapan
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update penginapan", req_body: req.body });
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

        let uploadedFile1 = penginapan_update.sampul_penginapan
        let uploadedFile2 = penginapan_update.ruang_penginapan
        let uploadedFile3 = penginapan_update.ruang_penginapan_dua
        let uploadedFile4 = penginapan_update.ruang_penginapan_tiga
        let uploadedFile5 = penginapan_update.ruang_penginapan_empat
        let uploadedFile6 = penginapan_update.ruang_penginapan_lima

        if (req.files) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}`;
          }

          if (req.files['foto_ruang']) {
            const name_file = uploadedFile2.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}`;
          }

          if (req.files['foto_ruang_dua']) {
            const name_file = uploadedFile3.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile3 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}`;
          }

          if (req.files['foto_ruang_tiga']) {
            const name_file = uploadedFile4.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile4 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}`;
          }

          if (req.files['foto_ruang_empat']) {
            const name_file = uploadedFile5.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile5 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}`;
          }
          if (req.files['foto_ruang_lima']) {
            const name_file = uploadedFile6.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile6 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}`;
          }
        }

        update_data = await penginapan_update.update({
          id_desaWisata: id_desaWisata,
          id_admin_pengelola: id_admin_pengelola,
          nama_penginapan: nama_penginapan,
          nib_penginapan: nib_penginapan,
          kbli_penginapan: kbli_penginapan,
          alamat_penginapan: alamat_penginapan,
          npwp_penginapan: npwp_penginapan,
          npwp_pemilik_penginapan: npwp_pemilik_penginapan,
          desk_penginapan: desk_penginapan,
          sampul_penginapan: uploadedFile1,
          ruang_penginapan: uploadedFile2,
          ruang_penginapan_dua: uploadedFile3,
          ruang_penginapan_tiga: uploadedFile4,
          ruang_penginapan_empat: uploadedFile5,
          ruang_penginapan_lima: uploadedFile6,
          harga_terendah_penginapan: harga_terendah_penginapan,
          kategori_penginapan: kategori_penginapan,
          kelas_penginapan: kelas_penginapan,
          kontak_person_penginapan: kontak_person_penginapan,
          latitude : latitude,
          longitude: longitude,
          status_penginapan: status_penginapan,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

      } else {

        if (
            !nama_penginapan ||
            !alamat_penginapan ||
            !status_penginapan||
            !desk_penginapan ||
            !kategori_penginapan ||
            !kelas_penginapan ||
            !harga_terendah_penginapan ||
            !latitude ||
            !longitude ||
            !kontak_person_penginapan
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update paket wisata", req_body: req.body });
        }

        let uploadedFile1 = penginapan_update.sampul_penginapan
        let uploadedFile2 = penginapan_update.ruang_penginapan
        let uploadedFile3 = penginapan_update.ruang_penginapan_dua
        let uploadedFile4 = penginapan_update.ruang_penginapan_tiga
        let uploadedFile5 = penginapan_update.ruang_penginapan_empat
        let uploadedFile6 = penginapan_update.ruang_penginapan_lima

        if (req.file) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_depan'][0].filename}`;
          }

          if (req.files['foto_ruang']) {
            const name_file = uploadedFile2.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile2 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang'][0].filename}`;
          }

          if (req.files['foto_ruang_dua']) {
            const name_file = uploadedFile3.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile3 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_dua'][0].filename}`;
          }

          if (req.files['foto_ruang_tiga']) {
            const name_file = uploadedFile4.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile4 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_tiga'][0].filename}`;
          }

          if (req.files['foto_ruang_empat']) {
            const name_file = uploadedFile5.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile5 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_empat'][0].filename}`;
          }

          if (req.files['foto_ruang_lima']) {
            const name_file = uploadedFile6.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile6 = `${req.protocol}://${req.get("host")}/uploads/img/penginapan/${req.files['foto_ruang_lima'][0].filename}`;
          }
        }

        update_data = await penginapan_update.update({
          id_admin_pengelola: id_admin_login,
          nama_penginapan: nama_penginapan,
          nib_penginapan: nib_penginapan,
          kbli_penginapan: kbli_penginapan,
          alamat_penginapan: alamat_penginapan,
          npwp_penginapan: npwp_penginapan,
          npwp_pemilik_penginapan: npwp_pemilik_penginapan,
          desk_penginapan: desk_penginapan,
          sampul_penginapan: uploadedFile1,
          ruang_penginapan: uploadedFile2,
          ruang_penginapan_dua: uploadedFile3,
          ruang_penginapan_tiga: uploadedFile4,
          ruang_penginapan_empat: uploadedFile5,
          ruang_penginapan_lima: uploadedFile6,
            harga_terendah_penginapan: harga_terendah_penginapan,
            kategori_penginapan: kategori_penginapan,
            kelas_penginapan: kelas_penginapan,
            kontak_person_penginapan: kontak_person_penginapan,
            latitude : latitude,
            longitude: longitude,
            status_penginapan: status_penginapan,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

      }

      if (!update_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "Penginapan gagal diubah",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Penginapan berhasil diubah",
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

const put_verifikasi_penginapan = async (req, res) => {
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


    const { id_penginapan } = req.params;

    if (!id_penginapan) {
      return res.status(400).send({ error: "id_penginapan is required" });
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

    const penginapan_update = await tbl_Penginapan.findOne({
      where: {
        id_penginapan
      },
    });

    if (!penginapan_update) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Penginapan tidak terdaftar'
      });
    }


    const update_data = await penginapan_update.update({
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
      message: "Data Penginapan berhasil diverifikasi",
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

const delete_data_penginapan_byAdmin = async (req, res) => {
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


    const { id_penginapan } = req.params;

    if (!id_penginapan) {
      return res.status(400).send({ error: "id_penginapan is required" });
    }

    const penginapan_data_delete = await tbl_Penginapan.findOne({
      where: {
        id_penginapan
      },
    });

    if (!penginapan_data_delete) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Penginapan tidak terdaftar'
      });
    }

    let url_sampul = penginapan_data_delete.sampul_penginapan;
    let url_ruang = penginapan_data_delete.ruang_penginapan;
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

    const delete_desawisata = await penginapan_data_delete.destroy();

    if (!delete_desawisata) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Penginapan gagal dihapus",
      });
    }

    return res.status(200).json({
      status: 'success',
      success: true,
      message: "Penginapan berhasil dihapus",
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

const add_fasilitas_byAdmin = async (req, res) => {
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

    const {
      id_penginapan,
      valueFasilitas = [],
    } = req.body;

    if (
      !id_penginapan ||
      valueFasilitas.length === 0
    ) {
      return res.status(422).json({ status: 'error', message: "Lengkapi data inputan fasilitas wisata" });
    }

    const fasilitas_update = await tbl_fasilitas_utama_penginapan.findAndCountAll({
      where: {
        id_penginapan: id_penginapan
      },
    });

    if (fasilitas_update.count !== 0) {
      for (const fasilitas of fasilitas_update.rows) {
        await fasilitas.destroy();
      }
    }

    let add_data = []

    for (let row of valueFasilitas) {
      add_data = await tbl_fasilitas_utama_penginapan.create({
        id_penginapan: id_penginapan,
        value_fasilitas_penginapan: row,
        fasilitas: row === 1 ? "Air Conditioner" : row === 2 ? "Restoran" : row === 3 ? "Wifi" : row === 4 ? "Lift" : row === 5 ? "Gym" : row === 6 ? "Parkiran" : row === 7 ? "Kolam Renang" : "Resepionis 24 Jam",
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

    const penginapan_update = await tbl_Penginapan.findOne({
      where: {
        id_penginapan
      },
    });

    const update_data = await penginapan_update.update({
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


module.exports = {
  get_all_penginapan,
  get_detail_penginapan,
  get_all_penginapan_ByDesawisata,
  get_all_kamar_ByPenginapan,
  get_all_homestay_ByPenginapan,

  add_ulasan_penginapan,
  get_ulasan_penginapan,

  //admin
  get_all_penginapan_byAdmin,
  get_detail_penginapan_byAdmin,
  add_data_penginapan_byAdmin,
  update_data_penginapan_byAdmin,
  put_verifikasi_penginapan,
  delete_data_penginapan_byAdmin,
  add_fasilitas_byAdmin,

  //admin kamar
  get_all_kamar_byAdmin,
  add_data_kamar_byAdmin,
  update_data_kamar_byAdmin,
  put_verifikasi_kamar,
  delete_data_kamar_byAdmin,
  get_detail_kamar_byAdmin,

  //admin homestay
  get_all_homestay_byAdmin,
  add_fasilitas_homestay_byAdmin,
  add_data_homestay_byAdmin,
  update_data_homestay_byAdmin,
  put_verifikasi_homestay,
  delete_data_homestay_byAdmin,
  get_detail_homestay_byAdmin,
};