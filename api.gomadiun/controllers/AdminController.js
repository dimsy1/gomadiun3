const db = require("../models");
const tbl_Admin = db.tbl_Admin;
const moment = require('moment-timezone');
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = "./uploads/img/profile"; // All image files will be stored in the "uploads/img" directory
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
    limits: { fileSize: 300 * 1024 * 1024 },
});

const get_all_superAdmin = async (req, res) => {
    try {
        const {
            keyword = '',
            order = "DESC"
        } = req.query;

        let id_admin;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id_admin = decoded.id;


        const user_admin = await tbl_Admin.findOne({
            attributes: ['role'],
            where: {
                id_admin
            }
        });

        if (user_admin.role !== "admin") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }

        const orderClause = [
            ['id_admin', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
        ];

        const whereClause = {
            [Op.and]: [
                { role: "admin" },
                keyword ? {
                    [Op.or]: [
                        { nama_admin: { [Op.like]: `%${keyword}%` } },
                        { namaLengkap_admin: { [Op.like]: `%${keyword}%` } },
                        { email_admin: { [Op.like]: `%${keyword}%` } },
                    ]
                } : {}
            ]
        };

        const super_admin = await tbl_Admin.findAndCountAll({
            where: whereClause,
            order: orderClause,
            attributes: [
                "id_admin",
                "nama_admin",
                "namaLengkap_admin",
                "email_admin",
                "password_admin",
                "role",
                "sampul_admin",
                "status_akun"
            ]
        });

        if (super_admin.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Wisatawan",
            data: super_admin.rows
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

const post_Admin_superAdmin = async (req, res) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: err.message
            });
        }

        try {

            let id_admin;

            const token = req.cookies.tokenadmin;

            if (!token) {
                return res.status(401).json({ msg: "Akun Belum Login!", token });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            id_admin = decoded.id;


            const user_admin = await tbl_Admin.findOne({
                attributes: ['role'],
                where: {
                    id_admin
                }
            });

            if (user_admin.role !== "admin") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
            const { name, nama_lengkap, email, password, status_akun } = req.body;

            if (!name || !nama_lengkap || !email || !password || !status_akun) {
                return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
            }


            const super_admin = await tbl_Admin.findAndCountAll({
                where: {
                    email_admin: email
                },
            });

            if (super_admin.count !== 0) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: "Email sudah terdaftar, gunakan email lain!",
                });
            }


            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const uploadedFile = req.file ? req.file.filename : 'default.jpg';

            const data = await tbl_Admin.create({
                nama_admin: name,
                namaLengkap_admin: nama_lengkap,
                email_admin: email,
                password_admin: hashedPassword,
                role: 'admin',
                sampul_admin: uploadedFile,
                status_akun: status_akun,
                createdAt: currentDateTime,
                updatedAt: currentDateTime
            });

            return res.status(200).json({
                status: 'success',
                success: true,
                message: "Admin Berhasil ditambahkan",
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

const put_Admin_superAdmin = async (req, res) => {
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

            if (user_admin.role !== "admin") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

            const { id_admin } = req.params;

            if (!id_admin) {
                return res.status(400).send({ error: "id_admin is required" });
            }

            const { name, nama_lengkap, email, status_akun } = req.body;

            if (!name || !nama_lengkap || !email || !status_akun) {
                return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
            }

            const user_admin_update = await tbl_Admin.findOne({
                where: {
                    id_admin
                },
            });

            if (!user_admin_update) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: 'Admin tidak terdaftar'
                });
            }

           
            const cek_email_update = await tbl_Admin.findOne({
                where: {
                    [Op.and]: [
                        { id_admin: user_admin_update.id_admin },
                        { email_admin: email },
                    ]
                },
            });

            if (!cek_email_update) {

                const cek_email = await tbl_Admin.findOne({
                    where: {
                        [Op.and]: [
                            { email_admin: email },
                        ]
                    },
                });
                
                if (cek_email) {
                    return res.status(422).json({
                        status: 'error',
                        success: false,
                        message: "Email sudah terdaftar, gunakan email lain!",
                    });
                }
            }

            let uploadedFile = user_admin_update.sampul_admin;

            if (req.file) {
                if (uploadedFile !== "default.jpg") {
                    const oldFilePath = `./uploads/img/profile/${uploadedFile}`;
                    fs.unlink(oldFilePath, (err) => {
                        if (err) {
                            console.error('Error deleting old file:', err);
                        }
                    });
                }

                uploadedFile = req.file.filename;
            }

            const update_data = await user_admin_update.update({
                nama_admin: name,
                namaLengkap_admin: nama_lengkap,
                email_admin: email,
                role: 'admin',
                sampul_admin: uploadedFile,
                status_akun: status_akun,
                updatedAt: currentDateTime
            });

            if (!update_data) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: "Gagal memperbarui data!",
                });
            }

            return res.status(200).json({
                status: 'success',
                success: true,
                message: "Data admin berhasil diubah",
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
    });
};


const get_all_adminDinas = async (req, res) => {
    try {
        const {
            keyword = '',
            order = "DESC"
        } = req.query;

        let id_admin;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id_admin = decoded.id;


        const user_admin = await tbl_Admin.findOne({
            attributes: ['role'],
            where: {
                id_admin
            }
        });

        if (user_admin.role !== "admin") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }


        const orderClause = [
            ['id_admin', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
        ];

        const whereClause = {
            [Op.and]: [
                { role: "dinas" },
                keyword ? {
                    [Op.or]: [
                        { nama_admin: { [Op.like]: `%${keyword}%` } },
                        { namaLengkap_admin: { [Op.like]: `%${keyword}%` } },
                        { email_admin: { [Op.like]: `%${keyword}%` } },
                    ]
                } : {}
            ]
        };

        const super_admin = await tbl_Admin.findAndCountAll({
            where: whereClause,
            order: orderClause,
            attributes: [
                "id_admin",
                "nama_admin",
                "namaLengkap_admin",
                "nip_admin",
                "email_admin",
                "password_admin",
                "role",
                "sampul_admin",
                "status_akun"
            ]
        });

        if (super_admin.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Wisatawan",
            data: super_admin.rows
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
            data: null,
            error: "Internal Server Error",
        });
    }
};

const post_Admin_adminDinas = async (req, res) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: err.message
            });
        }

        try {

            let id_admin;

            const token = req.cookies.tokenadmin;

            if (!token) {
                return res.status(401).json({ msg: "Akun Belum Login!", token });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            id_admin = decoded.id;


            const user_admin = await tbl_Admin.findOne({
                attributes: ['role'],
                where: {
                    id_admin
                }
            });

            if (user_admin.role !== "admin") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
            const { name, nama_lengkap, nip, email, password, status_akun } = req.body;

            if (!name || !nama_lengkap || !nip || !email || !password || !status_akun) {
                return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
            }


            const super_admin = await tbl_Admin.findAndCountAll({
                where: {
                    email_admin: email
                },
            });

            if (super_admin.count !== 0) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: "Email sudah terdaftar, gunakan email lain!",
                });
            }


            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const uploadedFile = req.file ? req.file.filename : 'default.jpg';

            const data = await tbl_Admin.create({
                nama_admin: name,
                namaLengkap_admin: nama_lengkap,
                nip_admin: nip,
                email_admin: email,
                password_admin: hashedPassword,
                role: 'dinas',
                sampul_admin: uploadedFile,
                status_akun: status_akun,
                createdAt: currentDateTime,
                updatedAt: currentDateTime
            });

            return res.status(200).json({
                status: 'success',
                success: true,
                message: "Admin Dinas Berhasil ditambahkan",
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

const put_Admin_adminDinas = async (req, res) => {
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

            if (user_admin.role !== "admin") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

            const { id_admin } = req.params;

            if (!id_admin) {
                return res.status(400).send({ error: "id_admin is required" });
            }

            const { name, nama_lengkap, nip, email, status_akun } = req.body;

            if (!name || !nama_lengkap  || !nip || !email || !status_akun) {
                return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
            }

            const user_admin_update = await tbl_Admin.findOne({
                where: {
                    id_admin
                },
            });

            if (!user_admin_update) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: 'Admin tidak terdaftar'
                });
            }

            const cek_email_update = await tbl_Admin.findOne({
                where: {
                    [Op.and]: [
                        { id_admin: user_admin_update.id_admin },
                        { email_admin: email },
                    ]
                },
            });

            if (!cek_email_update) {

                const cek_email = await tbl_Admin.findOne({
                    where: {
                        [Op.and]: [
                            { email_admin: email },
                        ]
                    },
                });
                
                if (cek_email) {
                    return res.status(422).json({
                        status: 'error',
                        success: false,
                        message: "Email sudah terdaftar, gunakan email lain!",
                    });
                }
            }
            let uploadedFile = user_admin_update.sampul_admin;

            if (req.file) {
                if (uploadedFile !== "default.jpg") {
                    const oldFilePath = `./uploads/img/profile/${uploadedFile}`;
                    fs.unlink(oldFilePath, (err) => {
                        if (err) {
                            console.error('Error deleting old file:', err);
                        }
                    });
                }

                uploadedFile = req.file.filename;
            }

            const update_data = await user_admin_update.update({
                nama_admin: name,
                namaLengkap_admin: nama_lengkap,
                nip_admin: nip,
                email_admin: email,
                role: 'dinas',
                sampul_admin: uploadedFile,
                status_akun: status_akun,
                updatedAt: currentDateTime
            });

            if (!update_data) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: "Gagal memperbarui data!",
                });
            }

            return res.status(200).json({
                status: 'success',
                success: true,
                message: "Data admin dinas berhasil diubah",
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
    });
};


const get_all_adminPengelola = async (req, res) => {
    try {
        const {
            keyword = '',
            order = "DESC"
        } = req.query;

        let id_admin;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id_admin = decoded.id;


        const user_admin = await tbl_Admin.findOne({
            attributes: ['role'],
            where: {
                id_admin
            }
        });

        if (user_admin.role !== "admin") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }


        const orderClause = [
            ['id_admin', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
        ];

        const whereClause = {
            [Op.and]: [
                { role: "admin pengelola" },
                keyword ? {
                    [Op.or]: [
                        { nama_admin: { [Op.like]: `%${keyword}%` } },
                        { namaLengkap_admin: { [Op.like]: `%${keyword}%` } },
                        { email_admin: { [Op.like]: `%${keyword}%` } },
                    ]
                } : {}
            ]
        };

        const super_admin = await tbl_Admin.findAndCountAll({
            where: whereClause,
            order: orderClause,
            attributes: [
                "id_admin",
                "nama_admin",
                "namaLengkap_admin",
                "email_admin",
                "password_admin",
                "role",
                "sampul_admin",
                "status_akun"
            ]
        });

        if (super_admin.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Wisatawan",
            data: super_admin.rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
            data: null,
            error: "Internal Server Error",
        });
    }
};

const post_Admin_adminPengelola = async (req, res) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: err.message
            });
        }

        try {

            let id_admin;

            const token = req.cookies.tokenadmin;

            if (!token) {
                return res.status(401).json({ msg: "Akun Belum Login!", token });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            id_admin = decoded.id;


            const user_admin = await tbl_Admin.findOne({
                attributes: ['role'],
                where: {
                    id_admin
                }
            });

            if (user_admin.role !== "admin") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
            const { name, nama_lengkap, email, password, status_akun } = req.body;

            if (!name || !nama_lengkap || !email || !password || !status_akun) {
                return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
            }


            const super_admin = await tbl_Admin.findAndCountAll({
                where: {
                    email_admin: email
                },
            });

            if (super_admin.count !== 0) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: "Email sudah terdaftar, gunakan email lain!",
                });
            }


            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const uploadedFile = req.file ? req.file.filename : 'default.jpg';

            const data = await tbl_Admin.create({
                nama_admin: name,
                namaLengkap_admin: nama_lengkap,
                email_admin: email,
                password_admin: hashedPassword,
                role: 'admin pengelola',
                sampul_admin: uploadedFile,
                status_akun: status_akun,
                createdAt: currentDateTime,
                updatedAt: currentDateTime
            });

            return res.status(200).json({
                status: 'success',
                success: true,
                message: "Admin pengelola Berhasil ditambahkan",
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

const put_Admin_adminPengelola = async (req, res) => {
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

            if (user_admin.role !== "admin") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

            const { id_admin } = req.params;

            if (!id_admin) {
                return res.status(400).send({ error: "id_admin is required" });
            }

            const { name, nama_lengkap, email, status_akun } = req.body;

            if (!name || !nama_lengkap || !email || !status_akun) {
                return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
            }

            const user_admin_update = await tbl_Admin.findOne({
                where: {
                    id_admin
                },
            });

            if (!user_admin_update) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: 'Admin tidak terdaftar'
                });
            }

            const cek_email_update = await tbl_Admin.findOne({
                where: {
                    [Op.and]: [
                        { id_admin: user_admin_update.id_admin },
                        { email_admin: email },
                    ]
                },
            });

            if (!cek_email_update) {

                const cek_email = await tbl_Admin.findOne({
                    where: {
                        [Op.and]: [
                            { email_admin: email },
                        ]
                    },
                });
                
                if (cek_email) {
                    return res.status(422).json({
                        status: 'error',
                        success: false,
                        message: "Email sudah terdaftar, gunakan email lain!",
                    });
                }
            }

            let uploadedFile = user_admin_update.sampul_admin;

            if (req.file) {
                if (uploadedFile !== "default.jpg") {
                    const oldFilePath = `./uploads/img/profile/${uploadedFile}`;
                    fs.unlink(oldFilePath, (err) => {
                        if (err) {
                            console.error('Error deleting old file:', err);
                        }
                    });
                }

                uploadedFile = req.file.filename;
            }

            const update_data = await user_admin_update.update({
                nama_admin: name,
                namaLengkap_admin: nama_lengkap,
                email_admin: email,
                role: 'admin pengelola',
                sampul_admin: uploadedFile,
                status_akun: status_akun,
                updatedAt: currentDateTime
            });

            if (!update_data) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: "Gagal memperbarui data!",
                });
            }

            return res.status(200).json({
                status: 'success',
                success: true,
                message: "Data admin pengelola berhasil diubah",
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
    });
};


const get_all_adminIndustri = async (req, res) => {
    try {
        const {
            keyword = '',
            order = "DESC"
        } = req.query;

        let id_admin;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id_admin = decoded.id;


        const user_admin = await tbl_Admin.findOne({
            attributes: ['role'],
            where: {
                id_admin
            }
        });

        if (user_admin.role !== "admin") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }


        const orderClause = [
            ['id_admin', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
        ];

        const whereClause = {
            [Op.and]: [
                { role: "admin industri" },
                keyword ? {
                    [Op.or]: [
                        { nama_admin: { [Op.like]: `%${keyword}%` } },
                        { namaLengkap_admin: { [Op.like]: `%${keyword}%` } },
                        { email_admin: { [Op.like]: `%${keyword}%` } },
                    ]
                } : {}
            ]
        };

        const super_admin = await tbl_Admin.findAndCountAll({
            where: whereClause,
            order: orderClause,
            attributes: [
                "id_admin",
                "nama_admin",
                "namaLengkap_admin",
                "email_admin",
                "password_admin",
                "role",
                "sampul_admin",
                "status_akun"
            ]
        });

        if (super_admin.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Wisatawan",
            data: super_admin.rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
            data: null,
            error: "Internal Server Error",
        });
    }
};

const post_Admin_adminIndustri = async (req, res) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: err.message
            });
        }

        try {

            let id_admin;

            const token = req.cookies.tokenadmin;

            if (!token) {
                return res.status(401).json({ msg: "Akun Belum Login!", token });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            id_admin = decoded.id;


            const user_admin = await tbl_Admin.findOne({
                attributes: ['role'],
                where: {
                    id_admin
                }
            });

            if (user_admin.role !== "admin") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
            const { name, nama_lengkap, email, password, status_akun } = req.body;

            if (!name || !nama_lengkap || !email || !password || !status_akun) {
                return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
            }


            const super_admin = await tbl_Admin.findAndCountAll({
                where: {
                    email_admin: email
                },
            });

            if (super_admin.count !== 0) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: "Email sudah terdaftar, gunakan email lain!",
                });
            }


            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const uploadedFile = req.file ? req.file.filename : 'default.jpg';

            const data = await tbl_Admin.create({
                nama_admin: name,
                namaLengkap_admin: nama_lengkap,
                email_admin: email,
                password_admin: hashedPassword,
                role: 'admin industri',
                sampul_admin: uploadedFile,
                status_akun: status_akun,
                createdAt: currentDateTime,
                updatedAt: currentDateTime
            });

            return res.status(200).json({
                status: 'success',
                success: true,
                message: "Admin Berhasil ditambahkan",
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

const put_Admin_adminIndustri = async (req, res) => {
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

            if (user_admin.role !== "admin") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

            const { id_admin } = req.params;

            if (!id_admin) {
                return res.status(400).send({ error: "id_admin is required" });
            }

            const { name, nama_lengkap, email, status_akun } = req.body;

            if (!name || !nama_lengkap || !email || !status_akun) {
                return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
            }

            const user_admin_update = await tbl_Admin.findOne({
                where: {
                    id_admin
                },
            });

            if (!user_admin_update) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: 'Admin tidak terdaftar'
                });
            }

           
            const cek_email_update = await tbl_Admin.findOne({
                where: {
                    [Op.and]: [
                        { id_admin: user_admin_update.id_admin },
                        { email_admin: email },
                    ]
                },
            });

            if (!cek_email_update) {

                const cek_email = await tbl_Admin.findOne({
                    where: {
                        [Op.and]: [
                            { email_admin: email },
                        ]
                    },
                });
                
                if (cek_email) {
                    return res.status(422).json({
                        status: 'error',
                        success: false,
                        message: "Email sudah terdaftar, gunakan email lain!",
                    });
                }
            }

            let uploadedFile = user_admin_update.sampul_admin;

            if (req.file) {
                if (uploadedFile !== "default.jpg") {
                    const oldFilePath = `./uploads/img/profile/${uploadedFile}`;
                    fs.unlink(oldFilePath, (err) => {
                        if (err) {
                            console.error('Error deleting old file:', err);
                        }
                    });
                }

                uploadedFile = req.file.filename;
            }

            const update_data = await user_admin_update.update({
                nama_admin: name,
                namaLengkap_admin: nama_lengkap,
                email_admin: email,
                role: 'admin industri',
                sampul_admin: uploadedFile,
                status_akun: status_akun,
                updatedAt: currentDateTime
            });

            if (!update_data) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: "Gagal memperbarui data!",
                });
            }

            return res.status(200).json({
                status: 'success',
                message: "Data admin berhasil diubah",
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
    });
};


const put_Pass_Admin= async (req, res) => {
    try {

        let id_admin_login;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id_admin_login = decoded.id;

        const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        const { id_admin } = req.params;

        if (!id_admin) {
            return res.status(400).send({ error: "id_admin is required" });
        }

        const { old_pass, new_pass, newPass_comfirm } = req.body;

        if (!old_pass || !new_pass || !newPass_comfirm ) {
            return res.status(422).json({ status: 'error', message: "Lengkapi data inputan change password" });
        }

        // if (id_admin !== id_admin_login) {
        //     return res.status(422).json({
        //         status: 'error',
        //         success: false,
        //         message: 'Anda tidak dapat mengubah password akun ini!'
        //     });
        // }

        const user_admin_update = await tbl_Admin.findOne({
            where: {
                id_admin
            },
        });

        if (!user_admin_update) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: 'Admin tidak terdaftar'
            });
        }

        const match = await bcrypt.compare(
            old_pass,
            user_admin_update.password_admin
        );

        if (!match) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: 'Password lama salah!'
            });
        }

        if (new_pass !== newPass_comfirm) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: 'Konfirmasi Password baru tidak sama!'
            });
        }
        
        const matchnewPass = await bcrypt.compare(
            new_pass,
            user_admin_update.password_admin
        );

        if (matchnewPass) {
            return res.status(200).json({
                status: 'success',
                success: true,
                message: "Anda tidak melakukan perubahan password",
            });
        }

        const hashedPassword = await bcrypt.hash(new_pass, saltRounds);

        const update_data = await user_admin_update.update({
            password_admin: hashedPassword,
            updatedAt: currentDateTime
        });

        if (!update_data) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: "Gagal memperbarui data!",
            });
        }

        return res.status(200).json({
            status: 'success',
            success: true,
            message: "Password admin berhasil diubah",
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

const delete_Admin_onlyBysuperAdmin = async (req, res) => {
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

        if (user_admin.role !== "admin") {
            return res.status(401).json({ message: "Hak akses ditolak" });
        }

        const { id_admin } = req.params;


        if (!id_admin) {
            return res.status(400).send({ error: "id_admin is required" });
        }

        const user_admin_delete = await tbl_Admin.findOne({
            where: {
                id_admin: id_admin
            }
        });

        if (!user_admin_delete) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: 'Admin tidak terdaftar'
            });
        }

        let uploadedFile = user_admin_delete.sampul_admin;

        if (uploadedFile !== 'default.jpg') {
            const oldFilePath = `./uploads/img/profile/${uploadedFile}`;
            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error('Error deleting old file:', err);
                }
            });
        }

        const delete_admin = await user_admin_delete.destroy();

        if (!delete_admin) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: "Admin gagal dihapus",
            });
        }

        return res.status(200).json({
            status: 'success',
            success: true,
            message: "Admin berhasil dihapus",
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

const get_DetailadminDinas = async (req, res) => {
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
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }

        
        const { id_admin } = req.params;

        if (!id_admin) {
            return res.status(400).send({ error: "id_admin is required" });
        }


        const super_admin = await tbl_Admin.findAndCountAll({
            where: {
                [Op.and]: [
                    { id_admin: id_admin },
                    { role: "dinas" }
                ]
            },
            attributes: [
                "id_admin",
                "nama_admin",
                "nip_admin",
                "namaLengkap_admin",
                "sampul_admin",
            ]
        });

        if (super_admin.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Detail Admin Dinas",
            data: super_admin.rows
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


//option

const get_all_OptionadminPengelola = async (req, res) => {
    try {

        let id_admin;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id_admin = decoded.id;


        const user_admin = await tbl_Admin.findOne({
            attributes: ['role'],
            where: {
                id_admin
            }
        });

        if (user_admin.role !== "admin" && user_admin.role !== "dinas") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }

        const super_admin = await tbl_Admin.findAndCountAll({
            where: { role: "admin pengelola" },
            attributes: [
                "id_admin",
                "nama_admin",
                "namaLengkap_admin",
            ]
        });

        if (super_admin.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Admin Pengelola",
            data: super_admin.rows
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

const get_all_OptionadminIndustri = async (req, res) => {
    try {

        let id_admin;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id_admin = decoded.id;


        const user_admin = await tbl_Admin.findOne({
            attributes: ['role'],
            where: {
                id_admin
            }
        });

        if (user_admin.role !== "admin" && user_admin.role !== "dinas") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }

        const super_admin = await tbl_Admin.findAndCountAll({
            where: { role: "admin industri" },
            attributes: [
                "id_admin",
                "nama_admin",
                "namaLengkap_admin",
            ]
        });

        if (super_admin.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Admin Industri",
            data: super_admin.rows
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

const get_all_OptionadminPengelolaAndIndustri = async (req, res) => {
    try {

        let id_admin;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id_admin = decoded.id;


        const user_admin = await tbl_Admin.findOne({
            attributes: ['role'],
            where: {
                id_admin
            }
        });

        if (user_admin.role !== "admin" && user_admin.role !== "dinas") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }

        // const super_admin = await tbl_Admin.findAndCountAll({
        //     where: { role: "admin industri" },
        //     attributes: [
        //         "id_admin",
        //         "nama_admin",
        //         "namaLengkap_admin",
        //     ]
        // });

        const super_admin = await tbl_Admin.findAndCountAll({
            where: { 
                [Op.or]: [
                    { role: "admin pengelola" },
                    { role: "admin industri" }
                ], 
            },
            attributes: [
                "id_admin",
                "nama_admin",
                "namaLengkap_admin",
                "role",
            ]
        });

        if (super_admin.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Admin Pengelola",
            data: super_admin.rows
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

const get_all_OptionadminDinas = async (req, res) => {
    try {

        let id_admin;

        const token = req.cookies.tokenadmin;

        if (!token) {
            return res.status(401).json({ msg: "Akun Belum Login!", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id_admin = decoded.id;


        const user_admin = await tbl_Admin.findOne({
            attributes: ['role'],
            where: {
                id_admin
            }
        });

        if (user_admin.role !== "admin") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }

        const super_admin = await tbl_Admin.findAndCountAll({
            where: { role: "dinas" },
            attributes: [
                "id_admin",
                "nama_admin",
                "namaLengkap_admin",
            ]
        });

        if (super_admin.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Admin Pengelola",
            data: super_admin.rows
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
    get_all_superAdmin,
    get_all_adminDinas,
    get_all_adminPengelola,
    get_all_adminIndustri,

    post_Admin_superAdmin,
    post_Admin_adminDinas,
    post_Admin_adminPengelola,
    post_Admin_adminIndustri,

    put_Admin_superAdmin,
    put_Admin_adminDinas,
    put_Admin_adminPengelola,
    put_Admin_adminIndustri,

    delete_Admin_onlyBysuperAdmin,
    put_Pass_Admin,
    get_DetailadminDinas,

    //option
    get_all_OptionadminPengelola,
    get_all_OptionadminIndustri,
    get_all_OptionadminPengelolaAndIndustri,
    get_all_OptionadminDinas
};