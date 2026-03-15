require('dotenv').config();
require('./controllers/hciScheduler');
require('./controllers/resendPingScheduler');
require('./controllers/hciCleanerScheduler');

const express = require("express");
const app = express();
// === TAMBAHAN UNTUK CEK SERVER ===
app.get('/cek-hidup', (req, res) => {
    res.send('Server Hidup & Kode Baru Terbaca!');
});
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// ✅ Import Route Utama dan Route Transaksi (Midtrans)
const route = require('./routes/route');
// Tambahkan '/api' di tengah path
const r_Transaksi = require('./routes/api/r_Transaksi'); // <--- TAMBAHAN: Import file route transaksi

const { tbl_hcihistory } = require('./models');
const { Op } = require('sequelize');
const cron = require('node-cron');
const moment = require('moment-timezone');

//Local---------------------------------------------------------
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});
//--------------------------------------------------------------

//Local---------------------------------------------------------
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});
//--------------------------------------------------------------

// ✅ ===== MIDDLEWARE URUTAN WAJIB =====

// 1️⃣ CORS harus paling atas sebelum route apapun
app.use(cors({
  origin: [
    "https://gomadiun.tifpsdku.com",
    "http://localhost:3003",
    "http://localhost:3002",
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:3003",
    "https://pengelolagomadiun.tifpsdku.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// 2️⃣ Handle preflight request (OPTIONS)
app.options("*", cors({
  origin: [
    "https://gomadiun.tifpsdku.com",
    "http://localhost:3003",
    "http://localhost:3002",
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:3003",
    "https://pengelolagomadiun.tifpsdku.com",
  ],
  credentials: true,
}));

// 3️⃣ Middleware umum
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', r_Transaksi); 
// ✅ Routes
app.use(route); // Route bawaan Anda


// ✅ Default route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome server GoMadiun",
  });
});

// ✅ Static file (harus setelah route agar tidak tertimpa)
app.use('/uploads/img/profile', express.static('uploads/img/profile'));
app.use('/uploads/geojson', express.static('uploads/geojson'));
app.use('/uploads/img/desawisata', express.static('uploads/img/desawisata'));
app.use('/uploads/img/wisata', express.static('uploads/img/wisata'));
app.use('/uploads/img/paket_wisata', express.static('uploads/img/paket_wisata'));
app.use('/uploads/img/kuliner', express.static('uploads/img/kuliner'));
app.use('/uploads/img/penginapan', express.static('uploads/img/penginapan'));
app.use('/uploads/img/penginapan/gallery', express.static('uploads/img/penginapan/gallery'));
app.use('/uploads/img/menu', express.static('uploads/img/menu'));
app.use('/uploads/img/banerInfo', express.static('uploads/img/banerInfo'));
app.use('/uploads/img/berita', express.static('uploads/img/berita'));
// HOSTING------------------------
// app.use('/uploads/img/virtual-tour', express.static('uploads/img/virtual-tour'));
//--------------------------------

//Local-------------------------------------------------------------------------------
app.use('/uploads/img/virtual-tour', express.static('uploads/img/virtual-tour', {
  setHeaders: (res) => {
    // Memberikan izin akses khusus untuk frontend kamu
    res.set('Access-Control-Allow-Origin', 'http://localhost:3002'); 
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    // Mematikan cache sementara agar tidak muncul error 304 saat pengembangan
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }
}));
//------------------------------------------------------------------------------------------
// HOSTING------------------------
// app.use('/uploads/img/virtual-tour', express.static('uploads/img/virtual-tour'));
//--------------------------------

//Local-------------------------------------------------------------------------------
app.use('/uploads/img/virtual-tour', express.static('uploads/img/virtual-tour', {
  setHeaders: (res) => {
    // Memberikan izin akses khusus untuk frontend kamu
    res.set('Access-Control-Allow-Origin', 'http://localhost:3002'); 
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    // Mematikan cache sementara agar tidak muncul error 304 saat pengembangan
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }
}));
//------------------------------------------------------------------------------------------

// ✅ Jalankan server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});

// 🧹 Jadwal pembersihan otomatis HCI (opsional aktifkan kembali jika dibutuhkan)
/*
cron.schedule('55 23 * * *', async () => {
  const batasTanggal = moment().tz('Asia/Jakarta').subtract(2, 'days').format('YYYY-MM-DD');
  try {
    const deleted = await tbl_HCIHistory.destroy({
      where: {
        tanggal: {
          [Op.lt]: batasTanggal
        }
      }
    });
    console.log(`🧹 Pembersihan HCI: ${deleted} data lebih dari 2 hari dihapus`);
  } catch (err) {
    console.error('❌ Gagal menghapus data HCI lama:', err);
  }
}, {
  timezone: 'Asia/Jakarta'
});
*/