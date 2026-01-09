// authcontroller.js
const db = require("../models");
const tbl_Otp = db.tbl_Otp;
const tbl_wisatawan = db.tbl_Wisatawan;
const tbl_Admin = db.tbl_Admin;
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Helpers
 */
const isProduction = process.env.NODE_ENV === "production";

// Helper generate token
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" }); // 10 minutes

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "1d" }); // 1 day

/**
 * Login user wisatawan
 */
const Login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password)
      return res.status(400).json({ msg: "Email dan password diperlukan" });

    const user_wisatawan = await tbl_wisatawan.findOne({
      where: { email },
    });

    if (!user_wisatawan) {
      return res.status(401).json({ msg: "Email atau password salah" });
    }

    const match = await bcrypt.compare(password, user_wisatawan.password);
    if (!match) {
      return res.status(401).json({ msg: "Email atau password salah" });
    }

    const id = user_wisatawan.id_wisatawan;
    const name = user_wisatawan.name;
    const userEmail = user_wisatawan.email;

    const accessPayload = { id, email: userEmail, role: "wisatawan" };
    const refreshPayload = { id, email: userEmail, role: "wisatawan" };

    const token = signAccessToken(accessPayload);
    const token_refresh = signRefreshToken(refreshPayload); // ✅ Variabel didefinisikan di sini

    // simpan refresh token di DB
    await tbl_wisatawan.update(
      { refresh_token: token_refresh },
      { where: { id_wisatawan: id } }
    );

    // ✅ REVISI: Menggunakan 'token_refresh', BUKAN 'refreshToken'
    res.cookie("refreshtoken", token_refresh, {
      httpOnly: true,
      secure: true, // Wajib HTTPS agar tidak error Mixed Content/Cookie rejected
      sameSite: "None", // Wajib None jika frontend & backend beda subdomain/domain
      domain: ".tifpsdku.com", // Agar bisa dibaca subdomain
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log('✅ Wisatawan Login Success. Cookie set.');

    return res.status(200).json({
      message: "Login berhasil",
      token, // access token
      user: { id, name, email: userEmail },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

/**
 * Me (cek user wisatawan berdasarkan refresh token cookie)
 */
const Me = async (req, res) => {
  try {
    const token = req.cookies?.refreshtoken;
    if (!token) {
      return res.status(401).json({ msg: "Akun belum login" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ msg: "Token tidak valid atau kadaluarsa" });
    }

    const id = decoded.id;

    const user_wisatawan = await tbl_wisatawan.findOne({
      attributes: ["id_wisatawan", "name", "profile", "email"],
      where: { id_wisatawan: id },
    });

    if (!user_wisatawan) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    return res.status(200).json({ user: user_wisatawan, role: "wisatawan" });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

/**
 * sendOtp - kirim OTP via Resend
 */
const sendOtp = async (req, res) => {
  try {
    const email = req.body?.email;
    const typesend = req.body?.typesend || "verify";

    if (!email) {
      return res.status(400).json({ status: 400, success: false, message: "Email diperlukan" });
    }

    // cek OTP existing
    const existingOtp = await tbl_Otp.findOne({ where: { email_user: email } });

    if (existingOtp) {
      const now = new Date();
      if (existingOtp.expiryTime && now <= existingOtp.expiryTime) {
        return res.status(422).json({
          status: 422,
          success: false,
          message: "OTP masih aktif, tunggu beberapa menit",
        });
      }
      await tbl_Otp.destroy({ where: { email_user: email } });
    }

    // generate OTP numeric 6 digit
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5); // 5 menit valid

    await tbl_Otp.create({ email_user: email, otp, expiryTime });

    const subject = typesend === "reset" ? "Reset Password Anda" : "Verifikasi Kode OTP";
    const message = `Jangan berikan kode ini kepada orang lain.\n\nKode OTP Anda adalah: ${otp}\n\nKode berlaku 5 menit.`;

    try {
      const result = await resend.emails.send({
        from: `GoMadiun Official <${process.env.RESEND_FROM_EMAIL}>`,
        to: email,
        subject,
        text: message,
      });

      console.log("OTP dikirim ke:", email);

      return res.status(200).json({
        status: 200,
        success: true,
        message: "OTP berhasil dikirim, silakan cek email Anda!",
        data: { result },
      });
    } catch (sendErr) {
      console.error("Resend send error:", sendErr);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Gagal mengirim OTP ke email",
        error: sendErr?.message || sendErr,
      });
    }
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Terjadi kesalahan server",
      error: error?.message || error,
    });
  }
};

/**
 * VerifOtp - verifikasi kode OTP
 */
const VerifOtp = async (req, res) => {
  try {
    const { email, otp } = req.body ?? {};

    if (!email || !otp) {
      return res.status(400).json({ status: 400, success: false, message: "Email dan OTP diperlukan" });
    }

    const otpActive = await tbl_Otp.findOne({ where: { email_user: email, otp } });

    if (!otpActive) {
      return res.status(422).json({ status: 422, success: false, message: "Kode OTP salah" });
    }

    const currentTime = new Date();
    const expiredTime = new Date(otpActive.expiryTime);

    if (currentTime <= expiredTime) {
      await tbl_Otp.destroy({ where: { email_user: email } });
      return res.status(200).json({
        status: 200,
        success: true,
        message: "OTP valid",
      });
    } else {
      await tbl_Otp.destroy({ where: { email_user: email } });
      return res.status(422).json({
        status: 422,
        success: false,
        message: "Kode OTP expired",
      });
    }
  } catch (error) {
    console.error("VerifOtp error:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal server error",
      error: error?.message || error,
    });
  }
};

/**
 * Logout
 */
const logOut = async (req, res) => {
  try {
    const role = req.query.role || req.query.keyword || "";

    if (!role) {
      return res.status(400).json({ msg: "Query role is required" });
    }

    if (role === "wisatawan") {
      const token = req.cookies?.refreshtoken;
      if (!token) return res.status(401).json({ msg: "Akun belum login" });

      const user = await tbl_wisatawan.findOne({ where: { refresh_token: token } });
      if (user) {
        await tbl_wisatawan.update({ refresh_token: null }, { where: { id_wisatawan: user.id_wisatawan } });
      }
      
      res.clearCookie("refreshtoken", { path: "/", domain: ".tifpsdku.com" });
      return res.status(200).json({ msg: "Anda telah berhasil logout" });
    }

    if (role === "admin") {
      const token = req.cookies?.tokenadmin;
      if (!token) return res.status(401).json({ msg: "Akun belum login" });

      const user = await tbl_Admin.findOne({ where: { refresh_token: token } });
      if (user) {
         await tbl_Admin.update({ refresh_token: null }, { where: { id_admin: user.id_admin } });
      }
      
      res.clearCookie("tokenadmin", { path: "/", domain: ".tifpsdku.com" });
      return res.status(200).json({ msg: "Admin telah berhasil logout" });
    }

    return res.status(400).json({ msg: "Role tidak valid (wisatawan/admin)" });
  } catch (error) {
    console.error("logOut error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

/**
 * Admin login
 */
const LoginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ status: "error", message: "Email & password diperlukan" });

    const user_admin = await tbl_Admin.findOne({ where: { email_admin: email } });
    if (!user_admin) return res.status(401).json({ status: "error", message: "Email atau password salah" });

    const match = await bcrypt.compare(password, user_admin.password_admin);
    if (!match) return res.status(401).json({ status: "error", message: "Email atau password salah" });

    if (user_admin.status_akun === "suspend") {
      return res.status(403).json({ status: "error", message: "Akun Anda dinonaktifkan" });
    }

    const id = user_admin.id_admin;
    const name = user_admin.nama_admin;
    const userEmail = user_admin.email_admin;
    const role = user_admin.role || "admin";

    const accessPayload = { id, email: userEmail, role };
    const refreshPayload = { id, email: userEmail, role };

    const token = signAccessToken(accessPayload);
    const token_refresh = signRefreshToken(refreshPayload);

    await tbl_Admin.update({ refresh_token: token_refresh }, { where: { id_admin: id } });

    // ✅ REVISI: Nama cookie diganti 'tokenadmin' dan value pakai 'token_refresh'
    res.cookie("tokenadmin", token_refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: ".tifpsdku.com",
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log('✅ Admin Login Success. Cookie set.');

    return res.status(200).json({ message: "Login Berhasil", token, user: { id, name, email: userEmail, role } });
  } catch (error) {
    console.error("LoginAdmin error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

/**
 * MeAdmin - cek admin berdasarkan cookie tokenadmin (refresh token)
 */
const MeAdmin = async (req, res) => {
  try {
    const token = req.cookies?.tokenadmin;
    if (!token) return res.status(401).json({ msg: "Akun belum login" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ msg: "Token tidak valid atau kadaluarsa" });
    }

    const id = decoded.id;
    const user_admin = await tbl_Admin.findOne({
      attributes: ["id_admin", "nama_admin", "sampul_admin", "role", "email_admin"],
      where: { id_admin: id },
    });

    if (!user_admin) return res.status(404).json({ msg: "Admin tidak ditemukan" });

    return res.status(200).json({ user_admin });
  } catch (error) {
    console.error("MeAdmin error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

module.exports = {
  Login,
  Me,
  logOut,
  sendOtp,
  VerifOtp,
  LoginAdmin,
  MeAdmin,
};