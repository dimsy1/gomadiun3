const db = require('../models');
const tbl_Admin = db.tbl_Admin;
const tbl_Wisatawan = db.tbl_Wisatawan; // Pastikan model ini ada
const tbl_Otp = db.tbl_Otp; // Pastikan model ini ada
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Jika pakai OTP email

// --- HELPER TOKEN ---
const signAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'rahasia_access', { expiresIn: '15m' });
};

const signRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'rahasia_refresh', { expiresIn: '1d' });
};

// ==========================================
// 1. AUTH ADMIN (YANG ANDA BUTUHKAN)
// ==========================================

const LoginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
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

        // COOKIE ADMIN
        res.cookie("tokenadmin", token_refresh, {
            httpOnly: true,
            secure: false, // Localhost = false
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ message: "Login Berhasil", token, user: { id, name, email: userEmail, role } });
    } catch (error) {
        console.error("LoginAdmin error:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const MeAdmin = async (req, res) => {
    try {
        const token = req.cookies.tokenadmin;
        if (!token) return res.status(401).json({ msg: "Akun belum login" });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'rahasia_refresh');
        } catch (err) {
            return res.status(401).json({ msg: "Token tidak valid" });
        }

        const user_admin = await tbl_Admin.findOne({
            attributes: ["id_admin", "nama_admin", "email_admin", "role", "sampul_admin"],
            where: { id_admin: decoded.id },
        });

        if (!user_admin) return res.status(404).json({ msg: "Admin tidak ditemukan" });

        return res.status(200).json({ user_admin });
    } catch (error) {
        console.error("MeAdmin error:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

// ==========================================
// 2. AUTH WISATAWAN (AGAR TIDAK CRASH)
// ==========================================

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Cari user di tabel Wisatawan (bukan Admin)
        const user = await tbl_Wisatawan.findOne({ where: { email: email } });
        if (!user) return res.status(404).json({ msg: "Email tidak ditemukan" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ msg: "Password salah" });

        const id = user.id_wisatawan;
        const name = user.username;
        const userEmail = user.email;

        const accessToken = signAccessToken({ id, name, email: userEmail });
        const refreshToken = signRefreshToken({ id, name, email: userEmail });

        await tbl_Wisatawan.update({ refresh_token: refreshToken }, { where: { id_wisatawan: id } });

        // Cookie User Biasa (nama beda dengan tokenadmin)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: false, // Localhost
            sameSite: 'lax'
        });

        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error" });
    }
};

const Me = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.sendStatus(401);

        const user = await tbl_Wisatawan.findOne({ where: { refresh_token: refreshToken } });
        if (!user) return res.sendStatus(403);

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'rahasia_refresh', (err, decoded) => {
            if (err) return res.sendStatus(403);
            res.json({
                id: user.id_wisatawan,
                name: user.username,
                email: user.email
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error" });
    }
};

// ==========================================
// 3. FUNGSI UMUM (LOGOUT & OTP)
// ==========================================

const logOut = async (req, res) => {
    // Logout universal (hapus kedua jenis cookie)
    const refreshTokenUser = req.cookies.refreshToken;
    const refreshTokenAdmin = req.cookies.tokenadmin;

    if (refreshTokenUser) {
        await tbl_Wisatawan.update({ refresh_token: null }, { where: { refresh_token: refreshTokenUser } });
        res.clearCookie('refreshToken');
    }
    
    if (refreshTokenAdmin) {
        // Cari admin yg punya token ini, lalu null-kan
        const admin = await tbl_Admin.findOne({ where: { refresh_token: refreshTokenAdmin } });
        if(admin) {
             await tbl_Admin.update({ refresh_token: null }, { where: { id_admin: admin.id_admin } });
        }
        res.clearCookie('tokenadmin');
    }

    return res.sendStatus(200);
};

// Placeholder agar tidak crash (jika Anda belum implementasi OTP)
const sendOtp = async (req, res) => {
    res.status(501).json({ msg: "Fitur OTP belum diimplementasikan sepenuhnya di controller gabungan ini." });
};

const VerifOtp = async (req, res) => {
    res.status(501).json({ msg: "Fitur Verif OTP belum diimplementasikan." });
};

// ==========================================
// 4. EXPORT SEMUA (WAJIB ADA)
// ==========================================
module.exports = {
    Login,
    Me,
    logOut,
    sendOtp,
    VerifOtp,
    LoginAdmin,
    MeAdmin
};