//DITANYAKAN

const db = require("../models");
const tbl_Wisatawan = db.tbl_Wisatawan;
const moment = require('moment-timezone');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');
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

const uploadFolder = path.join(__dirname, './uploads/img/profile');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 300 * 1024 * 1024 },
});


const checkExistEmailWisatawan = async (req, res) => {

  try {
    const { email } = req.body;

    const ExistEmail = await tbl_Wisatawan.findOne({ where: { email: email } });

    if (ExistEmail) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Email sudah terdaftar!",
      });

    } else {
      return res.status(422).json({
        status: 422,
        success: false,
        message: "Email belum terdaftar!",
      });
    }
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

const post_wisatawan = async (req, res) => {
  try {

    const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    const { name, nama_lengkap, no_hp, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const data = await tbl_Wisatawan.create({
      name: name,
      nama_lengkap: nama_lengkap,
      no_hp: no_hp,
      email: email,
      password: hashedPassword,
      profile: "default.jpg",
      createdAt: currentDateTime,
      updatedAt: currentDateTime
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Registrasi Berhasil",
      data: {
        data: data,
      },
      error: null,
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

const get_all = async (req, res) => {
  try {
    const Wisatawans = await tbl_Wisatawan.findAll();
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Data Wisatawan",
      data: {
        Wisatawans,
      },
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

const get_detail = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const data = await tbl_Wisatawan.findOne({
      where: {
        id_wisatawan,
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
      id_wisatawan: data.id_wisatawan,
      name: data.name,
      nama_lengkap: data.nama_lengkap,
      no_hp: data.no_hp,
      email: data.email,
      profile: data.profile,
    };

    return res.status(200).json({
      success: true,
      message: "Sukses mendapatkan data",
      data: result
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

const put_wisatawan = async (req, res) => {
  upload.single("avatar")(req, res, async (err) => {
    if (err) {
      return res.status(422).json({
        status: "error",
        success: false,
        message: err.message,
      });
    }

    try {
      const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

      const token = req.cookies.refreshtoken;
      if (!token) {
        return res.status(401).json({ msg: "Akun Belum Login!" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id_wisatawan = decoded.id;

      const data = await tbl_Wisatawan.findOne({ where: { id_wisatawan } });
      if (!data) {
        return res.status(422).json({
          success: false,
          message: "Data Tidak Ditemukan",
          data: null,
        });
      }

      const { name, nama_lengkap, no_hp } = req.body;
      let profileImage = data.profile;

      if (req.file) {
        // Jika file yang lama bukan default.jpg, hapus file tersebut
        if (profileImage && profileImage !== "default.jpg") {
          const oldFilePath = `./uploads/img/profile/${profileImage}`;
          fs.unlink(oldFilePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting old file:", unlinkErr);
            }
          });
        }

        profileImage = req.file.filename; // Gunakan file baru
      }

      const updatedData = await data.update({
        name: name || data.name,
        nama_lengkap: nama_lengkap || data.nama_lengkap,
        no_hp: no_hp || data.no_hp,
        profile: profileImage,
        updatedAt: currentDateTime,
      });

      return res.status(200).json({
        status: "success",
        message: "Data Berhasil diperbarui",
        data: updatedData,
      });
    } catch (error) {
      console.error("Error updating data:", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });
};



module.exports = {
  get_all,
  get_detail,
  put_wisatawan,
  post_wisatawan,
  checkExistEmailWisatawan
};