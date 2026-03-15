const db = require('../models');
const tbl_DesaWisata = db.tbl_DesaWisata;
const tbl_Paket_wisata = db.tbl_Paket_wisata;
const tbl_Wisata = db.tbl_Wisata;
const tbl_Kuliner = db.tbl_Kuliner;
const tbl_Menu = db.tbl_Menu;
const tbl_Kamar = db.tbl_Kamar;
const tbl_penginapan = db.tbl_Penginapan;
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
        const dest = "./uploads/img/banerInfo"; 
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
        if (!token) return res.status(401).json({ msg: "Akun Belum Login!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id_admin_login = decoded.id;

        // 1. Ambil info role admin yang login
        const user_admin = await tbl_Admin.findOne({
            attributes: ['id_admin', 'role'],
            where: { id_admin: id_admin_login }
        });

        if (!user_admin) return res.status(404).json({ message: "Admin tidak ditemukan" });

        const buildWhereClause = () => {
            let baseFilter = "WHERE kategori = :kat";
            
            if (user_admin.role === "admin pengelola" || user_admin.role === "admin industri") {
                // Admin melihat data dimana dia adalah 'pemilik' dari transaksi tersebut
                baseFilter += " AND id_admin_pemilik = :id_login";
            } else if (user_admin.role === "user pengelola" || user_admin.role === "user industri") {
                // User melihat data dimana dia adalah 'pelaku' transaksi tersebut
                baseFilter += " AND id_admin = :id_login";
            }
            return baseFilter;
        };

        const getHistoryData = async (kat) => {
            const sql = `
                SELECT 
                    nama_destinasi AS label, 
                    COUNT(*) AS total_pengunjung
                FROM tbl_history_transaksi 
                ${buildWhereClause()}
                GROUP BY nama_destinasi
            `;

            return await db.sequelize.query(sql, { 
                replacements: { 
                    kat: kat, 
                    id_login: id_admin_login 
                }, 
                type: db.sequelize.QueryTypes.SELECT 
            });
        };

        // Ambil data dari 4 kategori utama
        const [desa, wisata, penginapan, kuliner] = await Promise.all([
            getHistoryData('desaWisata'), 
            getHistoryData('wisata'),
            getHistoryData('penginapan'),
            getHistoryData('kuliner')
        ]);

        const findMax = (data) => data.length > 0 ? Math.max(...data.map(o => o.total_pengunjung)) : 0;

        res.status(200).json({
            success: true,
            data_desawisata: desa.map(i => ({ nama_desaWisata: i.label, total_pengunjung: i.total_pengunjung })),
            data_wisata: wisata.map(i => ({ nama_destinasi: i.label, total_pengunjung_destinasi: i.total_pengunjung })),
            data_penginapan: penginapan.map(i => ({ nama_penginapan: i.label, total_pengunjung_penginapan: i.total_pengunjung })),
            data_kuliner: kuliner.map(i => ({ nama_kuliner: i.label, total_pengunjung_kuliner: i.total_pengunjung })),
            
            data_desawisata_terbanyak: findMax(desa),
            data_wisata_terbanyak: findMax(wisata),
            data_penginapan_terbanyak: findMax(penginapan),
            data_kuliner_terbanyak: findMax(kuliner),
        });

    } catch (error) {
        console.error("DASHBOARD ERROR:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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
        const penginapan = await tbl_penginapan.findAndCountAll({
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