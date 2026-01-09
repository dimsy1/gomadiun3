const db = require('../models');
const tbl_menu = db.tbl_menu;
const tbl_kuliner = db.tbl_kuliner;
const tbl_wisatawan = db.tbl_wisatawan;
const tbl_admin = db.tbl_admin;
const tbl_kategori_menu = db.tbl_kategori_menu;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const moment = require('moment-timezone');
const path = require('path');
const Sequelize = require('sequelize');
const fs = require('fs');
const { Op, fn, col } = require('sequelize');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "./uploads/img/menu"; // Default folder untuk penginapan
    
    // Jika req.body.gallery diisi, simpan gambar di folder gallery
    if (req.body.isGallery) {
      dest = "./uploads/img/menu/gallery";
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


const get_all_menu_byKuliner = async (req, res) => {
  try {
    const { id_kuliner } = req.params;

    if (!id_kuliner) {
      return res.status(400).send({ error: "id_kuliner is required" });
    }

    const whereClause = {
      [Op.and]: [
        { id_kuliner },
        { status_tersedia: 'tersedia' },
      ]
    };

    // Ambil data menu
    const data = await tbl_menu.findAndCountAll({
      where: whereClause,
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    // Ambil kategori menu untuk setiap menu
    const results = await Promise.all(data.rows.map(async (menu) => {
      const kategori = await tbl_kategori_menu.findOne({
        where: {
          id_kategori_menu: menu.id_kategori_menu, // Mengambil berdasarkan id_kategori_menu
        },
        attributes: ['nama_kategori_menu']
      });

      return {
        id: menu.id_menu,
        id_kategori: menu.id_kategori_menu,
        nama: menu.nama_menu,
        harga: menu.harga_menu,
        img: menu.sampul_menu,
        status: menu.status_tersedia,
        nama_kategori_menu: kategori ? kategori.nama_kategori_menu : null // Mengambil nama_kategori_menu jika ada
      };
    }));

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: results,
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

const get_all_menu_byAdmin = async (req, res) => {
  try {

    let id_admin;

    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ message: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_admin = decoded.id;


    const user_admin = await tbl_admin.findOne({
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
            { nama_menu: { [Op.like]: `%${keyword}%` } },
            { status_tersedia: { [Op.like]: `%${keyword}%` } },
            { kategori_menu: { [Op.like]: `%${keyword}%` } },
            { harga_menu: { [Op.like]: `%${keyword}%` } },
          ]
        } : {}
      ]
    }

    const orderClause = [
      ['id_menu', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
    ];

    const data = await tbl_menu.findAndCountAll({
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

    const results = await Promise.all(data.rows.map(async (menu) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_pengelola = [];
      let detail_kuliner = [];
      let detail_kategori_menu = [];

      detail_author = await tbl_admin.findOne({
        where: { id_admin: menu.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_admin.findOne({
        where: { id_admin: menu.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin_pengelola = await tbl_admin.findOne({
        where: { id_admin: menu.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_kuliner = await tbl_kuliner.findOne({
        where: { id_kuliner: menu.id_kuliner },
        attributes: [
          "id_kuliner",
          "nama_kuliner"
        ]
      });

      detail_kategori_menu = await tbl_kategori_menu.findOne({
        where: {
          id_menu: menu.id_menu,
        },
        attributes: ['id_kuliner', 'nama_kategori_menu']
      });


      return {
        id_menu: menu.id_menu,
        detail_admin,
        detail_author,
        detail_kuliner,
        detail_kategori_menu,
        detail_admin_pengelola,
        nama_menu: menu.nama_menu,
        harga_menu: menu.harga_menu,
        status_tersedia: menu.status_tersedia,
        sampul_menu: menu.sampul_menu,
        updatedAt: menu.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Menu",
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

const get_detail_menu_byAdmin = async (req, res) => {
  try {

    let id_admin;

    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ message: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_admin = decoded.id;


    const user_admin = await tbl_admin.findOne({
      attributes: ['role'],
      where: {
        id_admin
      }
    });

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin industri" && user_admin.role !== "user industri") {
      return res.status(401).json({ message: "Hak akses ditolak" });
    }

    const { id_menu } = req.params;

    if (!id_menu) {
      return res.status(422).send({ error: "id_menu is required" });
    }

    const data = await tbl_menu.findAndCountAll({
      where: {
        id_menu,
      },
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
      });
    }

    const results = await Promise.all(data.rows.map(async (menu) => {
      let detail_author = [];
      let detail_admin = [];
      let detail_admin_pengelola = [];
      let detail_kuliner = [];
      let detail_kategori_menu = [];

      detail_author = await tbl_admin.findOne({
        where: { id_admin: menu.id_admin_author },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_admin = await tbl_admin.findOne({
        where: { id_admin: menu.id_admin },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });


      detail_admin_pengelola = await tbl_admin.findOne({
        where: { id_admin: menu.id_admin_pengelola },
        attributes: [
          "id_admin",
          "nama_admin",
          "role",
          "namaLengkap_admin",
          "sampul_admin"
        ]
      });

      detail_kuliner = await tbl_kuliner.findOne({
        where: { id_kuliner: menu.id_kuliner },
        attributes: [
          "id_kuliner",
          "nama_kuliner"
        ]
      });

      detail_kategori_menu = await tbl_kategori_menu.findOne({
        where: {
          id_menu,
        },
        attributes: ['id_kuliner', 'nama_kategori_menu']
      });


      return {
      id_menu: menu.id_menu,
      detail_admin,
      detail_author,
      detail_admin_pengelola,
      detail_kuliner,
      detail_kategori_menu,
      id: menu.id_menu,
      nama_menu: menu.nama_menu,
      sampul_menu: menu.sampul_menu,
      harga_menu: menu.harga_menu,
      status_tersedia: menu.status_tersedia,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt
      };
    }));

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Menu",
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

const add_data_menu_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
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

      const user_admin = await tbl_admin.findOne({
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
        id_kuliner,
        id_admin_pengelola,
        nama_menu,
        harga_menu,
        status_tersedia,
        nama_kategori_menu
      } = req.body;

      let add_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas") {

        if (
          !id_admin ||
          !id_kuliner ||
          !id_admin_pengelola ||
          !nama_menu ||
          !harga_menu ||
          !status_tersedia ||
          !nama_kategori_menu
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan menu" });
        }

        const cek_admin = await tbl_admin.findAndCountAll({
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

        const cek_kuliner = await tbl_kuliner.findAndCountAll({
          where: {
            id_kuliner: id_kuliner
          },
        });

        if (cek_kuliner.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Tempat Kuliner tidak terdaftar",
          });
        }

        const cek_admin_pengelola = await tbl_admin.findAndCountAll({
          where: {
            id_admin: id_admin_pengelola
          },
        });

        if (cek_admin_pengelola.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "User Industri tidak terdaftar",
          });
        }

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/menu/${req.files['foto_depan'][0].filename}` : null;

        const kategoriMenu = await tbl_kategori_menu.create({
          id_admin: id_admin,
          id_menu: null,  // Akan diisi nanti
          nama_kategori_menu: nama_kategori_menu,
          id_kuliner: id_kuliner,
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

        add_data = await tbl_menu.create({
          id_kuliner: id_kuliner,
          id_admin: id_admin,
          id_admin_pengelola: id_admin_pengelola,
          nama_menu: nama_menu,
          harga_menu: harga_menu,
          status_tersedia: status_tersedia,
          sampul_menu: uploadedFile1,
          id_admin_author: id_admin_login,
          id_kategori_menu: kategoriMenu.id_kategori_menu, // Masukkan id_kategori_menu yang baru saja dibuat
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

        kategoriMenu.id_menu = add_data.id_menu;
        await kategoriMenu.save();
        
      } else {
        // Proses jika role bukan admin
        if (
          !id_admin ||
          !id_kuliner ||
          !id_admin_pengelola ||
          !nama_menu ||
          !harga_menu ||
          !status_tersedia
        ) {
          return res.status(422).json({ status: 'error', message: "Lengkapi data inputan Menu" });
        }

        // Cek penginapan dan admin pengelola
        const cek_kuliner = await tbl_kuliner.findAndCountAll({
          where: {
            id_kuliner: id_kuliner
          },
        });

        if (cek_kuliner.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "Tempat Kuliner tidak terdaftar",
          });
        }

        const cek_admin_pengelola = await tbl_admin.findAndCountAll({
          where: {
            id_admin: id_admin_pengelola
          },
        });

        if (cek_admin_pengelola.count === 0) {
          return res.status(422).json({
            status: 'error',
            success: false,
            message: "User Industri tidak terdaftar",
          });
        }

        const uploadedFile1 = req.files['foto_depan'] ? `${req.protocol}://${req.get("host")}/uploads/img/menu/${req.files['foto_depan'][0].filename}` : null;

        const kategoriMenu = await tbl_kategori_menu.create({
          id_admin: id_admin,
          id_menu: null,
          nama_kategori_menu: nama_kategori_menu,
          id_kuliner: id_kuliner,
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

        add_data = await tbl_menu.create({
          id_kuliner: id_kuliner,
          id_admin: id_admin,
          id_admin_pengelola: id_admin_pengelola,
          nama_menu: nama_menu,
          harga_menu: harga_menu,
          status_tersedia: status_tersedia,
          sampul_menu: uploadedFile1,
          id_admin_author: id_admin_login,
          id_kategori_menu: kategoriMenu.id_kategori_menu,
          createdAt: currentDateTime,
          updatedAt: currentDateTime
        });

        kategoriMenu.id_menu = add_data.id_menu;
        await kategoriMenu.save();
      }


      if (!add_data) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: "Menu gagal ditambahkan",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Menu berhasil ditambahkan",
        data: {
          ...add_data.toJSON(),
          nama_kategori_menu: nama_kategori_menu
        }
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

const update_data_menu_byAdmin = async (req, res) => {
  upload.fields([
    { name: 'foto_depan', maxCount: 1 }, 
  
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

      const user_admin = await tbl_admin.findOne({
        attributes: ['role'],
        where: { id_admin: id_admin_login }
      });

      if (!["admin", "dinas", "admin industri", "user industri"].includes(user_admin.role)) {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }

      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
      const { id_menu } = req.params;

      if (!id_menu) {
        return res.status(400).send({ error: "id_menu is required" });
      }

      const menu_update = await tbl_menu.findOne({ where: { id_menu } });
      if (!menu_update) {
        return res.status(422).json({ status: 'error', success: false, message: 'Menu tidak terdaftar' });
      }
      if (!menu_update) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: 'Menu tidak terdaftar'
        });
      }
      

      const {
        id_kuliner,
        id_admin_pengelola,
        nama_menu,
        harga_menu,
        status_tersedia,
        nama_kategori_menu
      } = req.body;

      let update_data = [];

      if (user_admin.role === "admin" || user_admin.role === "dinas" || user_admin.role === "admin industri") {

      if (
        !id_kuliner ||
        !id_admin_pengelola ||
        !nama_menu ||
        !harga_menu ||
        !status_tersedia ||
        !nama_kategori_menu
      ) {
        return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update menu", req_body: req.body });
      }

        const cek_admin_pengelola = await tbl_admin.findAndCountAll({
          where: { id_admin: id_admin_pengelola },
        });

        if (cek_admin_pengelola.count === 0) {
          return res.status(422).json({ status: 'error', success: false, message: "User industri tidak terdaftar" });
        }

        let uploadedFile1 = menu_update.sampul_menu

        if (req.files) {
          if (req.files['foto_depan']) {
            const name_file = uploadedFile1.split('/uploads/')[1];
            const oldFilePath = `./uploads/${name_file}`;

            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              }
            });

            uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/menu/${req.files['foto_depan'][0].filename}`;
          }
        }

        update_data = await menu_update.update({
          id_kuliner: id_kuliner,
          id_admin_pengelola: id_admin_pengelola,
          nama_menu: nama_menu,
          harga_menu: harga_menu,
          status_tersedia: status_tersedia,
          sampul_menu: uploadedFile1,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

        // Update nama_kategori_menu di tbl_kategori_menu yang sudah ada
      await tbl_kategori_menu.update(
        { nama_kategori_menu },
        { where: { id_kategori_menu: menu_update.id_kategori_menu } }
      );

      } else {

      if (
        !id_kuliner ||
        !id_admin_pengelola ||
        !nama_menu ||
        !harga_menu ||
        !status_tersedia ||
        !nama_kategori_menu
      ) {
        return res.status(422).json({ status: 'error', message: "Lengkapi data inputan update menu", req_body: req.body });
      }

      let uploadedFile1 = menu_update.sampul_menu

      if (req.file) {
        if (req.files['foto_depan']) {
          const name_file = uploadedFile1.split('/uploads/')[1];
          const oldFilePath = `./uploads/${name_file}`;

          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            }
          });

          uploadedFile1 = `${req.protocol}://${req.get("host")}/uploads/img/menu/${req.files['foto_depan'][0].filename}`;
        }
      }

        update_data = await menu_update.update({
          id_kuliner: id_kuliner,
          id_admin_pengelola: id_admin_pengelola,
          nama_menu: nama_menu,
          harga_menu: harga_menu,
          status_tersedia: status_tersedia,
          sampul_menu: uploadedFile1,
          id_admin_author: id_admin_login,
          updatedAt: currentDateTime
        });

         // Update nama_kategori_menu di tbl_kategori_menu yang sudah ada
      await tbl_kategori_menu.update(
        { nama_kategori_menu },
        { where: { id_kategori_menu: menu_update.id_kategori_menu } }
      );
    }

       // Ambil nama_kategori_menu yang baru diperbarui
       const updated_kategori = await tbl_kategori_menu.findOne({
        where: { id_kategori_menu: menu_update.id_kategori_menu },
        attributes: ['nama_kategori_menu']
      });

      return res.status(200).json({
        status: 'success',
        message: "Data menu berhasil diperbarui",
        data: {
          ...menu_update.toJSON(),
          nama_kategori_menu: updated_kategori.nama_kategori_menu
        }
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

const delete_data_menu_byAdmin = async (req, res) => {
  try {
    let id_admin_login;

    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_admin_login = decoded.id;

    const user_admin = await tbl_admin.findOne({
      attributes: ['role'],
      where: {
        id_admin: id_admin_login
      }
    });

    if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin industri") {
      return res.status(422).json({ message: "Anda tidak dapat menghapus data" });
    }

    const { id_menu } = req.params;

    if (!id_menu) {
      return res.status(400).send({ error: "id_menu is required" });
    }

    const menu_data_delete = await tbl_menu.findOne({
      where: {
        id_menu
      },
    });

    if (!menu_data_delete) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: 'Menu tidak terdaftar'
      });
    }

    // Hapus data terkait di tbl_kategori_menu berdasarkan id_menu
    await tbl_kategori_menu.destroy({
      where: {
        id_menu
      }
    });

    // Hapus data di tbl_menu
    const delete_menu = await menu_data_delete.destroy();

    if (!delete_menu) {
      return res.status(422).json({
        status: 'error',
        success: false,
        message: "Menu gagal dihapus",
      });
    }

    return res.status(200).json({
      status: 'success',
      success: true,
      message: "Menu berhasil dihapus, beserta kategori yang terkait",
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
  get_all_menu_byKuliner,
  get_all_menu_byAdmin,
  get_detail_menu_byAdmin,
  add_data_menu_byAdmin,
  update_data_menu_byAdmin,
  delete_data_menu_byAdmin
};