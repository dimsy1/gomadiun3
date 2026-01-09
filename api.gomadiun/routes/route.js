const router = require("express").Router();
const r_Auth = require("./api/r_Auth");
const r_wisatawan = require("./api/r_Wisatawan");
const r_Desawisata = require("./api/r_Desawisata");
const r_Kecamatan = require("./api/r_Kecamatan");
const r_berita = require("./api/r_berita");
const r_hci = require("./api/r_hci");
const r_Korelasi = require("./api/r_Korelasi");
const r_Wisata = require("./api/r_Wisata");
const r_Paket_Wisata = require("./api/r_Paket_Wisata");
const r_Kuliner = require("./api/r_Kuliner");
const r_Kategori_Kuliner = require("./api/r_Kategori_Menu_Kuliner ");
const r_Menu_Kuliner = require("./api/r_Menu_Kuliner");
const r_Penginapan = require("./api/r_Penginapan");
const r_Pesanan = require("./api/r_Transaksi");
const r_Admin = require("./api/r_Admin");
const r_Pengelola = require("./api/r_Pengelola");
const r_pengunjung = require("./api/r_DataPengunjung");
const r_Dashboard = require("./api/r_Dashboard");


router.use("/api",r_Dashboard, r_pengunjung, r_Pengelola, r_Admin, r_wisatawan, r_Auth, r_Desawisata, r_Kecamatan, r_berita, r_hci, r_Korelasi, r_Wisata, r_Kuliner, r_Penginapan, r_Kategori_Kuliner, r_Menu_Kuliner, r_Pesanan, r_Paket_Wisata);

module.exports = router;