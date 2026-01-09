const db = require('../models');
const tbl_Berita = db.tbl_Berita;
const tbl_Admin = db.tbl_Admin;
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const multer = require('multer');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const xml2js = require('xml2js');
const axios = require('axios');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "./uploads/img/berita";
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




const get_all_berita = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      keyword = '',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = keyword
      ? {
          [Op.or]: [
            { title: { [Op.like]: `%${keyword}%` } },
            { description: { [Op.like]: `%${keyword}%` } },
            { content: { [Op.like]: `%${keyword}%` } },
          ]
        }
      : {};

    const data = await tbl_Berita.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', order]]
    });

    const totalPages = Math.ceil(data.count / limit);

    if (data.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
        data: null,
        pages: {
          total: 0,
          per_page: parseInt(limit, 10),
          next_page: null,
          to: 0,
          last_page: 0,
          current_page: parseInt(page, 10),
          from: 0,
        },
      });
    }

    const result = {
      success: true,
      message: "Sukses mendapatkan data berita",
      data: data.rows.map((item) => ({
        id_berita: item.id_berita,
        title: item.title,
        description: item.description,
        content: item.content,
        sampul_berita: item.sampul_berita,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      pages: {
        total: data.count,
        per_page: parseInt(limit, 10),
        next_page: page < totalPages ? parseInt(page, 10) + 1 : null,
        to: offset + data.rows.length,
        last_page: totalPages,
        current_page: parseInt(page, 10),
        from: offset,
      },
    };

    const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const excludePagesUrl = `${req.protocol}://${req.get('host')}/api/berita/get_all`;

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error saat mengambil semua berita:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null
    });
  }
};




const get_detail_berita_byid = async (req, res) => {
  try {
    const { id_berita} = req.params;

    if (!id_berita) {
      return res.status(400).json({ success: false, message: "id_berita is required" });
    }

    const data = await tbl_Berita.findOne({
      where: { id_berita },
    });

    if (!data) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: {
        id_berita: data.id_berita,
        title: data.title,
        description: data.description,
        content: data.content,
        sampul_berita: data.sampul_berita,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
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



// Tambahkan ke controller berita
const add_berita_byAdmin = async (req, res) => {
  upload.single("sampul_berita")(req, res, async (err) => {
    if (err) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: err.message
      });
    }

    try {
      const token = req.cookies.tokenadmin;
      if (!token) return res.status(401).json({ message: "Akun Belum Login!" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id_admin_login = decoded.id;

      const user_admin = await tbl_Admin.findOne({
        attributes: ['role'],
        where: { id_admin: id_admin_login }
      });

      if (!user_admin || (user_admin.role !== "admin" && user_admin.role !== "dinas")) {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

      let { title, description, content } = req.body;

      // validasi input
      if (!title || !description || !content) {
        return res.status(422).json({ status: 'error', message: "Lengkapi data inputan berita" });
      }

      const uploadedFile = req.file && req.file.filename 
        ? `${req.protocol}://${req.get("host")}/uploads/img/berita/${req.file.filename}`
        : null;

      const add_data = await tbl_Berita.create({
        id_admin: id_admin_login,
        title,
        description,
        content,
        sampul_berita: uploadedFile,
        createdAt: currentDateTime,
        updatedAt: currentDateTime
      });

      if (!add_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "Berita gagal ditambahkan",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Berita berhasil ditambahkan",
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




const update_berita_byAdmin = async (req, res) => {
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

    upload.single('sampul_berita')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { id_berita } = req.params;
      const { title, description, content } = req.body;

      if (!title || !content) {
        return res.status(422).json({ status: 'error', message: "Title dan content wajib diisi." });
      }

      const berita = await tbl_Berita.findByPk(id_berita);

      if (!berita) {
        return res.status(404).json({ status: 'error', message: "Data berita tidak ditemukan." });
      }

      let updatedImagePath = berita.sampul_berita;

      if (req.file) {
        // Hapus gambar lama jika ada
        if (berita.sampul_berita && fs.existsSync('.' + berita.sampul_berita)) {
          fs.unlinkSync('.' + berita.sampul_berita);
        }
        updatedImagePath = `${req.protocol}://${req.get("host")}/uploads/img/berita/${req.file.filename}`;
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

      await berita.update({
        title,
        description,
        content,
        sampul_berita: updatedImagePath,
        updatedAt: currentDateTime
      });

      return res.status(200).json({
        status: "success",
        message: "Berita berhasil diperbarui",
        data: berita
      });
    });
  } catch (error) {
    console.error("Error saat mengupdate berita:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    });
  }
};

const delete_berita_byAdmin = async (req, res) => {
  try {
    const token = req.cookies.tokenadmin;
    if (!token) {
      return res.status(401).json({ message: "Akun belum login!" });
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

    const { id_berita } = req.params;

    const berita = await tbl_Berita.findByPk(id_berita);

    if (!berita) {
      return res.status(404).json({
        status: "error",
        message: "Data berita tidak ditemukan"
      });
    }

    // Hapus file gambar jika ada
    if (berita.sampul_berita) {
      const imagePath = path.join(__dirname, "../uploads/img/berita", berita.sampul_berita);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Hapus data dari database
    await berita.destroy();

    return res.status(200).json({
      status: "success",
      message: "Berita berhasil dihapus"
    });

  } catch (error) {
    console.error("Error saat menghapus berita:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal menghapus berita"
    });
  }
};





module.exports = {
    add_berita_byAdmin,
    update_berita_byAdmin,
    get_all_berita,
    get_detail_berita_byid,
    delete_berita_byAdmin
}