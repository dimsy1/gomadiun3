//DITANYAKAN

const db = require('../models');
const tbl_DesaWisata = db.tbl_DesaWisata;
const tbl_Paket_wisata = db.tbl_Paket_wisata;
const tbl_Wisata = db.tbl_Wisata;
const tbl_Kuliner = db.tbl_Kuliner;
const tbl_Menu = db.tbl_Menu;
const tbl_Kamar = db.tbl_Kamar;
const tbl_Penginapan = db.tbl_Penginapan;
const tbl_Paket_homestay = db.tbl_Paket_homestay
const tbl_announcement = db.tbl_announcement;
const tbl_Admin = db.tbl_Admin;
const jwt = require('jsonwebtoken');
const { Op, fn, col } = require('sequelize');
const multer = require('multer');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const tbl_paket_homestay = require('../models/tbl_paket_homestay');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = "./uploads/img/banerInfo"; // All image files will be stored in the "uploads/img" directory
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


const get_all_event = async (req, res) => {
    try {
        const {
            order = 'DESC'
        } = req.query;

        const orderClause = [
            ['id_announcements', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
        ];


        const data = await tbl_announcement.findAndCountAll({
            order: orderClause
        });

        if (data.count === 0) {
            return res.status(422).json({
                success: false,
                message: "Data Tidak Ditemukan",
                data: null,
            });
        }


        const results = await Promise.all(data.rows.map(async (items) => {

            return {
                id: items.id_announcements,
                judul_event: items.judul_event,
                url_poster: items.url_poster,
                name_poster: items.name_poster,
                desk_event: items.desk_event,
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

const get_all_event_ByAdmin = async (req, res) => {
    try {
        
        let id_admin_login;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
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

        const {
            order = 'DESC'
        } = req.query;

        const orderClause = [
            ['id_announcements', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
        ];


        const data = await tbl_announcement.findAndCountAll({
            order: orderClause
        });

        if (data.count === 0) {
            return res.status(422).json({
                success: false,
                message: "Data Tidak Ditemukan",
                data: null,
            });
        }


        const results = await Promise.all(data.rows.map(async (items) => {

            return {
                id: items.id_announcements,
                judul_event: items.judul_event,
                url_poster: items.url_poster,
                name_poster: items.name_poster,
                desk_event: items.desk_event,
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

const get_detail_event = async (req, res) => {
    try {
        const { id_announcements } = req.params;

        if (!id_announcements) {
            return res.status(400).send({ error: "id_announcements is required" });
        }

        const data = await tbl_announcement.findAndCountAll({
            where: {
                id_announcements: id_announcements
            }
        });

        if (data.count === 0) {
            return res.status(422).json({
                success: false,
                message: "Data Tidak Ditemukan",
                data: null,
            });
        }

        const results = await Promise.all(data.rows.map(async (items) => {

            return {
                id: items.id_announcements,
                judul_event: items.judul_event,
                url_poster: items.url_poster,
                name_poster: items.name_poster,
                desk_event: items.desk_event,
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

const post_event_ByAdmin = async (req, res) => {
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

            const { judul, deskripsi } = req.body;

            const uploadedFile_url = req.file.filename ? `${req.protocol}://${req.get("host")}/uploads/img/banerInfo/${req.file.filename}` : null;
            const uploadedFile = req.file ? req.file.filename : null;

            const data = await tbl_announcement.create({
                judul_event: judul,
                url_poster: uploadedFile_url,
                name_poster: uploadedFile,
                desk_event: deskripsi,
                createdAt: currentDateTime,
                updatedAt: currentDateTime
            });

            return res.status(200).json({
                status: 'success',
                success: true,
                message: "Event berhasil ditambahkan",
                data: data
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
    });
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
  
      if (user_admin.role !== "admin" && user_admin.role !== "dinas") {
        return res.status(401).json({ message: "Hak akses ditolak" });
      }
  
      const { id_announcements } = req.params;

      if (!id_announcements) {
          return res.status(400).send({ error: "id_announcements is required" });
      }
  
      const desawisata_data_delete = await tbl_announcement.findOne({
        where: {
            id_announcements: id_announcements
        }
      });
  
      if (!desawisata_data_delete) {
        return res.status(422).json({
          status: 'error',
          success: false,
          message: 'Desa Wisata tidak terdaftar'
        });
      }
  
      let url_sampul = desawisata_data_delete.url_poster;
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
          message: "Data event gagal dihapus",
        });
      }
  
      return res.status(200).json({
        status: 'success',
        success: true,
        message: "Data event berhasil dihapus",
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

const get_all_dashboard = async (req, res) => {
    try {

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const whereClause = {
            [Op.and]: [
                { status_verifikasi: "verified" },
            ]
        }


        const desawisata = await tbl_DesaWisata.findAndCountAll({
            where: whereClause,
        });

        if (desawisata.count === 0) {
            return res.status(401).json({
                success: false,
                message: "Data Tidak Ditemukan",
                data: null,
            });
        }

        const desawisata_terbanyak = await tbl_DesaWisata.findOne({
            where: whereClause,
            order: [[fn('MAX', col('total_pengunjung')), 'DESC']],
        });

        const wisata = await tbl_Wisata.findAndCountAll({
            where: whereClause,
        });

        if (wisata.count === 0) {
            return res.status(401).json({
                success: false,
                message: "Data Tidak Ditemukan",
                data: null,
            });
        }

        const wisata_terbanyak = await tbl_Wisata.findOne({
            where: whereClause,
            order: [[fn('MAX', col('total_pengunjung_destinasi')), 'DESC']],
        });

        const paket_wisata = await tbl_Paket_wisata.findAndCountAll({
            where: whereClause,
        });

        if (paket_wisata.count === 0) {
            return res.status(401).json({
                success: false,
                message: "Data Tidak Ditemukan",
                data: null,
            });
        }

        const paket_wisata_terbanyak = await tbl_Paket_wisata.findOne({
            where: whereClause,
            order: [[fn('MAX', col('total_pengunjung_paket_wisata')), 'DESC']],
        });
        
        const penginapan = await tbl_Penginapan.findAndCountAll({
            where: whereClause,
        });

        if (penginapan.count === 0) {
            return res.status(401).json({
                success: false,
                message: "Data Tidak Ditemukan",
                data: null,
            });
        }

        const penginapan_terbanyak = await tbl_Penginapan.findOne({
            where: whereClause,
            order: [[fn('MAX', col('total_pengunjung_penginapan')), 'DESC']],
        });


        const kuliner = await tbl_Kuliner.findAndCountAll({
            where: whereClause,
        });

        if (kuliner.count === 0) {
            return res.status(401).json({
                success: false,
                message: "Data Tidak Ditemukan",
                data: null,
            });
        }

        const kuliner_terbanyak = await tbl_Kuliner.findOne({
            where: whereClause,
            order: [[fn('MAX', col('total_pengunjung_kuliner')), 'DESC']],
        });


        const result = {
            data_desawisata: desawisata.rows.map((items) => ({
                nama_desaWisata: items.nama_desaWisata,
                total_pengunjung: items.total_pengunjung,
            })),
            data_wisata: wisata.rows.map((items) => ({
                nama_destinasi: items.nama_destinasi,
                total_pengunjung_destinasi: items.total_pengunjung_destinasi,
            })),
            data_paket_wisata: penginapan.rows.map((items) => ({
                nama_paket_wisata: items.nama_paket_wisata,
                total_pengunjung_paket_wisata: items.total_pengunjung_paket_wisata,
            })),
            data_penginapan: penginapan.rows.map((items) => ({
                nama_penginapan: items.nama_penginapan,
                total_pengunjung_penginapan: items.total_pengunjung_penginapan,
            })),
            data_kuliner: kuliner.rows.map((items) => ({
                nama_kuliner: items.nama_kuliner,
                total_pengunjung_kuliner: items.total_pengunjung_kuliner,
            })),


            data_desawisata_terbanyak: desawisata_terbanyak.total_pengunjung,
            data_wisata_terbanyak: wisata_terbanyak.total_pengunjung_destinasi,
            data_paket_wisata_terbanyak: paket_wisata_terbanyak.total_pengunjung_paket_wisata,
            data_penginapan_terbanyak: penginapan_terbanyak.total_pengunjung_penginapan,
            data_kuliner_terbanyak: kuliner_terbanyak.total_pengunjung_kuliner,

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

const get_all_availability = async (req, res) => {
    try {
        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id_admin_login = decoded.id; // ID admin yang login

        // Memeriksa apakah user industri
        const user_admin = await tbl_Admin.findOne({
            attributes: ['role'],
            where: {
                id_admin: id_admin_login
            }
        });

        if (user_admin.role !== "user industri") {
            return res.status(401).json({ message: "Hak akses ditolak. Anda bukan user industri." });
        }

        // Mendapatkan data berdasarkan id_admin_pengelola untuk setiap kategori
        const penginapan = await tbl_Penginapan.findAndCountAll({
            where: {
                id_admin_pengelola: id_admin_login, // filter berdasarkan admin pengelola
            },
        });

        const kamarHotel = await tbl_Kamar.findAndCountAll({
            where: {
                id_admin_pengelola: id_admin_login, // filter berdasarkan admin pengelola
            },
        });

        const kamarHomestay = await tbl_Paket_homestay.findAndCountAll({
            where: {
                id_admin_pengelola: id_admin_login, // filter berdasarkan admin pengelola
            },
        });

        const kuliner = await tbl_Kuliner.findAndCountAll({
            where: {
                id_admin_pengelola: id_admin_login, // filter berdasarkan admin pengelola
            },
        });

        const menuKuliner = await tbl_Menu.findAndCountAll({
            where: {
                id_admin_pengelola: id_admin_login, // filter berdasarkan admin pengelola
            },
        });

        const dataAvailability = {
            penginapan: penginapan.count > 0,
            kamarHotel: kamarHotel.count > 0,
            kamarHomestay: kamarHomestay.count > 0,
            kuliner: kuliner.count > 0,
            menuKuliner: menuKuliner.count > 0,
        };

        return res.status(200).json(dataAvailability);
    } catch (error) {
        console.log(error, 'Data Error');
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null,
        });
    }
};




module.exports = {
    get_all_event,
    get_all_event_ByAdmin,
    get_detail_event,
    post_event_ByAdmin,
    delete_data_desawisata_byAdmin,
    get_all_dashboard,
    get_all_availability
};