const db = require("../models");
const tbl_Admin = db.tbl_Admin;
const moment = require('moment-timezone');
const bcrypt = require("bcrypt");
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
    limits: { fileSize: 300 * 1024 * 1024 }, // Limit file size to 300MB
});


const get_all_userPengelola = async (req, res) => {
    try {
        const {
            keyword = '',
            byAdmin = '',
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

        if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin pengelola" && user_admin.role !== "admin industri") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }

        const orderClause = [
            ['id_admin', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
        ];

        const whereClause = {
            [Op.and]: [
                byAdmin ? {
                    id_admin_pemilik: byAdmin
                } : {},
                {
                    [Op.or]: [
                        { role: "user pengelola" },
                        { role: "user industri" }
                    ],
                },
                keyword ? {
                    [Op.or]: [
                        { nama_admin: { [Op.like]: `%${keyword}%` } },
                        { namaLengkap_admin: { [Op.like]: `%${keyword}%` } },
                        { email_admin: { [Op.like]: `%${keyword}%` } },
                    ]
                } : {}
            ]
        };

        const data_user_pengelola = await tbl_Admin.findAndCountAll({
            where: whereClause,
            order: orderClause,
            attributes: [
                "id_admin",
                "id_admin_pemilik",
                "nama_admin",
                "namaLengkap_admin",
                "email_admin",
                "password_admin",
                "role",
                "sampul_admin",
                "nohp_admin",
                "alamat_admin",
                "status_akun",
                "id_admin_author",
                "updatedAt"
            ]
        });

        if (data_user_pengelola.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }


        const results = await Promise.all(data_user_pengelola.rows.map(async (pengelola) => {
            let detail_author = [];
            let detail_pemilik = [];

            detail_author = await tbl_Admin.findOne({
                where: { id_admin: pengelola.id_admin_author },
                attributes: [
                    "id_admin",
                    "nama_admin"
                ]
            });

            detail_pemilik = await tbl_Admin.findOne({
                where: { id_admin: pengelola.id_admin_pemilik },
                attributes: [
                    "id_admin",
                    "nama_admin"
                ]
            });

            return {
                id_admin: pengelola.id_admin,
                detail_author,
                detail_pemilik,
                nama_admin: pengelola.nama_admin,
                namaLengkap_admin: pengelola.namaLengkap_admin,
                email_admin: pengelola.email_admin,
                nohp_admin: pengelola.nohp_admin,
                role: pengelola.role,
                alamat_admin: pengelola.alamat_admin,
                sampul_admin: pengelola.sampul_admin,
                status_akun: pengelola.status_akun,
                updatedAt: pengelola.updatedAt
            };
        }));


        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Pengelola",
            data: results
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

const get_all_userIndustri = async (req, res) => {
    try {
        const {
            keyword = '',
            byAdmin = '',
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

        if (user_admin.role !== "admin" && user_admin.role !== "dinas" && user_admin.role !== "admin industri" && user_admin.role !== "admin pengelola") {
            return res.status(401).json({ msg: "Hak akses ditolak" });
        }

        const orderClause = [
            ['id_admin', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']
        ];

        const whereClause = {
            [Op.and]: [
                byAdmin ? {
                    id_admin_pemilik: byAdmin
                } : {},
                {
                    [Op.or]: [
                        { role: "user pengelola" },
                        { role: "user industri" }
                    ],
                },
                keyword ? {
                    [Op.or]: [
                        { nama_admin: { [Op.like]: `%${keyword}%` } },
                        { namaLengkap_admin: { [Op.like]: `%${keyword}%` } },
                        { email_admin: { [Op.like]: `%${keyword}%` } },
                    ]
                } : {}
            ]
        };

        const data_user_industri = await tbl_Admin.findAndCountAll({
            where: whereClause,
            order: orderClause,
            attributes: [
                "id_admin",
                "id_admin_pemilik",
                "nama_admin",
                "namaLengkap_admin",
                "email_admin",
                "password_admin",
                "role",
                "sampul_admin",
                "nohp_admin",
                "alamat_admin",
                "status_akun",
                "id_admin_author",
                "updatedAt"
            ]
        });

        if (data_user_industri.count === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Data tidak ditemukan",
                data: []
            });
        }


        const results = await Promise.all(data_user_industri.rows.map(async (industri) => {
            let detail_author = [];
            let detail_pemilik = [];

            detail_author = await tbl_Admin.findOne({
                where: { id_admin: industri.id_admin_author },
                attributes: [
                    "id_admin",
                    "nama_admin"
                ]
            });

            detail_pemilik = await tbl_Admin.findOne({
                where: { id_admin: industri.id_admin_pemilik },
                attributes: [
                    "id_admin",
                    "nama_admin"
                ]
            });

            return {
                id_admin: industri.id_admin,
                detail_author,
                detail_pemilik,
                nama_admin: industri.nama_admin,
                namaLengkap_admin: industri.namaLengkap_admin,
                email_admin: industri.email_admin,
                nohp_admin: industri.nohp_admin,
                role: industri.role,
                alamat_admin: industri.alamat_admin,
                sampul_admin: industri.sampul_admin,
                status_akun: industri.status_akun,
                updatedAt: industri.updatedAt
            };
        }));


        return res.status(200).json({
            status: 200,
            success: true,
            message: "Data Pengelola Industri",
            data: results
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

const post_Admin_userPengelola = async (req, res) => {
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

            if (user_admin.role !== "admin" && user_admin.role !== "admin pengelola" && user_admin.role !== "admin industri") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

            const { id_admin_pemilik, name, nama_lengkap, no_hp, alamat, email, password, status_akun } = req.body;

            let data = [];

            if (user_admin.role === "admin") {

                if (!id_admin_pemilik || !name || !nama_lengkap || !no_hp || !alamat || !email || !password || !status_akun) {
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

                const cek_admin_pemilik = await tbl_Admin.findOne({
                    where: {
                        id_admin: id_admin_pemilik
                    },
                });

                if (!cek_admin_pemilik) {
                    return res.status(422).json({
                        status: 'error',
                        success: false,
                        message: "Admin tidak terdaftar",
                    });
                }

                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const uploadedFile = req.file ? req.file.filename : 'default.jpg';
                let role = null;

                if (cek_admin_pemilik.role === "admin pengelola") {
                    role = "user pengelola"
                } else {
                    role = "user industri"
                }

                data = await tbl_Admin.create({
                    id_admin_pemilik: id_admin_pemilik,
                    nama_admin: name,
                    namaLengkap_admin: nama_lengkap,
                    email_admin: email,
                    password_admin: hashedPassword,
                    role: role,
                    sampul_admin: uploadedFile,
                    status_akun: status_akun,
                    nohp_admin: no_hp,
                    alamat_admin: alamat,
                    id_admin_author: id_admin_login,
                    createdAt: currentDateTime,
                    updatedAt: currentDateTime
                });

            } else {

                if (!name || !nama_lengkap || !no_hp || !alamat || !email || !password || !status_akun) {
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

                const cek_admin_pemilik = await tbl_Admin.findOne({
                    where: {
                        id_admin: id_admin_login
                    },
                });

                if (!cek_admin_pemilik) {
                    return res.status(422).json({
                        status: 'error',
                        success: false,
                        message: "Admin tidak terdaftar",
                    });
                }

                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const uploadedFile = req.file ? req.file.filename : 'default.jpg';
                let role = null;

                if (cek_admin_pemilik.role === "admin pengelola") {
                    role = "user pengelola"
                } else {
                    role = "user industri"
                }

                data = await tbl_Admin.create({
                    id_admin_pemilik: id_admin_login,
                    nama_admin: name,
                    namaLengkap_admin: nama_lengkap,
                    email_admin: email,
                    password_admin: hashedPassword,
                    role: role,
                    sampul_admin: uploadedFile,
                    status_akun: status_akun,
                    nohp_admin: no_hp,
                    alamat_admin: alamat,
                    id_admin_author: id_admin_login,
                    createdAt: currentDateTime,
                    updatedAt: currentDateTime
                });
            }


            return res.status(200).json({
                status: 'success',
                success: true,
                message: "User Pengelola Berhasil ditambahkan",
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

const put_Admin_userPengelola = async (req, res) => {
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

            if (user_admin.role !== "admin" && user_admin.role !== "admin pengelola" && user_admin.role !== "admin industri") {
                return res.status(401).json({ message: "Hak akses ditolak" });
            }

            const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

            const { id_admin } = req.params;

            if (!id_admin) {
                return res.status(400).send({ error: "id_admin is required" });
            }

            const { name, nama_lengkap, no_hp, alamat, email, status_akun } = req.body;
            // const { id_admin_pemilik, name, nama_lengkap, no_hp, alamat, email, status_akun } = req.body;

            // if (!id_admin_pemilik || !name || !nama_lengkap || !no_hp || !alamat || !email || !status_akun) {
            //     return res.status(422).json({ status: 'error', message: "Lengkapi data inputan" });
            // }

            if ( !name || !nama_lengkap || !no_hp || !alamat || !email || !status_akun) {
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
                    message: 'Pengelola tidak terdaftar'
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

            
            // const cek_admin_pemilik = await tbl_Admin.findOne({
            //     where: {
            //         id_admin: id_admin_pemilik
            //     },
            // });

            // if (!cek_admin_pemilik) {
            //     return res.status(422).json({
            //         status: 'error',
            //         success: false,
            //         message: "Admin tidak terdaftar",
            //     });
            // }

            // let role = null;

            // if (cek_admin_pemilik.role === "admin pengelola") {
            //     role = "user pengelola"
            // } else {
            //     role = "user industri"
            // }

            const update_data = await user_admin_update.update({
                // id_admin_pemilik: id_admin_pemilik,
                nama_admin: name,
                namaLengkap_admin: nama_lengkap,
                email_admin: email,
                // role: role,
                sampul_admin: uploadedFile,
                status_akun: status_akun,
                nohp_admin: no_hp,
                alamat_admin: alamat,
                id_admin_author: id_admin_login,
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
                message: "Data User Pengelola berhasil diubah",
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


const put_Pass_pengelola = async (req, res) => {
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

        if (!old_pass || !new_pass || !newPass_comfirm) {
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
                [Op.and]: [
                    {
                        id_admin: id_admin
                    },
                    {
                        role: "user pengelola"
                    }
                ]
            },
        });

        if (!user_admin_update) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: 'Pengelola tidak terdaftar'
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
            message: "Password pengelola berhasil diubah",
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

const delete_Pengelola_byAdmin = async (req, res) => {
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

        if (user_admin.role !== "admin" && user_admin.role !== "admin pengelola" && user_admin.role !== "admin industri") {
            return res.status(401).json({ message: "Hak akses ditolak" });
        }

        const { id_admin } = req.params;


        if (!id_admin) {
            return res.status(400).send({ error: "id_admin is required" });
        }

        const user_admin_delete = await tbl_Admin.findOne({
            where: {
                [Op.and]: [
                    {
                        id_admin: id_admin
                    },
                    {
                        role: "user pengelola"
                    }
                ]
            }
        });

        if (!user_admin_delete) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: 'Pengelola tidak terdaftar'
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
                message: "Pengelola gagal dihapus",
            });
        }

        return res.status(200).json({
            status: 'success',
            success: true,
            message: "User Pengelola berhasil dihapus",
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
    get_all_userPengelola,
    post_Admin_userPengelola,
    put_Admin_userPengelola,
    delete_Pengelola_byAdmin,
    put_Pass_pengelola,
    get_all_userIndustri
};