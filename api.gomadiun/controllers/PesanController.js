const db = require("../models");
const tbl_detail_pesanan = db.tbl_detail_pesanan;
const tbl_data_pengunjung = db.tbl_data_pengunjung;
const tbl_pesanan = db.tbl_pesanan;
const tbl_Wisata = db.tbl_Wisata;
const tbl_Paket_wisata = db.tbl_Paket_wisata;
const tbl_Kuliner = db.tbl_Kuliner;
const tbl_Kamar = db.tbl_Kamar;
const tbl_Penginapan = db.tbl_Penginapan;
const tbl_Gallery = db.tbl_Gallery;
const tbl_Paket_homestay = db.tbl_Paket_homestay;
const tbl_Menu = db.tbl_Menu;
const tbl_pembayaran = db.tbl_pembayaran;
const tbl_Wisatawan = db.tbl_Wisatawan;
const Sequelize = require("sequelize");
const { sequelize } = require("../models/index"); // pastikan path ke models/index.js sesuai
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const crypto = require("crypto");
const axios = require("axios");
const midtransClient = require("midtrans-client"); // Pastikan midtrans-client sudah terinstall
const { v4: uuidv4 } = require("uuid"); // Untuk generate order_id unik

require("dotenv").config();
const get_all_keranjang = async (req, res) => {
  try {
    const token = req.cookies.refreshtoken;
    if (!token) return res.status(401).json({ msg: "Akun Belum Login!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_wisatawan = decoded.id;

    const data = await tbl_pesanan.findAndCountAll({
      where: {
        id_wisatawan,
        status_pesanan: "keranjang",
      },
      attributes: [
        "id_pesanan",
        "id_pembayaran",
        "id_wisatawan",
        "id_destinasi",
        "nama_destinasi",
        "kode_pesanan",
        "kode_qr",
        "tgl_booking",
        "total_pesanan",
        "status_pesanan",
        "createdAt",
        "updatedAt",
      ],
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Keranjang masih kosong",
        data: null,
      });
    }

    const results = await Promise.all(
      data.rows.map(async (pesanan) => {
        let detail_destinasi = null;
        let detail_pesanan = []; // Tentukan tabel destinasi

        if (pesanan.nama_destinasi === "tbl_destinasi") {
          detail_destinasi = await tbl_Wisata.findOne({
            where: { id_wisata: pesanan.id_destinasi },
            attributes: ["id_wisata", "nama_destinasi", "sampul_destinasi"],
          });

          detail_pesanan = await tbl_detail_pesanan.findAll({
            where: { id_pesanan: pesanan.id_pesanan },
            attributes: [
              "id_detail_pesanan",
              "id_menu",
              "nama_menu",
              "jumlah",
              "harga_satuan",
            ],
            include: [
              {
                model: tbl_Wisata,
                as: "tiket_detail_as",
                attributes: [
                  "id_wisata",
                  "nama_destinasi",
                  "harga_tiket",
                  "sampul_destinasi",
                ],
                required: false,
              },
            ],
          });
        } else if (pesanan.nama_destinasi === "tbl_Paket_wisata") {
          detail_destinasi = await tbl_Paket_wisata.findOne({
            where: { id_paket_wisata: pesanan.id_destinasi },
            attributes: [
              "id_paket_wisata",
              "nama_paket_wisata",
              "sampul_paket_wisata",
            ],
          });

          detail_pesanan = await tbl_detail_pesanan.findAll({
            where: { id_pesanan: pesanan.id_pesanan },
            attributes: [
              "id_detail_pesanan",
              "id_menu",
              "nama_menu",
              "jumlah",
              "harga_satuan",
            ],
            include: [
              {
                model: tbl_Paket_wisata,
                as: "paket_wisata_detail_as",
                attributes: [
                  "id_paket_wisata",
                  "nama_paket_wisata",
                  "harga_paket_wisata",
                  "sampul_paket_wisata",
                ],
                required: false,
              },
            ],
          });
        } else if (pesanan.nama_destinasi === "tbl_Penginapan") {
          detail_destinasi = await tbl_Penginapan.findOne({
            where: { id_penginapan: pesanan.id_destinasi },
            attributes: [
              "id_penginapan",
              "nama_penginapan",
              "sampul_penginapan",
            ],
          });

          detail_pesanan = await tbl_detail_pesanan.findAll({
            where: { id_pesanan: pesanan.id_pesanan },
            attributes: [
              "id_detail_pesanan",
              "id_menu",
              "nama_menu",
              "jumlah",
              "harga_satuan",
            ],
            include: [
              {
                model: tbl_Kamar,
                as: "kamar_detail_as",
                attributes: ["id_kamar", "nama_kamar", "harga", "sampul_kamar"],
                required: false,
              },
              {
                model: tbl_Paket_homestay,
                as: "homestay_detail_as",
                attributes: [
                  "id_paket_homestay",
                  "nama_paket_homestay",
                  "harga",
                  "sampul_paket_homestay",
                ],
                required: false,
              },
            ],
          });
        } else if (pesanan.nama_destinasi === "tbl_Kuliner") {
          detail_destinasi = await tbl_Kuliner.findOne({
            where: { id_kuliner: pesanan.id_destinasi },
            attributes: ["id_kuliner", "nama_kuliner", "sampul_kuliner"],
          });

          detail_pesanan = await tbl_detail_pesanan.findAll({
            where: { id_pesanan: pesanan.id_pesanan },
            attributes: [
              "id_detail_pesanan",
              "id_menu",
              "nama_menu",
              "jumlah",
              "harga_satuan",
            ],
            include: [
              {
                model: tbl_Menu,
                as: "menu_detail_as",
                attributes: [
                  "id_menu",
                  "nama_menu",
                  "harga_menu",
                  "sampul_menu",
                ],
                required: false,
              },
            ],
          });
        }

        return {
          id_pesanan: pesanan.id_pesanan,
          id_pembayaran: pesanan.id_pembayaran,
          id_destinasi: pesanan.id_destinasi,
          kode_pesanan: pesanan.kode_pesanan,
          kode_qr: pesanan.kode_qr,
          tgl_booking: pesanan.tgl_booking,
          total_pesanan: pesanan.total_pesanan,
          jenis_destinasi: pesanan.nama_destinasi,
          nama_destinasi:
            detail_destinasi?.nama_destinasi ||
            detail_destinasi?.nama_kuliner ||
            detail_destinasi?.nama_penginapan ||
            detail_destinasi?.nama_paket_wisata ||
            "Tidak diketahui",
          detail_pesanan: detail_pesanan.map((items) => ({
            id_detail_pesanan: items.id_detail_pesanan,
            id_menu: items.id_menu,
            nama_menu: items.tiket_detail_as
              ? "Tiket " + items.tiket_detail_as.nama_destinasi
              : items.menu_detail_as
                ? items.menu_detail_as.nama_menu
                : items.kamar_detail_as
                  ? items.kamar_detail_as.nama_kamar
                  : items.paket_wisata_detail_as
                    ? items.paket_wisata_detail_as.nama_paket_wisata
                    : items.homestay_detail_as
                      ? items.homestay_detail_as.nama_paket_homestay
                      : null,
            jumlah: items.jumlah,
            harga_satuan: items.harga_satuan,
            sampul_menu:
              items.tiket_detail_as?.sampul_destinasi ||
              items.menu_detail_as?.sampul_menu ||
              items.kamar_detail_as?.sampul_kamar ||
              items.paket_wisata_detail_as?.sampul_paket_wisata ||
              items.homestay_detail_as?.sampul_paket_homestay ||
              null,
          })),
        };
      }),
    );

    const totalSum = await tbl_pesanan.sum("total_pesanan", {
      where: { id_wisatawan, status_pesanan: "keranjang" },
    });

    const biaya_admin = 0;
    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: [
        {
          detail_transaksi: [
            {
              total_pemesanan: totalSum,
              biaya_admin,
              total_pembayaran: totalSum + biaya_admin,
            },
          ],
          list_keranjang: results,
        },
      ],
    };

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const post_newAddTocart_tiket = async (req, res) => {
  const generateRandomCodePemesanan = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  try {
    let id_wisatawan;

    const token = req.cookies?.refreshToken || req.cookies?.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res
        .status(401)
        .json({ msg: "Sesi login tidak valid atau sudah kadaluarsa!" });
    }

    id_wisatawan = decoded.id;

    const { id_menu, id_destinasi, jumlah, date } = req.body;

    if (!date) {
      return res.status(422).json({ message: "Pilih tanggal booking", token });
    }

    const whereClause = {
      [Op.and]: [
        { id_destinasi: id_destinasi },
        { id_wisatawan: id_wisatawan },
        { nama_destinasi: "tbl_destinasi" },
        { status_pesanan: "keranjang" },
      ],
    };

    const ExistTicket = await tbl_pesanan.findOne({
      where: whereClause,
    });

    if (ExistTicket) {
      const ExistDetailPesanan = await tbl_detail_pesanan.findOne({
        where: {
          id_pesanan: ExistTicket.id_pesanan,
        },
      });

      await ExistDetailPesanan.update({
        jumlah: jumlah || ExistDetailPesanan.jumlah,
        updatedAt:
          moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
          ExistDetailPesanan.updatedAt,
      });

      const data_menu = await tbl_Wisata.findOne({
        where: {
          id_wisata: id_menu,
        },
      });

      const harga_satuan = data_menu.harga_tiket * jumlah;

      await ExistTicket.update({
        total_pesanan: harga_satuan || ExistTicket.total_pesanan,
        updatedAt:
          moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
          ExistTicket.updatedAt,
      });

      return res.status(200).json({
        status: 200,
        success: true,
        message: "Pesanan Berhasil Diperbarui",
        data: {
          data: ExistDetailPesanan,
        },
      });
    } else {
      const generateKodeQR = (kodePesanan, date, idWisatawan) => {
        const formattedDate = `T${new Date(date).getDate()}`;
        const formattedIdWisatawan = `ID${idWisatawan}`;
        return `QR${formattedIdWisatawan[2]}${formattedIdWisatawan.slice(-1)}${kodePesanan}${formattedDate}${formattedIdWisatawan}`;
      };

      const kode_pesanan = `KPT${generateRandomCodePemesanan()}`;
      const kode_qr = generateKodeQR(kode_pesanan, date, id_wisatawan);

      const data = await tbl_pesanan.create({
        id_wisatawan: id_wisatawan,
        id_destinasi: id_destinasi,
        nama_destinasi: "tbl_destinasi",
        kode_pesanan: kode_pesanan,
        kode_qr: kode_qr,
        tgl_booking: date,
        status_pesanan: "keranjang",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
      });

      if (data) {
        const data_menu = await tbl_Wisata.findOne({
          where: {
            id_wisata: id_menu,
          },
        });

        const harga_satuan = data_menu.harga_tiket * jumlah;

        const add_menu = await tbl_detail_pesanan.create({
          id_pesanan: data.id_pesanan,
          id_menu: id_menu,
          nama_menu: "tbl_destinasi",
          jumlah: jumlah,
          harga_satuan: data_menu.harga_tiket,
          createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        });

        if (add_menu) {
          await data.update({
            total_pesanan: harga_satuan || data.total_pesanan,
            updatedAt:
              moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
              data.updatedAt,
          });

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Ditambahkan",
            data: {
              data: [data, add_menu],
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error pada post_newAddTocart_tiket:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "internal server error",
      data: null,
      error: "Internal Server Error",
    });
  }
};

const post_newAddTocart_paketwisata = async (req, res) => {
  const generateRandomCodePemesanan = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_menu, id_destinasi, jumlah, date } = req.body;

    if (!date) {
      return res.status(422).json({ message: "Pilih tanggal booking", token });
    }

    const whereClause = {
      [Op.and]: [
        { id_destinasi: id_destinasi },
        { id_wisatawan: id_wisatawan },
        { nama_destinasi: "tbl_Paket_wisata" },
        { status_pesanan: "keranjang" },
      ],
    };

    const ExistTicket = await tbl_pesanan.findOne({
      where: whereClause,
    });

    if (ExistTicket) {
      const ExistDetailPesanan = await tbl_detail_pesanan.findOne({
        where: {
          id_pesanan: ExistTicket.id_pesanan,
        },
      });

      await ExistDetailPesanan.update({
        jumlah: jumlah || ExistDetailPesanan.jumlah,
        updatedAt:
          moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
          ExistDetailPesanan.updatedAt,
      });

      const data_menu = await tbl_Paket_wisata.findOne({
        where: {
          id_paket_wisata: id_menu,
        },
      });

      const harga_satuan = data_menu.harga_paket_wisata * jumlah;

      await ExistTicket.update({
        total_pesanan: harga_satuan || ExistTicket.total_pesanan,
        updatedAt:
          moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
          ExistTicket.updatedAt,
      });

      return res.status(200).json({
        status: 200,
        success: true,
        message: "Pesanan Berhasil Diperbarui",
        data: {
          data: ExistDetailPesanan,
        },
      });
    } else {
      const generateKodeQR = (kodePesanan, date, idWisatawan) => {
        const formattedDate = `T${new Date(date).getDate()}`;
        const formattedIdWisatawan = `ID${idWisatawan}`;
        return `QR${formattedIdWisatawan[2]}${formattedIdWisatawan.slice(-1)}${kodePesanan}${formattedDate}${formattedIdWisatawan}`;
      };

      const kode_pesanan = `KPT${generateRandomCodePemesanan()}`;
      const kode_qr = generateKodeQR(kode_pesanan, date, id_wisatawan);

      const data = await tbl_pesanan.create({
        id_wisatawan: id_wisatawan,
        id_destinasi: id_destinasi,
        nama_destinasi: "tbl_Paket_wisata",
        kode_pesanan: kode_pesanan,
        kode_qr: kode_qr,
        tgl_booking: date,
        status_pesanan: "keranjang",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
      });

      if (data) {
        const data_menu = await tbl_Paket_wisata.findOne({
          where: {
            id_paket_wisata: id_menu,
          },
        });

        const harga_satuan = data_menu.harga_paket_wisata * jumlah;

        const add_menu = await tbl_detail_pesanan.create({
          id_pesanan: data.id_pesanan,
          id_menu: id_menu,
          nama_menu: "tbl_Paket_wisata",
          jumlah: jumlah,
          harga_satuan: data_menu.harga_paket_wisata,
          createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        });

        if (add_menu) {
          await data.update({
            total_pesanan: harga_satuan || data.total_pesanan,
            updatedAt:
              moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
              data.updatedAt,
          });

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Ditambahkan",
            data: {
              data: [data, add_menu],
            },
          });
        }
      }
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

const post_newAddTocart_kamar = async (req, res) => {
  const generateRandomCodePemesanan = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_menu, id_destinasi, jumlah, date } = req.body;

    if (!date) {
      return res.status(422).json({ message: "Pilih tanggal booking", token });
    }

    const whereClause = {
      [Op.and]: [
        { id_destinasi: id_destinasi },
        { id_wisatawan: id_wisatawan },
        { nama_destinasi: "tbl_Penginapan" },
        { status_pesanan: "keranjang" },
      ],
    };

    const ExistTicket = await tbl_pesanan.findOne({
      where: whereClause,
    });

    if (ExistTicket) {
      const ExistDetailPesanan = await tbl_detail_pesanan.findOne({
        where: {
          [Op.and]: [
            { id_pesanan: ExistTicket.id_pesanan },
            { id_menu: id_menu },
            { nama_menu: "tbl_Kamar" },
          ],
        },
      });

      if (ExistDetailPesanan) {
        const data_menu = await tbl_Kamar.findOne({
          where: {
            id_kamar: id_menu,
          },
        });

        const harga_satuan = data_menu.harga * jumlah;
        const harga_satuan_sebelumnya =
          data_menu.harga * ExistDetailPesanan.jumlah;
        const total_harga_sebelumnya = ExistTicket.total_pesanan;
        const hitung = total_harga_sebelumnya - harga_satuan_sebelumnya;
        const update_total_harga_sekarang = hitung + harga_satuan;

        await ExistDetailPesanan.update({
          jumlah: jumlah || ExistDetailPesanan.jumlah,
          updatedAt:
            moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
            ExistDetailPesanan.updatedAt,
        });

        await ExistTicket.update({
          total_pesanan:
            update_total_harga_sekarang || ExistTicket.total_pesanan,
          updatedAt:
            moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
            ExistTicket.updatedAt,
        });

        return res.status(200).json({
          status: 200,
          success: true,
          message: "Pesanan Berhasil Diperbarui",
          data: {
            data: ExistDetailPesanan,
          },
        });
      } else {
        const data_menu = await tbl_Kamar.findOne({
          where: {
            id_kamar: id_menu,
          },
        });

        const add_menu = await tbl_detail_pesanan.create({
          id_pesanan: ExistTicket.id_pesanan,
          id_menu: id_menu,
          nama_menu: "tbl_Kamar",
          jumlah: jumlah,
          harga_satuan: data_menu.harga,
          createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        });

        if (add_menu) {
          const harga_satuan = data_menu.harga * jumlah;
          const total_harga_sebelumnya = ExistTicket.total_pesanan;
          const update_total_harga_sekarang =
            total_harga_sebelumnya + harga_satuan;

          await ExistTicket.update({
            total_pesanan:
              update_total_harga_sekarang || ExistTicket.total_pesanan,
          });

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Ditambahkan",
            data: {
              data: [ExistTicket, add_menu],
            },
          });
        }
      }
    } else {
      const generateKodeQR = (kodePesanan, date, idWisatawan) => {
        const formattedDate = `T${new Date(date).getDate()}`;
        const formattedIdWisatawan = `ID${idWisatawan}`;
        return `QR${formattedIdWisatawan[2]}${formattedIdWisatawan.slice(-1)}${kodePesanan}${formattedDate}${formattedIdWisatawan}`;
      };

      const kode_pesanan = `KPT${generateRandomCodePemesanan()}`;
      const kode_qr = generateKodeQR(kode_pesanan, date, id_wisatawan);

      const data = await tbl_pesanan.create({
        id_wisatawan: id_wisatawan,
        id_destinasi: id_destinasi,
        nama_destinasi: "tbl_Penginapan",
        kode_pesanan: kode_pesanan,
        kode_qr: kode_qr,
        tgl_booking: date,
        status_pesanan: "keranjang",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
      });

      if (data) {
        const data_menu = await tbl_Kamar.findOne({
          where: {
            id_kamar: id_menu,
          },
        });

        const harga_satuan = data_menu.harga * jumlah;

        const add_menu = await tbl_detail_pesanan.create({
          id_pesanan: data.id_pesanan,
          id_menu: id_menu,
          nama_menu: "tbl_Kamar",
          jumlah: jumlah,
          harga_satuan: data_menu.harga,
          createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        });

        if (add_menu) {
          await data.update({
            total_pesanan: harga_satuan || data.total_pesanan,
            updatedAt:
              moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
              data.updatedAt,
          });

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Ditambahkan",
            data: {
              data: [data, add_menu],
            },
          });
        }
      }
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

const post_newAddTocart_homestay = async (req, res) => {
  const generateRandomCodePemesanan = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  try {
    let id_wisatawan;
    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_menu, id_destinasi, jumlah, date } = req.body;

    if (!date) {
      return res.status(422).json({ message: "Pilih tanggal booking", token });
    }

    const whereClause = {
      [Op.and]: [
        { id_destinasi: id_destinasi },
        { id_wisatawan: id_wisatawan },
        { nama_destinasi: "tbl_Penginapan" },
        { status_pesanan: "keranjang" },
      ],
    };

    const ExistTicket = await tbl_pesanan.findOne({ where: whereClause });

    if (ExistTicket) {
      const ExistDetailPesanan = await tbl_detail_pesanan.findOne({
        where: {
          [Op.and]: [
            { id_pesanan: ExistTicket.id_pesanan },
            { id_menu: id_menu },
            { nama_menu: "tbl_Paket_homestay" },
          ],
        },
      });

      if (ExistDetailPesanan) {
        const data_menu = await tbl_Paket_homestay.findOne({
          where: { id_paket_homestay: id_menu },
        });

        const harga_satuan = data_menu.harga * jumlah;
        const harga_satuan_sebelumnya =
          data_menu.harga * ExistDetailPesanan.jumlah;
        const total_harga_sebelumnya = ExistTicket.total_pesanan;
        const hitung = total_harga_sebelumnya - harga_satuan_sebelumnya;
        const update_total_harga_sekarang = hitung + harga_satuan;

        await ExistDetailPesanan.update({
          jumlah: jumlah || ExistDetailPesanan.jumlah,
          updatedAt:
            moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
            ExistDetailPesanan.updatedAt,
        });

        await ExistTicket.update({
          total_pesanan:
            update_total_harga_sekarang || ExistTicket.total_pesanan,
          updatedAt:
            moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
            ExistTicket.updatedAt,
        });

        return res.status(200).json({
          status: 200,
          success: true,
          message: "Pesanan Berhasil Diperbarui",
          data: {
            data: ExistDetailPesanan,
            nama_menu: data_menu.nama_paket_homestay, // Tambahkan nama_menu
            sampul_menu: data_menu.sampul_paket_homestay, // Tambahkan sampul_menu
          },
        });
      } else {
        const data_menu = await tbl_Paket_homestay.findOne({
          where: { id_paket_homestay: id_menu },
        });

        const add_menu = await tbl_detail_pesanan.create({
          id_pesanan: ExistTicket.id_pesanan,
          id_menu: id_menu,
          nama_menu: "tbl_Paket_homestay",
          jumlah: jumlah,
          harga_satuan: data_menu.harga,
          createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        });

        if (add_menu) {
          const harga_satuan = data_menu.harga * jumlah;
          const total_harga_sebelumnya = ExistTicket.total_pesanan;
          const update_total_harga_sekarang =
            total_harga_sebelumnya + harga_satuan;

          await ExistTicket.update({
            total_pesanan:
              update_total_harga_sekarang || ExistTicket.total_pesanan,
          });

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Ditambahkan",
            data: {
              data: [ExistTicket, add_menu],
              nama_menu: data_menu.nama_paket_homestay, // Tambahkan nama_menu
              sampul_menu: data_menu.sampul_paket_homestay, // Tambahkan sampul_menu
            },
          });
        }
      }
    } else {
      const generateKodeQR = (kodePesanan, date, idWisatawan) => {
        const formattedDate = `T${new Date(date).getDate()}`;
        const formattedIdWisatawan = `ID${idWisatawan}`;
        return `QR${formattedIdWisatawan[2]}${formattedIdWisatawan.slice(-1)}${kodePesanan}${formattedDate}${formattedIdWisatawan}`;
      };

      const kode_pesanan = `KPT${generateRandomCodePemesanan()}`;
      const kode_qr = generateKodeQR(kode_pesanan, date, id_wisatawan);

      const data = await tbl_pesanan.create({
        id_wisatawan: id_wisatawan,
        id_destinasi: id_destinasi,
        nama_destinasi: "tbl_Penginapan",
        kode_pesanan: kode_pesanan,
        kode_qr: kode_qr,
        tgl_booking: date,
        status_pesanan: "keranjang",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
      });

      if (data) {
        const data_menu = await tbl_Paket_homestay.findOne({
          where: { id_paket_homestay: id_menu },
        });

        const harga_satuan = data_menu.harga * jumlah;

        const add_menu = await tbl_detail_pesanan.create({
          id_pesanan: data.id_pesanan,
          id_menu: id_menu,
          nama_menu: "tbl_Paket_homestay",
          jumlah: jumlah,
          harga_satuan: data_menu.harga,
          createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        });

        if (add_menu) {
          await data.update({
            total_pesanan: harga_satuan || data.total_pesanan,
            updatedAt:
              moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
              data.updatedAt,
          });

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Ditambahkan",
            data: {
              data: [data, add_menu],
              nama_menu: data_menu.nama_paket_homestay, // Tambahkan nama_menu
              sampul_menu: data_menu.sampul_paket_homestay, // Tambahkan sampul_menu
            },
          });
        }
      }
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

const post_newAddTocart_menu = async (req, res) => {
  const generateRandomCodePemesanan = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_menu, id_destinasi, jumlah, date } = req.body;

    if (!date) {
      return res.status(422).json({ message: "Pilih tanggal booking", token });
    }

    const whereClause = {
      [Op.and]: [
        { id_destinasi: id_destinasi },
        { id_wisatawan: id_wisatawan },
        { nama_destinasi: "tbl_Kuliner" },
        { status_pesanan: "keranjang" },
      ],
    };

    const ExistTicket = await tbl_pesanan.findOne({
      where: whereClause,
    });

    if (ExistTicket) {
      const ExistDetailPesanan = await tbl_detail_pesanan.findOne({
        where: {
          [Op.and]: [
            { id_pesanan: ExistTicket.id_pesanan },
            { id_menu: id_menu },
            { nama_menu: "tbl_Menu" },
          ],
        },
      });

      if (ExistDetailPesanan) {
        const data_menu = await tbl_Menu.findOne({
          where: {
            id_menu: id_menu,
          },
        });

        const harga_satuan = data_menu.harga_menu * jumlah;
        const harga_satuan_sebelumnya =
          data_menu.harga_menu * ExistDetailPesanan.jumlah;
        const total_harga_sebelumnya = ExistTicket.total_pesanan;
        const hitung = total_harga_sebelumnya - harga_satuan_sebelumnya;
        const update_total_harga_sekarang = hitung + harga_satuan;

        await ExistDetailPesanan.update({
          jumlah: jumlah || ExistDetailPesanan.jumlah,
          updatedAt:
            moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
            ExistDetailPesanan.updatedAt,
        });

        await ExistTicket.update({
          total_pesanan:
            update_total_harga_sekarang || ExistTicket.total_pesanan,
          updatedAt:
            moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss") ||
            ExistTicket.updatedAt,
        });

        return res.status(200).json({
          status: 200,
          success: true,
          message: "Pesanan Berhasil Diperbarui",
          data: {
            data: ExistDetailPesanan,
          },
        });
      } else {
        const data_menu = await tbl_Menu.findOne({
          where: {
            id_menu: id_menu,
          },
        });

        const add_menu = await tbl_detail_pesanan.create({
          id_pesanan: ExistTicket.id_pesanan,
          id_menu: id_menu,
          nama_menu: "tbl_Menu",
          jumlah: jumlah,
          harga_satuan: data_menu.harga_menu,
          createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        });

        if (add_menu) {
          const harga_satuan = data_menu.harga_menu * jumlah;
          const total_harga_sebelumnya = ExistTicket.total_pesanan;
          const update_total_harga_sekarang =
            total_harga_sebelumnya + harga_satuan;

          await ExistTicket.update({
            total_pesanan:
              update_total_harga_sekarang || ExistTicket.total_pesanan,
          });

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Ditambahkan",
            data: {
              data: [ExistTicket, add_menu],
            },
          });
        }
      }
    } else {
      const generateKodeQR = (kodePesanan, date, idWisatawan) => {
        const formattedDate = `T${new Date(date).getDate()}`;
        const formattedIdWisatawan = `ID${idWisatawan}`;
        return `QR${formattedIdWisatawan[2]}${formattedIdWisatawan.slice(-1)}${kodePesanan}${formattedDate}${formattedIdWisatawan}`;
      };

      const kode_pesanan = `KPM${generateRandomCodePemesanan()}`;
      const kode_qr = generateKodeQR(kode_pesanan, date, id_wisatawan);

      const data = await tbl_pesanan.create({
        id_wisatawan: id_wisatawan,
        id_destinasi: id_destinasi,
        nama_destinasi: "tbl_Kuliner",
        kode_pesanan: kode_pesanan,
        kode_qr: kode_qr,
        tgl_booking: date,
        status_pesanan: "keranjang",
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
      });

      if (data) {
        const data_menu = await tbl_Menu.findOne({
          where: {
            id_menu: id_menu,
          },
        });

        const harga_satuan = data_menu.harga_menu * jumlah;

        const add_menu = await tbl_detail_pesanan.create({
          id_pesanan: data.id_pesanan,
          id_menu: id_menu,
          nama_menu: "tbl_Menu",
          jumlah: jumlah,
          harga_satuan: data_menu.harga_menu,
          createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        });

        if (add_menu) {
          await data.update({
            total_pesanan: harga_satuan || data.total_pesanan,
          });

          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Ditambahkan",
            data: {
              data: [data, add_menu],
            },
          });
        }
      }
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

const remove_cart = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_detail_pesanan } = req.params;

    if (!id_detail_pesanan) {
      return res.status(400).send({ error: "id_detail_pesanan is required" });
    }

    const ExistMenu = await tbl_detail_pesanan.findOne({
      where: { id_detail_pesanan },
    });

    if (!ExistMenu) {
      return res.status(422).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (ExistMenu.nama_menu === "tbl_destinasi") {
      const delete_pesanan = await tbl_pesanan.destroy({
        where: { id_pesanan: ExistMenu.id_pesanan },
      });

      if (delete_pesanan) {
        const delete_menu = await tbl_detail_pesanan.destroy({
          where: { id_detail_pesanan },
        });

        if (delete_menu) {
          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Dihapus",
          });
        }
      }
    } else if (ExistMenu.nama_menu === "tbl_Paket_wisata") {
      const delete_pesanan = await tbl_pesanan.destroy({
        where: { id_pesanan: ExistMenu.id_pesanan },
      });

      if (delete_pesanan) {
        const delete_menu = await tbl_detail_pesanan.destroy({
          where: { id_detail_pesanan },
        });

        if (delete_menu) {
          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Dihapus",
          });
        }
      }
    } else if (ExistMenu.nama_menu === "tbl_Kamar") {
      const delete_pesanan = await tbl_pesanan.destroy({
        where: { id_pesanan: ExistMenu.id_pesanan },
      });

      if (delete_pesanan) {
        const delete_menu = await tbl_detail_pesanan.destroy({
          where: { id_detail_pesanan },
        });

        if (delete_menu) {
          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Dihapus",
          });
        }
      }
    } else if (ExistMenu.nama_menu === "tbl_Paket_homestay") {
      const delete_pesanan = await tbl_pesanan.destroy({
        where: { id_pesanan: ExistMenu.id_pesanan },
      });

      if (delete_pesanan) {
        const delete_menu = await tbl_detail_pesanan.destroy({
          where: { id_detail_pesanan },
        });

        if (delete_menu) {
          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Dihapus",
          });
        }
      }
    } else if (ExistMenu.nama_menu === "tbl_Menu") {
      const cekmenu = await tbl_detail_pesanan.findAndCountAll({
        where: { id_pesanan: ExistMenu.id_pesanan },
      });

      if (cekmenu.count === 1) {
        const check_pesanan = await tbl_pesanan.findOne({
          where: { id_pesanan: ExistMenu.id_pesanan },
        });

        if (check_pesanan) {
          const delete_pesanan = await tbl_pesanan.destroy({
            where: { id_pesanan: check_pesanan.id_pesanan },
          });

          if (delete_pesanan) {
            const delete_menu = await tbl_detail_pesanan.destroy({
              where: { id_detail_pesanan },
            });

            if (delete_menu) {
              return res.status(200).json({
                status: 200,
                success: true,
                message: "Pesanan Berhasil Dihapus",
              });
            }
          }
        } else {
          return res.status(422).json({
            success: false,
            message: "Pesanan not found",
          });
        }
      } else {
        const data_pesanan = await tbl_pesanan.findOne({
          where: { id_pesanan: ExistMenu.id_pesanan },
        });

        const harga_menu = ExistMenu.harga_satuan * ExistMenu.jumlah;
        const total_harga_sebelumnya = data_pesanan.total_pesanan;
        const update_total_harga_sekarang = total_harga_sebelumnya - harga_menu;

        await data_pesanan.update({
          total_pesanan:
            update_total_harga_sekarang || data_pesanan.total_pesanan,
        });

        const delete_menu = await tbl_detail_pesanan.destroy({
          where: { id_detail_pesanan },
        });

        if (delete_menu) {
          return res.status(200).json({
            status: 200,
            success: true,
            message: "Pesanan Berhasil Dihapus",
          });
        }
      }
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

const CheckExistKeranjangPesanan = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const { filter = {} } = req.query;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const whereClause = {
      [Op.and]: [
        { id_wisatawan: id_wisatawan },
        { status_pesanan: "keranjang" },
      ],
    };

    const whereClausemenu = {
      [Op.and]: [],
    };

    if (filter.id_destinasi) {
      const filterId = Array.isArray(filter.id_destinasi)
        ? filter.id_destinasi
        : filter.id_destinasi.split(",");

      if (filterId.length > 0) {
        whereClause[Op.and].push({
          id_destinasi: {
            [Sequelize.Op.or]: filterId.map((name) => ({
              [Sequelize.Op.like]: `%${name.trim()}%`,
            })),
          },
        });
      } else {
        console.log("Empty filter.id_destinasi");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }

    if (filter.nama_destinasi) {
      const filterNama = Array.isArray(filter.nama_destinasi)
        ? filter.nama_destinasi
        : filter.nama_destinasi.split(",");

      if (filterNama.length > 0) {
        whereClause[Op.and].push({
          nama_destinasi: {
            [Sequelize.Op.or]: filterNama.map((name) => ({
              [Sequelize.Op.like]: `%${name.trim()}%`,
            })),
          },
        });
      } else {
        console.log("Empty filter.nama_destinasi");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }

    if (filter.id_menu) {
      const filterIdMenu = Array.isArray(filter.id_menu)
        ? filter.id_menu
        : filter.id_menu.split(",");

      if (filterIdMenu.length > 0) {
        whereClausemenu[Op.and].push({
          id_menu: {
            [Sequelize.Op.or]: filterIdMenu.map((name) => ({
              [Sequelize.Op.like]: `%${name.trim()}%`,
            })),
          },
        });
      } else {
        console.log("Empty filter.id_menu");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }

    const data = await tbl_pesanan.findAndCountAll({
      where: whereClause,
      attributes: ["id_pesanan", "tgl_booking"],
      include: [
        {
          model: tbl_detail_pesanan,
          as: "pesanan_detail_as",
          attributes: ["id_detail_pesanan", "id_menu", "nama_menu", "jumlah"],
          where: whereClausemenu,
          required: false,
        },
      ],
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Keranjang masih kosong",
        data: null,
      });
    }
    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((pesanan) => ({
        id_pesanan: pesanan.id_pesanan,
        tgl_booking: pesanan.tgl_booking.toISOString().split("T")[0],
        detail_pesanan: pesanan.pesanan_detail_as.map((pesanan) => ({
          id_detail_pesanan: pesanan.id_detail_pesanan,
          id_menu: pesanan.id_menu,
          nama_menu: pesanan.nama_menu,
          jumlah: pesanan.jumlah,
        })),
      })),
    };

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const Get_Pesanan_belumBayar = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const data = await tbl_pembayaran.findAndCountAll({
      where: {
        [Op.and]: [
          { id_wisatawan: id_wisatawan },
          { status_pembayaran: "belum_bayar" },
        ],
      },
      include: [
        {
          model: tbl_Wisatawan,
          as: "wisatawan_detail_as",
        },
      ],
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Belum ada pesanan",
        data: null,
      });
    }

    const get_pesanan = await Promise.all(
      data.rows.map(async (pesanan) => {
        const data_pesanan = await tbl_pesanan.findAndCountAll({
          where: {
            [Op.and]: [
              { id_wisatawan: id_wisatawan },
              { id_pembayaran: pesanan.id_pembayaran },
              { status_pesanan: "proses" },
            ],
          },
          attributes: [
            "id_pesanan",
            "id_pembayaran",
            "id_wisatawan",
            "id_destinasi",
            "nama_destinasi",
            "kode_pesanan",
            "kode_qr",
            "tgl_booking",
            "total_pesanan",
            "status_pesanan",
            "createdAt",
            "updatedAt",
          ],
        });

        const results = await Promise.all(
          data_pesanan.rows.map(async (pesanan) => {
            let detail_destinasi = [];
            let detail_pesanan = [];
            if (pesanan.nama_destinasi === "tbl_destinasi") {
              detail_destinasi = await tbl_Wisata.findOne({
                where: { id_wisata: pesanan.id_destinasi },
                attributes: ["id_wisata", "nama_destinasi"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Wisata,
                    as: "tiket_detail_as",
                    attributes: [
                      "id_wisata",
                      "nama_destinasi",
                      "harga_tiket",
                      "sampul_destinasi",
                    ],
                    required: false,
                  },
                ],
              });
            } else if (pesanan.nama_destinasi === "tbl_Paket_wisata") {
              detail_destinasi = await tbl_Paket_wisata.findOne({
                where: { id_paket_wisata: pesanan.id_destinasi },
                attributes: ["id_paket_wisata", "nama_paket_wisata"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Paket_wisata,
                    as: "paket_wisata_detail_as",
                    attributes: [
                      "id_paket_wisata",
                      "nama_paket_wisata",
                      "harga_paket_wisata",
                      "sampul_paket_wisata",
                    ],
                    required: false,
                  },
                ],
              });
            } else if (pesanan.nama_destinasi === "tbl_Penginapan") {
              detail_destinasi = await tbl_Penginapan.findOne({
                where: { id_penginapan: pesanan.id_destinasi },
                attributes: ["id_penginapan", "nama_penginapan"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Kamar,
                    as: "kamar_detail_as",
                    attributes: [
                      "id_kamar",
                      "nama_kamar",
                      "harga",
                      "sampul_kamar",
                    ],
                    required: false,
                  },
                  {
                    model: tbl_Paket_homestay,
                    as: "homestay_detail_as",
                    attributes: [
                      "id_paket_homestay",
                      "nama_paket_homestay",
                      "harga",
                      "sampul_paket_homestay",
                    ],
                    required: false,
                  },
                ],
              }); // } else if (pesanan.nama_destinasi === 'tbl_Penginapan') {
              //     detail_destinasi = await tbl_Penginapan.findOne({
              //         where: { id_penginapan: pesanan.id_destinasi },
              //         attributes: [
              //             "id_penginapan",
              //             "nama_penginapan"
              //         ]
              //     });
              //     detail_pesanan = await tbl_detail_pesanan.findAll({
              //         where: { id_pesanan: pesanan.id_pesanan },
              //         attributes: [
              //             "id_detail_pesanan",
              //             "id_menu",
              //             "nama_menu",
              //             "jumlah",
              //             "harga_satuan"
              //         ],
              //         include: [
              //             {
              //                 model: tbl_Paket_homestay,
              //                 as: "homestay_detail_as",
              //                 attributes: [
              //                     "id_paket_homestay",
              //                     "nama_paket_homestay",
              //                     "harga",
              //                     "sampul_paket_homestay"
              //                 ],
              //                 required: false,
              //             },
              //         ]
              //     });
            } else if (pesanan.nama_destinasi === "tbl_Kuliner") {
              detail_destinasi = await tbl_Kuliner.findOne({
                where: { id_kuliner: pesanan.id_destinasi },
                attributes: ["id_kuliner", "nama_kuliner"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Menu,
                    as: "menu_detail_as",
                    attributes: [
                      "id_menu",
                      "nama_menu",
                      "harga_menu",
                      "sampul_menu",
                    ],
                    required: false,
                  },
                ],
              });
            } // return detail_pesanan.map((items) => ({
            //         nama_destinasi: detail_destinasi.id_wisata ? detail_destinasi.nama_destinasi : detail_destinasi.nama_kuliner,
            //         id_detail_pesanan: items.id_detail_pesanan,
            //         id_menu: items.id_menu,
            //         nama_menu: items.tiket_detail_as ? "Tiket " + items.tiket_detail_as.nama_destinasi : items.menu_detail_as.nama_menu,
            //         jumlah: items.jumlah,
            //         harga_satuan: items.harga_satuan,
            //         harga_total: items.harga_satuan * items.jumlah,
            //         sampul_menu: items.tiket_detail_as ? items.tiket_detail_as.sampul_destinasi : items.menu_detail_as.sampul_menu,
            //     }));

            return {
              id_pesanan: pesanan.id_pesanan,
              id_pembayaran: pesanan.id_pembayaran,
              id_destinasi: pesanan.id_destinasi,
              kode_pesanan: pesanan.kode_pesanan,
              kode_qr: pesanan.kode_qr,
              tgl_booking: pesanan.tgl_booking,
              total_pesanan: pesanan.total_pesanan,
              jenis_destinasi: pesanan.nama_destinasi,
              tgl_pesanan: pesanan.createdAt,
              nama_destinasi: detail_destinasi.id_wisata
                ? detail_destinasi.nama_destinasi
                : detail_destinasi.id_kuliner
                  ? detail_destinasi.nama_kuliner
                  : detail_destinasi.id_penginapan
                    ? detail_destinasi.nama_penginapan
                    : detail_destinasi.nama_paket_wisata,
              detail_pesanan: detail_pesanan.map((items) => ({
                id_detail_pesanan: items.id_detail_pesanan,
                id_menu: items.id_menu,
                nama_menu: items.tiket_detail_as
                  ? "Tiket " + items.tiket_detail_as.nama_destinasi
                  : items.menu_detail_as
                    ? items.menu_detail_as.nama_menu
                    : items.kamar_detail_as
                      ? items.kamar_detail_as.nama_kamar
                      : items.paket_wisata_detail_as
                        ? items.paket_wisata_detail_as.nama_paket_wisata
                        : items.homestay_detail_as
                          ? items.homestay_detail_as.nama_paket_homestay
                          : null, // untuk paket_homestay
                jumlah: items.jumlah,
                harga_satuan: items.harga_satuan,
                sampul_menu: items.tiket_detail_as
                  ? items.tiket_detail_as.sampul_destinasi
                  : items.menu_detail_as
                    ? items.menu_detail_as.sampul_menu
                    : items.kamar_detail_as
                      ? items.kamar_detail_as.sampul_kamar
                      : items.paket_wisata_detail_as
                        ? items.paket_wisata_detail_as.sampul_paket_wisata
                        : items.homestay_detail_as
                          ? items.homestay_detail_as.sampul_paket_homestay
                          : null, // untuk paket_homestay
              })),
            };
          }),
        );
        pesanan.dataValues.pesanan = results.flat();
        return pesanan;
      }),
    );

    res.status(200).json({
      message: "Pesanan berhasil didapat",
      data: get_pesanan,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

const Get_Pesanan_selesai = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const data = await tbl_pembayaran.findAndCountAll({
      where: {
        [Op.and]: [
          { id_wisatawan: id_wisatawan },
          { status_pembayaran: "selesai" },
        ],
      },
      include: [
        {
          model: tbl_Wisatawan,
          as: "wisatawan_detail_as",
        },
      ],
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Belum ada pesanan selesai",
        data: null,
      });
    }
    const get_pesanan = await Promise.all(
      data.rows.map(async (pesanan) => {
        const data_pesanan = await tbl_pesanan.findAndCountAll({
          where: {
            [Op.and]: [
              { id_wisatawan: id_wisatawan },
              { id_pembayaran: pesanan.id_pembayaran },
              { status_pesanan: "selesai" },
            ],
          },
          attributes: [
            "id_pesanan",
            "id_pembayaran",
            "id_wisatawan",
            "id_destinasi",
            "nama_destinasi",
            "kode_pesanan",
            "kode_qr",
            "tgl_booking",
            "total_pesanan",
            "status_pesanan",
            "createdAt",
            "updatedAt",
          ],
        });

        const results = await Promise.all(
          data_pesanan.rows.map(async (pesanan) => {
            let detail_destinasi = [];
            let detail_pesanan = [];
            if (pesanan.nama_destinasi === "tbl_destinasi") {
              detail_destinasi = await tbl_Wisata.findOne({
                where: { id_wisata: pesanan.id_destinasi },
                attributes: ["id_wisata", "nama_destinasi"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Wisata,
                    as: "tiket_detail_as",
                    attributes: [
                      "id_wisata",
                      "nama_destinasi",
                      "harga_tiket",
                      "sampul_destinasi",
                    ],
                    required: false,
                  },
                ],
              });
            } else if (pesanan.nama_destinasi === "tbl_Paket_wisata") {
              detail_destinasi = await tbl_Paket_wisata.findOne({
                where: { id_paket_wisata: pesanan.id_destinasi },
                attributes: ["id_paket_wisata", "nama_paket_wisata"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Paket_wisata,
                    as: "paket_wisata_detail_as",
                    attributes: [
                      "id_paket_wisata",
                      "nama_paket_wisata",
                      "harga_paket_wisata",
                      "sampul_paket_wisata",
                    ],
                    required: false,
                  },
                ],
              });
            } else if (pesanan.nama_destinasi === "tbl_Penginapan") {
              detail_destinasi = await tbl_Penginapan.findOne({
                where: { id_penginapan: pesanan.id_destinasi },
                attributes: ["id_penginapan", "nama_penginapan"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Kamar,
                    as: "kamar_detail_as",
                    attributes: [
                      "id_kamar",
                      "nama_kamar",
                      "harga",
                      "sampul_kamar",
                    ],
                    required: false,
                  },
                  {
                    model: tbl_Paket_homestay,
                    as: "homestay_detail_as",
                    attributes: [
                      "id_paket_homestay",
                      "nama_paket_homestay",
                      "harga",
                      "sampul_paket_homestay",
                    ],
                    required: false,
                  },
                ],
              }); //  } else if (pesanan.nama_destinasi === 'tbl_Penginapan') {
              //     detail_destinasi = await tbl_Penginapan.findOne({
              //         where: { id_penginapan: pesanan.id_destinasi },
              //         attributes: [
              //             "id_penginapan",
              //             "nama_penginapan",
              //         ]
              //     });
              //     detail_pesanan = await tbl_detail_pesanan.findAll({
              //         where: { id_pesanan: pesanan.id_pesanan },
              //         attributes: [
              //             "id_detail_pesanan",
              //             "id_menu",
              //             "nama_menu",
              //             "jumlah",
              //             "harga_satuan"
              //         ],
              //         include: [
              //             {
              //                 model: tbl_Paket_homestay,
              //                 as: "homestay_detail_as",
              //                 attributes: [
              //                     "id_homestay",
              //                     "nama_homestay",
              //                     "harga",
              //                     "sampul_homestay"
              //                 ],
              //                 required: false,
              //             },
              //         ]
              //     });
            } else if (pesanan.nama_destinasi === "tbl_Kuliner") {
              detail_destinasi = await tbl_Kuliner.findOne({
                where: { id_kuliner: pesanan.id_destinasi },
                attributes: ["id_kuliner", "nama_kuliner"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Menu,
                    as: "menu_detail_as",
                    attributes: [
                      "id_menu",
                      "nama_menu",
                      "harga_menu",
                      "sampul_menu",
                    ],
                    required: false,
                  },
                ],
              });
            } // return detail_pesanan.map((items) => ({
            //         nama_destinasi: detail_destinasi.id_wisata ? detail_destinasi.nama_destinasi : detail_destinasi.nama_kuliner,
            //         id_detail_pesanan: items.id_detail_pesanan,
            //         id_menu: items.id_menu,
            //         nama_menu: items.tiket_detail_as ? "Tiket " + items.tiket_detail_as.nama_destinasi : items.menu_detail_as.nama_menu,
            //         jumlah: items.jumlah,
            //         harga_satuan: items.harga_satuan,
            //         harga_total: items.harga_satuan * items.jumlah,
            //         sampul_menu: items.tiket_detail_as ? items.tiket_detail_as.sampul_destinasi : items.menu_detail_as.sampul_menu,
            //     }));

            const formattedTglBooking = pesanan.tgl_booking
              .toISOString()
              .split("T")[0];

            return {
              id_pesanan: pesanan.id_pesanan,
              id_pembayaran: pesanan.id_pembayaran,
              id_destinasi: pesanan.id_destinasi,
              kode_pesanan: pesanan.kode_pesanan,
              kode_qr: pesanan.kode_qr,
              tgl_booking: pesanan.tgl_booking,
              total_pesanan: pesanan.total_pesanan,
              jenis_destinasi: pesanan.nama_destinasi,
              tgl_pesanan: pesanan.createdAt,
              tgl_pesanan_selesai: pesanan.updatedAt,
              nama_destinasi: detail_destinasi
                ? detail_destinasi.id_wisata
                  ? detail_destinasi.nama_destinasi
                  : detail_destinasi.id_kuliner
                    ? detail_destinasi.nama_kuliner
                    : detail_destinasi.id_penginapan
                      ? detail_destinasi.nama_penginapan
                      : detail_destinasi.nama_paket_wisata
                : null,

              detail_pesanan: detail_pesanan.map((items) => ({
                id_detail_pesanan: items.id_detail_pesanan,
                id_menu: items.id_menu,
                nama_menu: items.tiket_detail_as
                  ? "Tiket " + items.tiket_detail_as.nama_destinasi
                  : items.menu_detail_as
                    ? items.menu_detail_as.nama_menu
                    : items.kamar_detail_as
                      ? items.kamar_detail_as.nama_kamar
                      : items.paket_wisata_detail_as
                        ? items.paket_wisata_detail_as.nama_paket_wisata
                        : items.homestay_detail_as
                          ? items.homestay_detail_as.nama_paket_homestay
                          : null, // untuk paket_homestay
                jumlah: items.jumlah,
                harga_satuan: items.harga_satuan,
                sampul_menu: items.tiket_detail_as
                  ? items.tiket_detail_as.sampul_destinasi
                  : items.menu_detail_as
                    ? items.menu_detail_as.sampul_menu
                    : items.kamar_detail_as
                      ? items.kamar_detail_as.sampul_kamar
                      : items.paket_wisata_detail_as
                        ? items.paket_wisata_detail_as.sampul_paket_wisata
                        : items.homestay_detail_as
                          ? items.homestay_detail_as.sampul_paket_homestay
                          : null, // untuk paket_homestay
              })),
            };
          }),
        );
        pesanan.dataValues.pesanan = results.flat();
        return pesanan;
      }),
    );

    res.status(200).json({
      message: "Pesanan berhasil didapat",
      data: get_pesanan,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

const Get_Pesanan_Eticket = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const data = await tbl_pembayaran.findAndCountAll({
      where: {
        [Op.and]: [
          { id_wisatawan: id_wisatawan },
          { status_pembayaran: "bayar" },
        ],
      },
      include: [
        {
          model: tbl_Wisatawan,
          as: "wisatawan_detail_as",
        },
      ],
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "E-ticket belum tersedia",
        data: null,
      });
    }
    const get_pesanan = await Promise.all(
      data.rows.map(async (pesanan) => {
        const data_pesanan = await tbl_pesanan.findAndCountAll({
          where: {
            [Op.and]: [
              { id_wisatawan: id_wisatawan },
              { id_pembayaran: pesanan.id_pembayaran },
              { status_pesanan: "proses" },
            ],
          },
          attributes: [
            "id_pesanan",
            "id_pembayaran",
            "id_wisatawan",
            "id_destinasi",
            "nama_destinasi",
            "kode_pesanan",
            "kode_qr",
            "tgl_booking",
            "total_pesanan",
            "status_pesanan",
            "createdAt",
            "updatedAt",
          ],
        });

        const results = await Promise.all(
          data_pesanan.rows.map(async (pesanan) => {
            let detail_destinasi = [];
            let detail_pesanan = [];
            if (pesanan.nama_destinasi === "tbl_destinasi") {
              detail_destinasi = await tbl_Wisata.findOne({
                where: { id_wisata: pesanan.id_destinasi },
                attributes: ["id_wisata", "nama_destinasi"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Wisata,
                    as: "tiket_detail_as",
                    attributes: [
                      "id_wisata",
                      "nama_destinasi",
                      "harga_tiket",
                      "sampul_destinasi",
                    ],
                    required: false,
                  },
                ],
              });
            } else if (pesanan.nama_destinasi === "tbl_Paket_wisata") {
              detail_destinasi = await tbl_Paket_wisata.findOne({
                where: { id_paket_wisata: pesanan.id_destinasi },
                attributes: ["id_paket_wisata", "nama_paket_wisata"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Paket_wisata,
                    as: "paket_wisata_detail_as",
                    attributes: [
                      "id_paket_wisata",
                      "nama_paket_wisata",
                      "harga_paket_wisata",
                      "sampul_paket_wisata",
                    ],
                    required: false,
                  },
                ],
              });
            } else if (pesanan.nama_destinasi === "tbl_Penginapan") {
              detail_destinasi = await tbl_Penginapan.findOne({
                where: { id_penginapan: pesanan.id_destinasi },
                attributes: ["id_penginapan", "nama_penginapan"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Kamar,
                    as: "kamar_detail_as",
                    attributes: [
                      "id_kamar",
                      "nama_kamar",
                      "harga",
                      "sampul_kamar",
                    ],
                    required: false,
                  },
                  {
                    model: tbl_Paket_homestay,
                    as: "homestay_detail_as",
                    attributes: [
                      "id_paket_homestay",
                      "nama_paket_homestay",
                      "harga",
                      "sampul_paket_homestay",
                    ],
                    required: false,
                  },
                ],
              }); // } else if (pesanan.nama_destinasi === 'tbl_Penginapan') {
              //     detail_destinasi = await tbl_Penginapan.findOne({
              //         where: { id_penginapan: pesanan.id_destinasi },
              //         attributes: [
              //             "id_penginapan",
              //             "nama_penginapan",
              //         ]
              //     });
              //     detail_pesanan = await tbl_detail_pesanan.findAll({
              //         where: { id_pesanan: pesanan.id_pesanan },
              //         attributes: [
              //             "id_detail_pesanan",
              //             "id_menu",
              //             "nama_menu",
              //             "jumlah",
              //             "harga_satuan"
              //         ],
              //         include: [
              //             {
              //                 model: tbl_Paket_homestay,
              //                 as: "homestay_detail_as",
              //                 attributes: [
              //                     "id_paket_homestay",
              //                     "nama_paket_homestay",
              //                     "harga",
              //                     "sampul_paket_homestay"
              //                 ],
              //                 required: false,
              //             },
              //         ]
              //     });
            } else if (pesanan.nama_destinasi === "tbl_Kuliner") {
              detail_destinasi = await tbl_Kuliner.findOne({
                where: { id_kuliner: pesanan.id_destinasi },
                attributes: ["id_kuliner", "nama_kuliner"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Menu,
                    as: "menu_detail_as",
                    attributes: [
                      "id_menu",
                      "nama_menu",
                      "harga_menu",
                      "sampul_menu",
                    ],
                    required: false,
                  },
                ],
              });
            } // return detail_pesanan.map((items) => ({
            //         nama_destinasi: detail_destinasi.id_wisata ? detail_destinasi.nama_destinasi : detail_destinasi.nama_kuliner,
            //         id_detail_pesanan: items.id_detail_pesanan,
            //         id_menu: items.id_menu,
            //         nama_menu: items.tiket_detail_as ? "Tiket " + items.tiket_detail_as.nama_destinasi : items.menu_detail_as.nama_menu,
            //         jumlah: items.jumlah,
            //         harga_satuan: items.harga_satuan,
            //         harga_total: items.harga_satuan * items.jumlah,
            //         sampul_menu: items.tiket_detail_as ? items.tiket_detail_as.sampul_destinasi : items.menu_detail_as.sampul_menu,
            //     }));

            const formattedTglBooking = pesanan.tgl_booking
              .toISOString()
              .split("T")[0];

            return {
              id_pesanan: pesanan.id_pesanan,
              id_pembayaran: pesanan.id_pembayaran,
              id_destinasi: pesanan.id_destinasi,
              kode_pesanan: pesanan.kode_pesanan,
              kode_qr: pesanan.kode_qr,
              tgl_booking: pesanan.tgl_booking,
              total_pesanan: pesanan.total_pesanan,
              jenis_destinasi: pesanan.nama_destinasi,
              tgl_pesanan: pesanan.createdAt,
              tgl_pesanan_selesai: pesanan.updatedAt,
              nama_destinasi: detail_destinasi.id_wisata
                ? detail_destinasi.nama_destinasi
                : detail_destinasi.id_kuliner
                  ? detail_destinasi.nama_kuliner
                  : detail_destinasi.id_penginapan
                    ? detail_destinasi.nama_penginapan
                    : detail_destinasi.nama_paket_wisata,
              detail_pesanan: detail_pesanan.map((items) => ({
                id_detail_pesanan: items.id_detail_pesanan,
                id_menu: items.id_menu,
                nama_menu: items.tiket_detail_as
                  ? "Tiket " + items.tiket_detail_as.nama_destinasi
                  : items.menu_detail_as
                    ? items.menu_detail_as.nama_menu
                    : items.kamar_detail_as
                      ? items.kamar_detail_as.nama_kamar
                      : items.paket_wisata_detail_as
                        ? items.paket_wisata_detail_as.nama_paket_wisata
                        : items.homestay_detail_as
                          ? items.homestay_detail_as.nama_paket_homestay
                          : null, // untuk paket_homestay
                jumlah: items.jumlah,
                harga_satuan: items.harga_satuan,
                sampul_menu: items.tiket_detail_as
                  ? items.tiket_detail_as.sampul_destinasi
                  : items.menu_detail_as
                    ? items.menu_detail_as.sampul_menu
                    : items.kamar_detail_as
                      ? items.kamar_detail_as.sampul_kamar
                      : items.paket_wisata_detail_as
                        ? items.paket_wisata_detail_as.sampul_paket_wisata
                        : items.homestay_detail_as
                          ? items.homestay_detail_as.sampul_paket_homestay
                          : null, // untuk paket_homestay
              })),
            };
          }),
        );
        pesanan.dataValues.pesanan = results.flat();
        return pesanan;
      }),
    );

    res.status(200).json({
      message: "Pesanan berhasil didapat",
      data: get_pesanan,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

const Get_Pesanan_batalkan = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const data = await tbl_pembayaran.findAndCountAll({
      where: {
        [Op.and]: [
          { id_wisatawan: id_wisatawan },
          { status_pembayaran: "batal" },
        ],
      },
      include: [
        {
          model: tbl_Wisatawan,
          as: "wisatawan_detail_as",
        },
      ],
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Belum ada pesanan dibatalkan",
        data: null,
      });
    }

    const get_pesanan = await Promise.all(
      data.rows.map(async (pesanan) => {
        const data_pesanan = await tbl_pesanan.findAndCountAll({
          where: {
            [Op.and]: [
              { id_wisatawan: id_wisatawan },
              { id_pembayaran: pesanan.id_pembayaran },
              { status_pesanan: "selesai" },
            ],
          },
          attributes: [
            "id_pesanan",
            "id_pembayaran",
            "id_wisatawan",
            "id_destinasi",
            "nama_destinasi",
            "kode_pesanan",
            "kode_qr",
            "tgl_booking",
            "total_pesanan",
            "status_pesanan",
            "createdAt",
            "updatedAt",
          ],
        });

        const results = await Promise.all(
          data_pesanan.rows.map(async (pesanan) => {
            let detail_destinasi = [];
            let detail_pesanan = [];
            if (pesanan.nama_destinasi === "tbl_destinasi") {
              detail_destinasi = await tbl_Wisata.findOne({
                where: { id_wisata: pesanan.id_destinasi },
                attributes: ["id_wisata", "nama_destinasi"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Wisata,
                    as: "tiket_detail_as",
                    attributes: [
                      "id_wisata",
                      "nama_destinasi",
                      "harga_tiket",
                      "sampul_destinasi",
                    ],
                    required: false,
                  },
                ],
              });
            } else if (pesanan.nama_destinasi === "tbl_Paket_wisata") {
              detail_destinasi = await tbl_Kuliner.findOne({
                where: { id_kuliner: pesanan.id_destinasi },
                attributes: ["id_paket_wisata", "nama_paket_wisata"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Menu,
                    as: "menu_detail_as",
                    attributes: [
                      "id_paket_wisata",
                      "nama_paket_wisata",
                      "harga_paket_wisata",
                      "sampul_paket_wisata",
                    ],
                    required: false,
                  },
                ],
              });
            } else if (pesanan.nama_destinasi === "tbl_Kuliner") {
              detail_destinasi = await tbl_Kuliner.findOne({
                where: { id_kuliner: pesanan.id_destinasi },
                attributes: ["id_kuliner", "nama_kuliner"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Menu,
                    as: "menu_detail_as",
                    attributes: [
                      "id_menu",
                      "nama_menu",
                      "harga_menu",
                      "sampul_menu",
                    ],
                    required: false,
                  },
                ],
              });
            } else if (pesanan.nama_destinasi === "tbl_Penginapan") {
              detail_destinasi = await tbl_Penginapan.findOne({
                where: { id_penginapan: pesanan.id_destinasi },
                attributes: ["id_penginapan", "nama_penginapan"],
              });

              detail_pesanan = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                  "id_detail_pesanan",
                  "id_menu",
                  "nama_menu",
                  "jumlah",
                  "harga_satuan",
                ],

                include: [
                  {
                    model: tbl_Kamar,
                    as: "kamar_detail_as",
                    attributes: [
                      "id_kamar",
                      "nama_kamar",
                      "harga",
                      "sampul_kamar",
                    ],
                    required: false,
                  },
                  {
                    model: tbl_Paket_homestay,
                    as: "homestay_detail_as",
                    attributes: [
                      "id_paket_homestay",
                      "nama_paket_homestay",
                      "harga",
                      "sampul_paket_homestay",
                    ],
                    required: false,
                  },
                ],
              }); // } else if (pesanan.nama_destinasi === 'tbl_Penginapan') {
              //     detail_destinasi = await tbl_Penginapan.findOne({
              //         where: { id_penginapan: pesanan.id_destinasi },
              //         attributes: [
              //             "id_penginapan",
              //             "nama_penginapan"
              //         ]
              //     });
              //     detail_pesanan = await tbl_detail_pesanan.findAll({
              //         where: { id_pesanan: pesanan.id_pesanan },
              //         attributes: [
              //             "id_detail_pesanan",
              //             "id_menu",
              //             "nama_menu",
              //             "jumlah",
              //             "harga_satuan"
              //         ],
              //         include: [
              //             {
              //                 model: tbl_Paket_homestay,
              //                 as: "homestay_detail_as",
              //                 attributes: [
              //                     "id_paket_homestay",
              //                     "nama_paket_homestay",
              //                     "harga",
              //                     "sampul_paket_homestay"
              //                 ],
              //                 required: false,
              //             },
              //         ]
              //     });
            } // return detail_pesanan.map((items) => ({
            //         nama_destinasi: detail_destinasi.id_wisata ? detail_destinasi.nama_destinasi : detail_destinasi.nama_kuliner,
            //         id_detail_pesanan: items.id_detail_pesanan,
            //         id_menu: items.id_menu,
            //         nama_menu: items.tiket_detail_as ? "Tiket " + items.tiket_detail_as.nama_destinasi : items.menu_detail_as.nama_menu,
            //         jumlah: items.jumlah,
            //         harga_satuan: items.harga_satuan,
            //         harga_total: items.harga_satuan * items.jumlah,
            //         sampul_menu: items.tiket_detail_as ? items.tiket_detail_as.sampul_destinasi : items.menu_detail_as.sampul_menu,
            //     }));

            return {
              id_pesanan: pesanan.id_pesanan,
              id_pembayaran: pesanan.id_pembayaran,
              id_destinasi: pesanan.id_destinasi,
              kode_pesanan: pesanan.kode_pesanan,
              kode_qr: pesanan.kode_qr,
              tgl_booking: pesanan.tgl_booking,
              total_pesanan: pesanan.total_pesanan,
              jenis_destinasi: pesanan.nama_destinasi,
              tgl_pesanan: pesanan.createdAt,
              tgl_pesanan_selesai: pesanan.updatedAt,
              nama_destinasi: detail_destinasi.id_wisata
                ? detail_destinasi.nama_destinasi
                : detail_destinasi.id_kuliner
                  ? detail_destinasi.nama_kuliner
                  : detail_destinasi.id_penginapan
                    ? detail_destinasi.nama_penginapan
                    : detail_destinasi.nama_paket_wisata,
              detail_pesanan: detail_pesanan.map((items) => ({
                id_detail_pesanan: items.id_detail_pesanan,
                id_menu: items.id_menu,
                nama_menu: items.tiket_detail_as
                  ? "Tiket " + items.tiket_detail_as.nama_destinasi
                  : items.menu_detail_as
                    ? items.menu_detail_as.nama_menu
                    : items.kamar_detail_as
                      ? items.kamar_detail_as.nama_kamar
                      : items.paket_wisata_detail_as
                        ? items.paket_wisata_detail_as.nama_paket_wisata
                        : items.homestay_detail_as
                          ? items.homestay_detail_as.nama_paket_homestay
                          : null, // untuk paket_homestay
                jumlah: items.jumlah,
                harga_satuan: items.harga_satuan,
                sampul_menu: items.tiket_detail_as
                  ? items.tiket_detail_as.sampul_destinasi
                  : items.menu_detail_as
                    ? items.menu_detail_as.sampul_menu
                    : items.kamar_detail_as
                      ? items.kamar_detail_as.sampul_kamar
                      : items.paket_wisata_detail_as
                        ? items.paket_wisata_detail_as.sampul_paket_wisata
                        : items.homestay_detail_as
                          ? items.homestay_detail_as.sampul_paket_homestay
                          : null, // untuk paket_homestay
              })),
            };
          }),
        );
        pesanan.dataValues.pesanan = results.flat();
        return pesanan;
      }),
    );

    res.status(200).json({
      message: "Pesanan berhasil didapat",
      data: get_pesanan,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

const Post_Pesanan_dibatalkan = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_pembayaran } = req.params; // Mengambil id_pembayaran dari URL params
    const { keterangan = "" } = req.query;

    if (!id_pembayaran) {
      return res.status(422).json({ msg: "id_pembayaran is required!" });
    } // Ambil data pembayaran berdasarkan id_pembayaran

    const dataPembayaran = await tbl_pembayaran.findOne({
      where: {
        [Op.and]: [
          { id_wisatawan: id_wisatawan }, // Pastikan data pembayaran milik wisatawan yang login
          { id_pembayaran: id_pembayaran }, // Pastikan id_pembayaran cocok
        ],
      },
    }); // Jika data pembayaran tidak ditemukan

    if (!dataPembayaran) {
      return res.status(422).json({
        success: false,
        message: "Data pembayaran tidak ditemukan",
      });
    } // Cek status pembayaran, hanya bisa dibatalkan jika statusnya 'belum_bayar'

    if (dataPembayaran.status_pembayaran !== "belum_bayar") {
      return res.status(422).json({
        success: false,
        message:
          "Pesanan gagal dibatalkan karena status pembayaran tidak sesuai",
        status_pembayaran: dataPembayaran.status_pembayaran,
      });
    } // Menentukan tanggal pembatalan

    const tgl_pembatalan = moment()
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss"); // Update status pembayaran menjadi 'batal'

    await dataPembayaran.update({
      status_pembayaran: "batal",
      keterangan_pembayaran: keterangan || dataPembayaran.keterangan_pembayaran,
      updatedAt: tgl_pembatalan,
    }); // Update status pesanan menjadi 'selesai'

    await tbl_pesanan.update(
      { status_pesanan: "selesai" },
      { where: { id_pembayaran: id_pembayaran } },
    ); // Respons jika pembatalan berhasil

    res.status(200).json({
      message: "Pesanan berhasil dibatalkan",
      data: dataPembayaran,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

//MIDTRANS
// const Add_Pesanan_belumBayar = async (req, res) => {
//     try {
//         const token = req.cookies.refreshtoken;

//         if (!token) {
//             return res.status(401).json({ message: "Akun belum login!" });
//         }

//         // Verifikasi token
//         let id_wisatawan;
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             id_wisatawan = decoded.id;
//         } catch (err) {
//             return res.status(403).json({ message: "Token tidak valid!" });
//         }

//         const { dataId, dataTotalPembayaran } = req.body;

//         // Validasi input
//         if (!dataId || !Array.isArray(dataId) || dataId.length === 0) {
//             return res.status(422).json({ message: "Data id tidak valid atau kosong!" });
//         }

//         if (!dataTotalPembayaran || typeof dataTotalPembayaran !== 'number') {
//             return res.status(422).json({ message: "Data total pembayaran tidak valid!" });
//         }

//         // Periksa apakah wisatawan ada
//         const userWisatawan = await tbl_Wisatawan.findOne({
//             where: { id_wisatawan }
//         });

//         if (!userWisatawan) {
//             return res.status(404).json({ message: "Wisatawan tidak ditemukan!" });
//         }

//         // Ambil data pesanan dari tabel tbl_pesanan
//         const data_pesanan = await tbl_pesanan.findAndCountAll({
//             where: {
//                 id_pesanan: { [Op.in]: dataId }, // Mengambil hanya pesanan dengan id yang dikirim dari request
//                 status_pesanan: 'keranjang' // Pastikan hanya pesanan yang statusnya 'keranjang'
//             },
//             attributes: [
//                 "id_pesanan",
//                 "nama_destinasi"
//             ]
//         });

//         // Jika tidak ada data, kembalikan respon error
//         if (data_pesanan.count === 0) {
//             return res.status(404).json({ message: "Tidak ada pesanan ditemukan!" });
//         }

//         // Ambil data pesanan dari keranjang
//         const results = await Promise.all(data_pesanan.rows.map(async (pesanan) => {
//             let detail_pesanan = [];
//             if (pesanan.nama_destinasi === 'tbl_destinasi') {
//                 detail_pesanan = await tbl_detail_pesanan.findAll({
//                     where: { id_pesanan: pesanan.id_pesanan },
//                     attributes: [
//                         "id_detail_pesanan",
//                         "id_menu",
//                         "nama_menu",
//                         "jumlah",
//                         "harga_satuan"
//                     ],
//                     include: [
//                         {
//                             model: tbl_Wisata,
//                             as: "tiket_detail_as",
//                             attributes: [
//                                 "id_wisata",
//                                 "nama_destinasi",
//                                 "harga_tiket",
//                                 "sampul_destinasi"
//                             ],
//                             required: false,
//                         },
//                     ]
//                 });
//             } else if (pesanan.nama_destinasi === 'tbl_Kuliner') {
//                 detail_pesanan = await tbl_detail_pesanan.findAll({
//                     where: { id_pesanan: pesanan.id_pesanan },
//                     attributes: [
//                         "id_detail_pesanan",
//                         "id_menu",
//                         "nama_menu",
//                         "jumlah",
//                         "harga_satuan"
//                     ],
//                     include: [
//                         {
//                             model: tbl_Menu,
//                             as: "menu_detail_as",
//                             attributes: [
//                                 "id_menu",
//                                 "nama_menu",
//                                 "harga_menu",
//                                 "sampul_menu"
//                             ],
//                             required: false,
//                         },
//                     ]
//                 });

//             } else if (pesanan.nama_destinasi === 'tbl_Paket_wisata') {  // Tambahan untuk paket wisata
//                 detail_pesanan = await tbl_detail_pesanan.findAll({
//                     where: { id_pesanan: pesanan.id_pesanan },
//                     attributes: [
//                         "id_detail_pesanan",
//                         "id_menu",
//                         "nama_menu",
//                         "jumlah",
//                         "harga_satuan"
//                     ],
//                     include: [
//                         {
//                             model: tbl_Paket_wisata,
//                             as: "paket_wisata_detail_as",
//                             attributes: [
//                                 "id_paket_wisata",
//                                 "nama_paket_wisata",
//                                 "harga_paket_wisata",
//                                 "sampul_paket_wisata"
//                             ],
//                             required: false,
//                         },
//                     ]
//                 });

//             } else if (pesanan.nama_destinasi === 'tbl_Penginapan') {  // Tambah pesanan untuk kamar
//                 detail_pesanan = await tbl_detail_pesanan.findAll({
//                     where: { id_pesanan: pesanan.id_pesanan },
//                     attributes: [
//                         "id_detail_pesanan",
//                         "id_menu",
//                         "nama_menu",
//                         "jumlah",
//                         "harga_satuan"
//                     ],
//                     include: [
//                         {
//                             model: tbl_Kamar,
//                             as: "kamar_detail_as",
//                             attributes: [
//                                 "id_kamar",
//                                 "nama_kamar",
//                                 "harga",
//                                 "sampul_kamar"
//                             ],
//                             required: false,
//                         },
//                         {
//                             model: tbl_Paket_homestay,
//                             as: "homestay_detail_as",
//                             attributes: [
//                                 "id_paket_homestay",
//                                 "nama_paket_homestay",
//                                 "harga",
//                                 "sampul_paket_homestay"
//                             ],
//                             required: false,
//                         },
//                     ]
//                 });

//             // } else if (pesanan.nama_destinasi === 'tbl_Penginapan') {  // Tambah pesanan untuk kamar
//             //     detail_pesanan = await tbl_detail_pesanan.findAll({
//             //         where: { id_pesanan: pesanan.id_pesanan },
//             //         attributes: [
//             //             "id_detail_pesanan",
//             //             "id_menu",
//             //             "nama_menu",
//             //             "jumlah",
//             //             "harga_satuan"
//             //         ],
//             //         include: [
//             //             {
//             //                 model: tbl_Paket_homestay,
//             //                 as: "homestay_detail_as",
//             //                 attributes: [
//             //                     "id_paket_homestay",
//             //                     "nama_paket_homestay",
//             //                     "harga",
//             //                     "sampul_paket_homestay"
//             //                 ],
//             //                 required: false,
//             //             },
//             //         ]
//             //     });
//             }

//             return detail_pesanan.map((items) => ({
//                 id: items.id_menu,
//                 price: items.harga_satuan,
//                 quantity: items.jumlah,
//                 name: items.tiket_detail_as
//                     ? "Tiket " + items.tiket_detail_as.nama_destinasi
//                     : items.menu_detail_as
//                     ? items.menu_detail_as.nama_menu
//                     : items.kamar_detail_as
//                     ? items.kamar_detail_as.nama_kamar
//                     : items.homestay_detail_as
//                     ? items.homestay_detail_as.nama_paket_homestay
//                     : items.paket_wisata_detail_as
//                     ? "Paket " + items.paket_wisata_detail_as.nama_paket_wisata
//                     : '',
//             }));
//         }));

//         const formattedDetails = results.flat();

//         const pembayaranBaru = await tbl_pembayaran.create({
//             id_wisatawan: id_wisatawan,
//             status_pembayaran: 'belum_bayar',
//             total_pembayaran: dataTotalPembayaran,
//             createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
//             updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
//         });

//         if (!pembayaranBaru) {
//             return res.status(422).json({ message: "Pesanan gagal dibuat" });
//         }

//         // Update status pesanan ke 'proses' dan tambahkan id_pembayaran
//         await tbl_pesanan.update(
//             { status_pesanan: 'proses', id_pembayaran: pembayaranBaru.id_pembayaran },
//             { where: { id_pesanan: dataId } }
//         );

//         // Kirim respons
//         res.status(200).json({
//             message: "Pesanan berhasil diperbarui menjadi 'proses' dan pembayaran ditambahkan",
//             pembayaran: pembayaranBaru,
//             details: formattedDetails
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ message: "Terjadi kesalahan server", error });
//     }
// };

const Post_Pesanan_Pembayaran = async (req, res) => {
  try {
    // Ambil ID Pembayaran dari params (jika pakai GET/POST /:id) atau body
    const id_pembayaran = req.params.id || req.body.dataId;

    if (!id_pembayaran) {
      return res.status(422).json({ message: "ID Pembayaran diperlukan" });
    }

    console.log("Memproses Pembayaran ID:", id_pembayaran); // 1. Ambil Data Pembayaran & User

    const pembayaran = await tbl_pembayaran.findOne({
      where: { id_pembayaran: id_pembayaran },
      include: [
        {
          model: tbl_Wisatawan,
          as: "wisatawan_detail_as", // Sesuaikan dengan alias di model Anda
          attributes: ["name", "email", "no_hp"],
        },
      ],
    });

    if (!pembayaran) {
      return res
        .status(404)
        .json({ message: "Data pembayaran tidak ditemukan" });
    } // 2. Cek Status Pembayaran
    // Jika sudah bayar/settlement, tolak request

    if (
      ["bayar", "settlement", "success"].includes(pembayaran.status_pembayaran)
    ) {
      return res.status(400).json({ message: "Transaksi ini sudah dibayar." });
    } // 3. Konfigurasi Midtrans Snap

    let snap = new midtransClient.Snap({
      isProduction: false, // Ubah ke true jika live
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    }); // 4. Buat Parameter Transaksi Midtrans
    // Gunakan timestamp agar Order ID unik jika user mencoba bayar ulang berkali-kali
    // Midtrans menolak Order ID yang sama persis jika transaksi sebelumnya belum expire/cancel

    const uniqueOrderId = `${pembayaran.kode_pembayaran}-${Math.floor(Date.now() / 1000)}`;

    let parameter = {
      transaction_details: {
        order_id: uniqueOrderId, // Order ID Baru yang unik
        gross_amount: pembayaran.total_pembayaran,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: pembayaran.wisatawan_detail_as?.name || "Wisatawan",
        email: pembayaran.wisatawan_detail_as?.email || "email@example.com",
        phone: pembayaran.wisatawan_detail_as?.no_hp || "08123456789",
      },
      callbacks: {
        finish: `${process.env.FRONTEND_APP_URL}/pesananku`,
      },
    }; // 5. Minta Snap Token ke Midtrans

    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;
    const redirectUrl = transaction.redirect_url;

    console.log("Snap Token Berhasil Dibuat:", snapToken); // 6. Update Database dengan Token Baru & Order ID Baru (Penting untuk Notifikasi nanti)
    // Kita update kolom order_id di database agar match dengan yang dikirim ke Midtrans
    // (Opsional: Jika Anda punya kolom khusus 'midtrans_order_id', gunakan itu. Jika tidak, update kode_pembayaran atau biarkan mapping manual)

    await tbl_pembayaran.update(
      {
        // Simpan token baru agar frontend bisa membukanya
        // Pastikan Anda punya kolom untuk menyimpan snap token, atau kirim langsung ke FE tanpa simpan
        // Jika tidak ada kolom, bagian update ini bisa dihapus/disesuaikan
        status_pembayaran: "belum_bayar", // Reset status jaga-jaga
        order_id: uniqueOrderId, // PENTING: Update order_id di DB agar sinkron saat notifikasi masuk
      },
      {
        where: { id_pembayaran: id_pembayaran },
      },
    ); // 7. Kirim Response ke Frontend

    return res.status(200).json({
      message: "Snap Token berhasil dibuat",
      snapToken: snapToken,
      redirectUrl: redirectUrl,
      orderId: uniqueOrderId,
    });
  } catch (error) {
    console.error("Midtrans Error:", error);
    return res.status(500).json({
      message: "Gagal memproses pembayaran dengan Midtrans",
      error: error.message,
    });
  }
};

module.exports = { Post_Pesanan_Pembayaran };

// const Post_Reopen_Payment = async (req, res) => {
//     try {
//         let id_wisatawan;

//         const token = req.cookies.refreshtoken;
//         if (!token) {
//             return res.status(401).json({ msg: "Akun Belum Login!", token });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         id_wisatawan = decoded.id;

//         const { id_pembayaran } = req.params;
//         if (!id_pembayaran) {
//             return res.status(422).json({ msg: "id_pembayaran is required!" });
//         }

//         const pembayaran = await tbl_pembayaran.findOne({
//             where: {
//                 [Op.and]: [
//                     { id_wisatawan: id_wisatawan },
//                     { id_pembayaran: id_pembayaran },
//                 ],
//             },
//         });

//         if (!pembayaran) {
//             return res.status(404).json({ message: "Data pembayaran tidak ditemukan" });
//         }

//         if (pembayaran.status_pembayaran !== "belum_bayar") {
//             return res.status(422).json({
//                 success: false,
//                 message: "Pesanan sudah dibayar atau tidak dalam status belum bayar",
//                 data: pembayaran.status_pembayaran,
//             });
//         }

//         const pesanan = await tbl_pesanan.findAll({
//             where: { id_pembayaran: id_pembayaran },
//         });

//         if (!pesanan.length) {
//             return res.status(404).json({ message: "Pesanan tidak ditemukan" });
//         }

//         const allDetails = [];
//         for (const order of pesanan) {
//             const details = await tbl_detail_pesanan.findAll({
//                 where: { id_pesanan: order.id_pesanan },
//                 attributes: ["id_detail_pesanan", "id_menu", "nama_menu", "jumlah", "harga_satuan"],
//             });
//             allDetails.push(...details);
//         }

//         let totalItemAmount = 0;
//         const itemDetails = allDetails.map((item) => {
//             const itemAmount = item.harga_satuan * item.jumlah;
//             totalItemAmount += itemAmount;
//             return {
//                 id: item.id_menu,
//                 price: item.harga_satuan,
//                 quantity: item.jumlah,
//                 name: item.nama_menu,
//             };
//         });

//         const payload = {
//             transaction_details: {
//                 order_id: pembayaran.kode_pembayaran,
//                 gross_amount: totalItemAmount,
//             },
//             item_details: itemDetails,
//             customer_details: {
//                 first_name: pembayaran.first_name,
//                 email: pembayaran.email,
//                 phone: pembayaran.phone,
//             },
//             callbacks: {
//                 finish: `${process.env.FRONTEND_APP_URL}/pesananku`,
//                 error: `${process.env.FRONTEND_APP_URL}/pesananku`,
//                 pending: `${process.env.FRONTEND_APP_URL}/pesananku`,
//             },
//         };

//         const authstring = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);
//         const post_midtrans = await fetch(`${process.env.MIDTRANS_APP_URL}/snap/v1/transactions`, {
//             method: "POST",
//             headers: {
//                 "Accept": "application/json",
//                 "Content-Type": "application/json",
//                 "Authorization": `Basic ${authstring}`,
//             },
//             body: JSON.stringify(payload),
//         });

//         const data_post_midtrans = await post_midtrans.json();
//         if (post_midtrans.status !== 201) {
//             return res.status(500).json({ message: "Gagal mendapatkan token pembayaran dari Midtrans" });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Token pembayaran berhasil didapatkan",
//             snapToken: data_post_midtrans.token,
//             redirectUrl: data_post_midtrans.redirect_url,
//         });
//     } catch (error) {
//         console.error("Error: ", error);
//         res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
//     }
// };

// const AddPesanan = async (req, res) => {
//     const generateRandomCode = () => {
//         return Math.floor(1000 + Math.random() * 900000000);
//     };

//     try {
//         let id_wisatawan;

//         const token = req.cookies.refreshtoken;

//         if (!token) {
//             return res.status(401).json({ msg: "Akun Belum Login!", token });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         id_wisatawan = decoded.id;

//         const kode_pembayaran = `KPON-${generateRandomCode()}`;

//         const { dataId, dataTotalPembayaran } = req.body;

//         if (!dataId) {
//             return res.status(422).json({ message: "Data id tidak tersedia" });
//         }

//         if (!dataTotalPembayaran) {
//             return res.status(422).json({ message: "Data Total tidak tersedia" });
//         }

//         const user_wisatawan = await tbl_Wisatawan.findOne({
//             where: {
//                 id_wisatawan: id_wisatawan
//             }
//         });

//         const data_pesanan = await tbl_pesanan.findAndCountAll({
//             where: {
//                 [Op.and]: [
//                     { status_pesanan: 'keranjang' },
//                     { id_pesanan: { [Op.in]: dataId } }
//                 ]
//             }
//         });

//         const results = await Promise.all(data_pesanan.rows.map(async (pesanan) => {
//             let detail_pesanan = [];
//             if (pesanan.nama_destinasi === 'tbl_destinasi') {
//                 detail_pesanan = await tbl_detail_pesanan.findAll({
//                     where: { id_pesanan: pesanan.id_pesanan },
//                     attributes: [
//                         "id_detail_pesanan",
//                         "id_menu",
//                         "nama_menu",
//                         "jumlah",
//                         "harga_satuan"
//                     ],
//                     include: [
//                         {
//                             model: tbl_Wisata,
//                             as: "tiket_detail_as",
//                             attributes: [
//                                 "id_wisata",
//                                 "nama_destinasi",
//                                 "harga_tiket",
//                                 "sampul_destinasi"
//                             ],
//                             required: false,
//                         },
//                     ]
//                 });
//             } else if (pesanan.nama_destinasi === 'tbl_Kuliner') {
//                 detail_pesanan = await tbl_detail_pesanan.findAll({
//                     where: { id_pesanan: pesanan.id_pesanan },
//                     attributes: [
//                         "id_detail_pesanan",
//                         "id_menu",
//                         "nama_menu",
//                         "jumlah",
//                         "harga_satuan"
//                     ],
//                     include: [
//                         {
//                             model: tbl_Menu,
//                             as: "menu_detail_as",
//                             attributes: [
//                                 "id_menu",
//                                 "nama_menu",
//                                 "harga_menu",
//                                 "sampul_menu"
//                             ],
//                             required: false,
//                         },
//                     ]
//                 });

//             } else if (pesanan.nama_destinasi === 'tbl_Paket_wisata') {  // Tambahan untuk paket wisata
//                 detail_pesanan = await tbl_detail_pesanan.findAll({
//                     where: { id_pesanan: pesanan.id_pesanan },
//                     attributes: [
//                         "id_detail_pesanan",
//                         "id_menu",
//                         "nama_menu",
//                         "jumlah",
//                         "harga_satuan"
//                     ],
//                     include: [
//                         {
//                             model: tbl_Paket_wisata,
//                             as: "paket_wisata_detail_as",
//                             attributes: [
//                                 "id_paket_wisata",
//                                 "nama_paket_wisata",
//                                 "harga_paket_wisata",
//                                 "sampul_paket_wisata"
//                             ],
//                             required: false,
//                         },
//                     ]
//                 });

//             } else if (pesanan.nama_destinasi === 'tbl_Penginapan') {  // Tambah pesanan untuk kamar
//                 detail_pesanan = await tbl_detail_pesanan.findAll({
//                     where: { id_pesanan: pesanan.id_pesanan },
//                     attributes: [
//                         "id_detail_pesanan",
//                         "id_menu",
//                         "nama_menu",
//                         "jumlah",
//                         "harga_satuan"
//                     ],
//                     include: [
//                         {
//                             model: tbl_Kamar,
//                             as: "kamar_detail_as",
//                             attributes: [
//                                 "id_kamar",
//                                 "nama_kamar",
//                                 "harga",
//                                 "sampul_kamar"
//                             ],
//                             required: false,
//                         },
//                         {
//                             model: tbl_Paket_homestay,
//                             as: "homestay_detail_as",
//                             attributes: [
//                                 "id_paket_homestay",
//                                 "nama_paket_homestay",
//                                 "harga",
//                                 "sampul_paket_homestay"
//                             ],
//                             required: false,
//                         },
//                     ]
//                 });

//             }

//             return detail_pesanan.map((items) => ({
//                 id: items.id_menu,
//                 price: items.harga_satuan,
//                 quantity: items.jumlah,
//                 name: items.tiket_detail_as
//                     ? "Tiket " + items.tiket_detail_as.nama_destinasi
//                     : items.menu_detail_as
//                     ? items.menu_detail_as.nama_menu
//                     : items.kamar_detail_as
//                     ? items.kamar_detail_as.nama_kamar
//                     : items.homestay_detail_as
//                     ? items.homestay_detail_as.nama_paket_homestay
//                     : items.paket_wisata_detail_as
//                     ? "Paket " + items.paket_wisata_detail_as.nama_paket_wisata
//                     : '',
//             }));
//         }));

//         const authstring = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);

//         const payload = {
//             transaction_details: {
//                 order_id: kode_pembayaran,
//                 gross_amount: dataTotalPembayaran
//             },
//             item_details: results.flat(),
//             customer_details: {
//                 first_name: user_wisatawan.name,
//                 email: user_wisatawan.email,
//                 phone: user_wisatawan.no_hp
//             },
//             callbacks: {
//                 finish: `${process.env.FRONTEND_APP_URL}/pesananku`,
//                 error: `${process.env.FRONTEND_APP_URL}/pesananku`,
//                 pending: `${process.env.FRONTEND_APP_URL}/pesananku`,
//             }
//         };

//         const post_midtrans = await fetch(`${process.env.MIDTRANS_APP_URL}/snap/v1/transactions`, {
//             method: 'POST',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//                 'Authorization': `Basic ${authstring}`
//             },
//             body: JSON.stringify(payload)
//         });

//         const data_post_midtrans = await post_midtrans.json();

//         if (post_midtrans.status !== 201) {
//             res.status(500).json({ message: 'Terjadi kesalahan' });
//         }

//         const pembayaranBaru = await tbl_pembayaran.create({
//             id_wisatawan: id_wisatawan,
//             kode_pembayaran: kode_pembayaran,
//             status_pembayaran: 'belum_bayar',
//             total_pembayaran: dataTotalPembayaran,
//             data_pembayaran_snap_token: data_post_midtrans.token,
//             data_pembayaran_snap_redirect_url: data_post_midtrans.redirect_url,
//             createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
//             updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
//         });

//         if (!pembayaranBaru) {
//             return res.status(422).json({ message: "Pesanan gagal dibuat" });
//         }

//         await tbl_pesanan.update(
//             { status_pesanan: 'proses', id_pembayaran: pembayaranBaru.id_pembayaran },
//             { where: { id_pesanan: dataId } }
//         );

//         res.status(200).json({
//             message: 'Pesanan berhasil dibuat',
//             pembayaran: pembayaranBaru,
//         });
//     } catch (error) {
//         console.error("Error: ", error);
//         res.status(500).json({ message: 'Terjadi kesalahan', error });
//     }
// };

const AddPesanan = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // === 1️⃣ Validasi Login ===
    const token = req.cookies.refreshtoken;
    if (!token) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Akun belum login!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_wisatawan = decoded.id; // === 2️⃣ Validasi Data ===

    const { dataId } = req.body;
    if (!dataId || !Array.isArray(dataId) || dataId.length === 0) {
      await t.rollback();
      return res.status(422).json({
        success: false,
        message: "Data pesanan tidak valid!",
      });
    } // === 3️⃣ Cek User ===

    const user = await tbl_Wisatawan.findByPk(id_wisatawan);
    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan!",
      });
    } // === 4️⃣ Proses Setiap Pesanan ===

    const hasilTransaksi = [];

    for (const id_pesanan of dataId) {
      const pesanan = await tbl_pesanan.findOne({
        where: {
          id_pesanan,
          status_pesanan: "keranjang",
        },
        transaction: t,
        lock: t.LOCK.UPDATE, // hindari kondisi race
      }); // Skip kalau tidak ditemukan / bukan status keranjang

      if (!pesanan) continue;

      const total_pembayaran = Number(pesanan.total_pesanan) || 0;
      if (total_pembayaran <= 0) {
        throw new Error(`Total pembayaran pesanan ${id_pesanan} tidak valid`);
      }

      const kode_pembayaran = `KPON-${Math.floor(100000 + Math.random() * 900000)}`; // === 5️⃣ Buat Data Pembayaran ===

      const pembayaran = await tbl_pembayaran.create(
        {
          id_wisatawan,
          kode_pembayaran,
          status_pembayaran: "belum_bayar",
          total_pembayaran,
          createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        },
        { transaction: t },
      ); // === 6️⃣ Update Status Pesanan ===

      await tbl_pesanan.update(
        {
          status_pesanan: "proses",
          id_pembayaran: pembayaran.id_pembayaran,
        },
        {
          where: { id_pesanan },
          transaction: t,
        },
      );

      hasilTransaksi.push({
        id_pesanan,
        kode_pembayaran,
        total_pembayaran,
      });
    } // === 7️⃣ Commit Transaksi ===

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Pesanan berhasil diproses",
      hasilTransaksi,
    });
  } catch (error) {
    if (t) await t.rollback();

    console.error("AddPesanan Error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message || error,
    });
  }
};

const Post_Reopen_Payment = async (req, res) => {
  try {
    const token = req.cookies.refreshtoken;
    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_wisatawan = decoded.id;

    const { id_pembayaran } = req.params;
    if (!id_pembayaran) {
      return res.status(422).json({ msg: "id_pembayaran is required!" });
    }

    const pembayaran = await tbl_pembayaran.findOne({
      where: {
        id_pembayaran,
        id_wisatawan,
      },
      include: [
        {
          model: tbl_Wisatawan,
          as: "wisatawan_detail_as",
          attributes: ["nama_lengkap", "email", "no_hp"],
        },
      ],
      raw: true,
      nest: true, // ✅ ini penting agar relasi tetap terstruktur
    });

    if (!pembayaran) {
      return res
        .status(404)
        .json({ message: "Data pembayaran tidak ditemukan" });
    }

    if (pembayaran.status_pembayaran !== "belum_bayar") {
      return res.status(422).json({
        success: false,
        message: "Pesanan sudah dibayar atau tidak dalam status belum bayar",
        data: pembayaran.status_pembayaran,
      });
    }

    if (
      pembayaran.data_pembayaran_snap_token &&
      pembayaran.data_pembayaran_snap_redirect_url
    ) {
      return res.status(200).json({
        success: true,
        message: "Token pembayaran sudah ada dan masih berlaku.",
        snapToken: pembayaran.data_pembayaran_snap_token,
        redirectUrl: pembayaran.data_pembayaran_snap_redirect_url,
      });
    }

    const pesanan = await tbl_pesanan.findAll({
      where: { id_pembayaran: id_pembayaran },
    });

    if (!pesanan.length) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const allDetails = [];
    for (const order of pesanan) {
      const details = await tbl_detail_pesanan.findAll({
        where: { id_pesanan: order.id_pesanan },
        attributes: [
          "id_detail_pesanan",
          "id_menu",
          "nama_menu",
          "jumlah",
          "harga_satuan",
        ],
      });
      allDetails.push(...details);
    }

    let totalItemAmount = 0;
    const itemDetails = allDetails.map((item) => {
      const itemAmount = item.harga_satuan * item.jumlah;
      totalItemAmount += itemAmount;
      return {
        id: item.id_menu,
        price: item.harga_satuan,
        quantity: item.jumlah,
        name: item.nama_menu,
      };
    });

    if (totalItemAmount === 0) {
      return res
        .status(422)
        .json({
          message: "Total pembayaran tidak boleh nol. Periksa pesanan Anda.",
        });
    }

    const customer = pembayaran.wisatawan_detail_as?.dataValues || {};

    const payload = {
      transaction_details: {
        order_id: pembayaran.kode_pembayaran,
        gross_amount: totalItemAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customer.nama_lengkap || "Pengunjung",
        email: customer.email || "email@default.com",
        phone: customer.no_hp || "08000000000",
      },
      callbacks: {
        finish: `${process.env.FRONTEND_APP_URL}/pesananku`,
        error: `${process.env.FRONTEND_APP_URL}/pesananku`,
        pending: `${process.env.FRONTEND_APP_URL}/pesananku`,
      },
    };

    console.log("Pembayaran data:", JSON.stringify(pembayaran, null, 2));
    console.log("Wisatawan detail:", pembayaran.wisatawan_detail_as);

    const authstring = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);
    const post_midtrans = await fetch(
      `${process.env.MIDTRANS_APP_URL}/snap/v1/transactions`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${authstring}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data_post_midtrans = await post_midtrans.json();
    if (post_midtrans.status !== 201) {
      return res
        .status(500)
        .json({
          message: "Gagal mendapatkan token pembayaran dari Midtrans",
          response: data_post_midtrans,
        });
    }

    res.status(200).json({
      success: true,
      message: "Token pembayaran berhasil didapatkan",
      snapToken: data_post_midtrans.token,
      redirectUrl: data_post_midtrans.redirect_url,
    });
  } catch (error) {
    console.error("Error: ", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan", error: error.message });
  }
};

const Post_Pesanan_dibayar = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_pembayaran } = req.params;

    if (!id_pembayaran) {
      return res.status(422).json({ msg: "id_pembayaran is required!", token });
    }

    const data = await tbl_pembayaran.findOne({
      where: {
        [Op.and]: [
          { id_wisatawan: id_wisatawan },
          { id_pembayaran: id_pembayaran },
        ],
      },
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Pesanan tidak ditemukan",
        data: null,
      });
    }

    if (data.status_pembayaran !== "belum_bayar") {
      return res.status(422).json({
        success: false,
        message: "Pesanan gagal dibayar",
        data: data.status_pembayaran,
      });
    }

    const tgl_pembayaran = moment()
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss");

    await data.update({
      status_pembayaran: "bayar" || data.status_pembayaran,
      tgl_pembayaran: tgl_pembayaran || data.tgl_pembayaran,
      metode_pembayaran: "Bank Tranfer" || data.metode_pembayaran,
    });

    res.status(200).json({
      message: "Pesanan berhasil dibayar",
      data: data,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

// const trxNotif = async (req, res) => {
//     try {
//         const data = req.body;

//         // Log data untuk debugging
//         console.log("Webhook data received:", JSON.stringify(data, null, 2));

//         // Cek transaksi berdasarkan order_id
//         const transaksi = await tbl_pembayaran.findOne({
//             where: { kode_pembayaran: data.order_id },
//         });

//         if (transaksi) {
//             const isSignatureValid = await checkSignatureKey(transaksi.kode_pembayaran, data);

//             if (isSignatureValid) {
//                 // Update status pembayaran
//                 const transactionStatus = data.transaction_status;
//                 const fraudStatus = data.fraud_status;
//                 let statusPembayaran = 'belum_bayar';

//                 if (transactionStatus === 'capture' && fraudStatus === 'accept') {
//                     statusPembayaran = 'bayar';
//                 } else if (transactionStatus === 'settlement') {
//                     statusPembayaran = 'bayar';
//                 } else if (transactionStatus === 'pending') {
//                     statusPembayaran = 'menunggu_pembayaran';
//                 } else if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
//                     statusPembayaran = 'gagal';
//                 } else if (transactionStatus === 'expire') {
//                     statusPembayaran = 'kedaluwarsa';
//                 }

//                 await transaksi.update({
//                     status_pembayaran: statusPembayaran,
//                     tgl_pembayaran: statusPembayaran === 'bayar' ? new Date() : transaksi.tgl_pembayaran,
//                 });

//                 console.log('Status pembayaran berhasil diperbarui:', statusPembayaran);
//             } else {
//                 console.error('Signature Key tidak valid.');
//             }
//         } else {
//             console.error('Transaksi tidak ditemukan.');
//         }

//         res.status(200).json({
//             status: 'Success',
//             message: 'Ok',
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ message: 'Terjadi kesalahan', error });
//     }
// };

const checkSignatureKey = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Ambil Server Key dari .env
      const serverKey = process.env.MIDTRANS_SERVER_KEY; // Rumus Signature Midtrans: order_id + status_code + gross_amount + serverKey
      // Penting: gross_amount dari notifikasi biasanya string (contoh: "105000.00")
      const inputString = `${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`;

      const signatureKey = crypto
        .createHash("sha512")
        .update(inputString)
        .digest("hex");

      if (signatureKey === data.signature_key) {
        resolve(true);
      } else {
        console.log("Signature Invalid!");
        console.log("Generated:", signatureKey);
        console.log("Received:", data.signature_key);
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const trxNotif = async (req, res) => {
  try {
    const data = req.body;
    console.log("🔔 [WEBHOOK] Midtrans Notification:", JSON.stringify(data));

    // 1. Validasi Input Dasar
    if (!data.order_id) {
      return res
        .status(400)
        .json({ message: "Invalid Data: order_id is missing" });
    }

    // 2. Cari Data Pembayaran berdasarkan 'kode_pembayaran'
    // (Midtrans mengirim 'order_id', di DB kamu itu 'kode_pembayaran')
    const dataPembayaran = await tbl_pembayaran.findOne({
      where: {
        kode_pembayaran: data.order_id,
      },
    });

    // Jika data tidak ditemukan
    if (!dataPembayaran) {
      console.log(`❌ Transaksi dengan kode ${data.order_id} tidak ditemukan.`);
      // Return 200 supaya Midtrans tidak mengirim ulang notifikasi terus menerus
      return res
        .status(200)
        .json({ message: "Data pembayaran tidak ditemukan" });
    }

    // 3. Mapping Status Midtrans ke Enum Database Kamu
    // Enum kamu: ('belum_bayar', 'bayar', 'selesai', 'batal')

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;
    let statusBaru = dataPembayaran.status_pembayaran; // Default status lama

    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        statusBaru = "bayar"; // Kartu Kredit Sukses
      }
    } else if (transactionStatus == "settlement") {
      statusBaru = "bayar"; // ✅ INI KUNCINYA: Settlement = Uang Masuk = E-Tiket Terbit
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      statusBaru = "batal";
    } else if (transactionStatus == "pending") {
      statusBaru = "belum_bayar";
    }

    // 4. Update Database (Hanya jika status berubah)
    // Kita kunci agar kalau sudah 'selesai', tidak bisa berubah lagi
    if (
      dataPembayaran.status_pembayaran !== "selesai" &&
      dataPembayaran.status_pembayaran !== statusBaru
    ) {
      const tgl_update = moment()
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss");

      // A. Update Tabel Pembayaran
      await dataPembayaran.update({
        status_pembayaran: statusBaru,
        tgl_pembayaran:
          statusBaru === "bayar" ? tgl_update : dataPembayaran.tgl_pembayaran,
        metode_pembayaran: data.payment_type,
        updatedAt: tgl_update,
      });

      console.log(`✅ Status Update: ${data.order_id} menjadi ${statusBaru}`);

      // B. Update Tabel Pesanan (Opsional - Mengikuti gaya kodinganmu)
      // Jika pembayaran sukses ('bayar'), biasanya pesanan juga dianggap diproses
      /* if (statusBaru === 'bayar') {
                 await tbl_pesanan.update(
                    { status_pesanan: 'berhasil' }, // Sesuaikan dengan enum tbl_pesanan kamu
                    { where: { id_pembayaran: dataPembayaran.id_pembayaran } }
                );
            }
            */
    }

    // 5. Response Wajib ke Midtrans (Harus 200 OK)
    return res.status(200).json({
      status: "success",
      message: "Notifikasi berhasil diproses",
    });
  } catch (error) {
    console.error("🔥 Error di trxNotif:", error);
    // Tetap return 500 jika error code, tapi jangan biarkan server crash
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { trxNotif };

const check_Pesanan_dibayar = async (req, res) => {
  try {
    let id_wisatawan;

    const token = req.cookies.refreshtoken;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_wisatawan = decoded.id;

    const { id_pembayaran } = req.params;

    const data = await tbl_pembayaran.findOne({
      where: {
        [Op.and]: [
          { id_pembayaran: id_pembayaran },
          { id_wisatawan: id_wisatawan },
          { status_pembayaran: "belum_bayar" },
        ],
      },
    });

    if (data.count === 0) {
      return res.status(422).json({
        success: false,
        message: "Gagal melakukan pembayaran",
        data: null,
      });
    }

    res.status(200).json({
      message: "Pesanan berhasil didapat",
      data: data,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

const Post_checkIn_destinasi = async (req, res) => {
  try {
    let id_admin_login;
    const token = req.cookies.tokenadmin;

    if (!token) {
      return res.status(401).json({ msg: "Akun Belum Login!", token });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_admin_login = decoded.id;

    const { kode_qr } = req.params;
    if (!kode_qr) {
      return res.status(422).json({ msg: "kode_qr is required!" });
    }

    const data_pesanan = await tbl_pesanan.findOne({
      where: {
        kode_qr: kode_qr,
      },
    });

    if (!data_pesanan) {
      return res.status(422).json({
        status: "error",
        success: false,
        message: "Tiket Tidak Sesuai Destinasi",
      });
    }

    const pesanan = data_pesanan.dataValues;

    const data_wisatawan = await tbl_Wisatawan.findOne({
      where: { id_wisatawan: pesanan.id_wisatawan },
      attributes: ["name", "no_hp", "email", "profile"],
    });

    let detail_destinasi = {};
    let detail_pesanans = [];

    if (pesanan.nama_destinasi === "tbl_destinasi") {
      detail_destinasi = await tbl_Wisata.findOne({
        where: { id_wisata: pesanan.id_destinasi },
        attributes: [
          "id_wisata",
          "id_admin",
          "id_admin_pengelola",
          "nama_destinasi",
        ],
      });

      detail_pesanans = await tbl_detail_pesanan.findAll({
        where: { id_pesanan: pesanan.id_pesanan },
        attributes: [
          "id_detail_pesanan",
          "id_menu",
          "nama_menu",
          "jumlah",
          "harga_satuan",
        ],
        include: [
          {
            model: tbl_Wisata,
            as: "tiket_detail_as",
            attributes: [
              "id_wisata",
              "nama_destinasi",
              "harga_tiket",
              "sampul_destinasi",
            ],
            required: false,
          },
        ],
      });
    } else if (pesanan.nama_destinasi === "tbl_Paket_wisata") {
      detail_destinasi = await tbl_Paket_wisata.findOne({
        where: { id_paket_wisata: pesanan.id_destinasi },
        attributes: [
          "id_paket_wisata",
          "id_admin",
          "id_admin_pengelola",
          "nama_paket_wisata",
        ],
      });

      detail_pesanans = await tbl_detail_pesanan.findAll({
        where: { id_pesanan: pesanan.id_pesanan },
        attributes: [
          "id_detail_pesanan",
          "id_menu",
          "nama_menu",
          "jumlah",
          "harga_satuan",
        ],
        include: [
          {
            model: tbl_Paket_wisata,
            as: "paket_wisata_detail_as",
            attributes: [
              "id_paket_wisata",
              "nama_paket_wisata",
              "harga_paket_wisata",
              "sampul_paket_wisata",
            ],
            required: false,
          },
        ],
      });
    } else if (pesanan.nama_destinasi === "tbl_Penginapan") {
      detail_destinasi = await tbl_Penginapan.findOne({
        where: { id_penginapan: pesanan.id_destinasi },
        attributes: [
          "id_penginapan",
          "id_admin",
          "id_admin_pengelola",
          "nama_penginapan",
        ],
      });

      detail_pesanans = await tbl_detail_pesanan.findAll({
        where: { id_pesanan: pesanan.id_pesanan },
        attributes: [
          "id_detail_pesanan",
          "id_menu",
          "nama_menu",
          "jumlah",
          "harga_satuan",
        ],
        include: [
          {
            model: tbl_Kamar,
            as: "kamar_detail_as",
            attributes: ["id_kamar", "nama_kamar", "harga", "sampul_kamar"],
            required: false,
          },
          {
            model: tbl_Paket_homestay,
            as: "homestay_detail_as",
            attributes: [
              "id_paket_homestay",
              "nama_paket_homestay",
              "harga",
              "sampul_paket_homestay",
            ],
            required: false,
          },
        ],
      });
    } else if (pesanan.nama_destinasi === "tbl_Kuliner") {
      detail_destinasi = await tbl_Kuliner.findOne({
        where: { id_kuliner: pesanan.id_destinasi },
        attributes: [
          "id_kuliner",
          "id_admin",
          "id_admin_pengelola",
          "nama_kuliner",
        ],
      });

      detail_pesanans = await tbl_detail_pesanan.findAll({
        where: { id_pesanan: pesanan.id_pesanan },
        attributes: [
          "id_detail_pesanan",
          "id_menu",
          "nama_menu",
          "jumlah",
          "harga_satuan",
        ],
        include: [
          {
            model: tbl_Menu,
            as: "menu_detail_as",
            attributes: ["id_menu", "nama_menu", "harga_menu", "sampul_menu"],
            required: false,
          },
        ],
      });
    }

    if (detail_destinasi.id_admin !== id_admin_login) {
      if (detail_destinasi.id_admin_pengelola !== id_admin_login) {
        return res.status(422).json({
          status: "error",
          success: false,
          message: "Tiket Tidak Sesuai Destinasi",
        });
      }
    }

    const data_pembayaran = await tbl_pembayaran.findOne({
      where: { id_pembayaran: data_pesanan.id_pembayaran },
      attributes: [
        "id_pembayaran",
        "id_wisatawan",
        "kode_pembayaran",
        "total_pembayaran",
        "tgl_pembayaran",
        "metode_pembayaran",
        "status_pembayaran",
      ],
    });

    if (
      data_pembayaran.status_pembayaran === "belum_bayar" ||
      data_pembayaran.status_pembayaran === "batal"
    ) {
      return res.status(422).json({
        status: "error",
        success: false,
        message:
          data_pembayaran.status_pembayaran === "belum_bayar"
            ? "Ticket belum dibayar!"
            : "Ticket dibatalkan!",
      });
    }

    const result = {
      id_pesanan: pesanan.id_pesanan,
      data_wisatawan,
      data_pembayaran,
      id_destinasi: pesanan.id_destinasi,
      kode_pesanan: pesanan.kode_pesanan,
      kode_qr: pesanan.kode_qr,
      tgl_booking: pesanan.tgl_booking,
      total_pesanan: pesanan.total_pesanan,
      jenis_destinasi: pesanan.nama_destinasi,
      tgl_pesanan: pesanan.createdAt,
      tgl_pesanan_selesai: pesanan.updatedAt,
      nama_destinasi:
        detail_destinasi.nama_destinasi ||
        detail_destinasi.nama_paket_wisata ||
        detail_destinasi.nama_penginapan ||
        detail_destinasi.nama_kuliner,
      detail_pesanan: detail_pesanans.map((item) => ({
        id_detail_pesanan: item.id_detail_pesanan,
        id_menu: item.id_menu,
        nama_menu: item.tiket_detail_as
          ? "Tiket " + item.tiket_detail_as.nama_destinasi
          : item.paket_wisata_detail_as
            ? item.paket_wisata_detail_as.nama_paket_wisata
            : item.kamar_detail_as
              ? item.kamar_detail_as.nama_kamar
              : item.homestay_detail_as
                ? item.homestay_detail_as.nama_paket_homestay
                : item.menu_detail_as
                  ? item.menu_detail_as.nama_menu
                  : "",
        jumlah: item.jumlah,
        harga_satuan: item.harga_satuan,
        sampul_menu: item.tiket_detail_as
          ? item.tiket_detail_as.sampul_destinasi
          : item.paket_wisata_detail_as
            ? item.paket_wisata_detail_as.sampul_paket_wisata
            : item.kamar_detail_as
              ? item.kamar_detail_as.sampul_kamar
              : item.homestay_detail_as
                ? item.homestay_detail_as.sampul_paket_homestay
                : item.menu_detail_as
                  ? item.menu_detail_as.sampul_menu
                  : "",
      })),
    };

    const tgl_checkIn = moment().tz("Asia/Jakarta");
    const tgl_kadaluarsa = moment(
      data_pesanan.tgl_booking,
      "YYYY-MM-DD HH:mm:ss",
    ).tz("Asia/Jakarta");

    if (tgl_checkIn.isAfter(tgl_kadaluarsa)) {
      return res.status(422).json({
        status: "info",
        success: false,
        message: "Tiket sudah kadaluarsa!",
      });
    }

    if (data_pesanan.status_pesanan === "selesai") {
      return res.status(422).json({
        status: "info",
        success: false,
        message: "Tiket sudah digunakan!",
        data: result,
      });
    }

    await data_pembayaran.update({
      status_pembayaran: "selesai" || data_pembayaran.status_pembayaran,
    });

    const data_destinasi =
      pesanan.nama_destinasi === "tbl_destinasi"
        ? await tbl_Wisata.findOne({
            where: { id_wisata: pesanan.id_destinasi },
          })
        : pesanan.nama_destinasi === "tbl_Paket_wisata"
          ? await tbl_Paket_wisata.findOne({
              where: { id_paket_wisata: pesanan.id_destinasi },
            })
          : pesanan.nama_destinasi === "tbl_Penginapan"
            ? await tbl_Penginapan.findOne({
                where: { id_penginapan: pesanan.id_destinasi },
              })
            : await tbl_Kuliner.findOne({
                where: { id_kuliner: pesanan.id_destinasi },
              });

    const detail_pesanan = await tbl_detail_pesanan.findOne({
      where: { id_pesanan: data_pesanan.id_pesanan },
    });
    await data_pesanan.update({
      status_pesanan: "selesai" || data_pesanan.status_pesanan,
      updatedAt: tgl_checkIn || data_pesanan.updatedAt,
    });
    const jumlah_pengunjung = detail_pesanan.jumlah;

    const currentDateTime = moment()
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss");
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const nama_table =
      pesanan.nama_destinasi === "tbl_destinasi"
        ? "tbl_Wisata"
        : pesanan.nama_destinasi === "tbl_Paket_wisata"
          ? "tbl_Paket_wisata"
          : pesanan.nama_destinasi === "tbl_Penginapan"
            ? "tbl_Penginapan"
            : "tbl_Kuliner";
    const id_table =
      pesanan.nama_destinasi === "tbl_destinasi"
        ? data_destinasi.id_wisata
        : pesanan.nama_destinasi === "tbl_Paket_wisata"
          ? data_destinasi.id_paket_wisata
          : pesanan.nama_destinasi === "tbl_Penginapan"
            ? data_destinasi.id_penginapan
            : data_destinasi.id_kuliner;

    let data_pengunjung = await tbl_data_pengunjung.findOne({
      where: {
        id_table,
        nama_table,
        tahun_data_pengunjung: currentYear,
        bulan_data_pengunjung: currentMonth,
        status_verifikasi: "verified",
      },
    });

    if (!data_pengunjung) {
      await tbl_data_pengunjung.create({
        id_table,
        id_admin_verifed: id_admin_login,
        nama_table,
        tahun_data_pengunjung: currentYear,
        bulan_data_pengunjung: currentMonth,
        jumlah_pengunjung_lokal: 0,
        jumlah_pengunjung_aplikasi: jumlah_pengunjung,
        jumlah_pengunjung_mancanegara: 0,
        jumlah_pegawai_laki: 0,
        jumlah_pegawai_perempuan: 0,
        status_verifikasi: "verified",
        createdAt: currentDateTime,
        updatedAt: currentDateTime,
      });
    } else {
      const jumlah_pengunjung_aplikasi_update =
        data_pengunjung.jumlah_pengunjung_aplikasi + jumlah_pengunjung;
      await data_pengunjung.update({
        jumlah_pengunjung_aplikasi: jumlah_pengunjung_aplikasi_update,
        updatedAt: currentDateTime,
      });
    }

    await data_destinasi.update(
      {
        total_pengunjung_destinasi:
          pesanan.nama_destinasi === "tbl_destinasi"
            ? (data_destinasi.total_pengunjung_destinasi || 0) +
              jumlah_pengunjung
            : data_destinasi.total_pengunjung_destinasi, // Tetap pada nilai sebelumnya jika bukan destinasi

        total_pengunjung_destinasi:
          pesanan.nama_destinasi === "tbl_Paket_wisata"
            ? (data_destinasi.total_pengunjung_destinasi || 0) +
              jumlah_pengunjung
            : data_destinasi.total_pengunjung_destinasi, // Tetap pada nilai sebelumnya jika bukan destinasi
        total_pengunjung_penginapan:
          pesanan.nama_destinasi === "tbl_Penginapan"
            ? (data_destinasi.total_pengunjung_penginapan || 0) +
              jumlah_pengunjung
            : data_destinasi.total_pengunjung_penginapan, // Tetap pada nilai sebelumnya jika bukan penginapan
        total_pengunjung_kuliner:
          pesanan.nama_destinasi === "tbl_Kuliner"
            ? (data_destinasi.total_pengunjung_kuliner || 0) + jumlah_pengunjung
            : data_destinasi.total_pengunjung_kuliner, // Tetap pada nilai sebelumnya jika bukan kuliner
        updatedAt: tgl_checkIn, // Timestamp untuk pembaruan
      },
      { where: { id_destinasi: data_destinasi.id_destinasi } }, // Pastikan id benar
    );
    res.status(200).json({
      status: "success",
      message: "Check-in berhasil!",
      data: result,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
};

module.exports = {
  get_all_keranjang,
  post_newAddTocart_tiket,
  post_newAddTocart_paketwisata,
  post_newAddTocart_menu,
  post_newAddTocart_kamar,
  post_newAddTocart_homestay,
  remove_cart,
  CheckExistKeranjangPesanan,
  AddPesanan,
  Get_Pesanan_belumBayar,
  Get_Pesanan_Eticket,
  Get_Pesanan_batalkan,
  Get_Pesanan_selesai,
  Post_Pesanan_dibatalkan,
  Post_Pesanan_dibayar,
  trxNotif, // Add_Pesanan_belumBayar,
  // MidtransCallback,
  // Post_Pesanan_Pembayaran,
  Post_Reopen_Payment,

  check_Pesanan_dibayar,
  Post_checkIn_destinasi,
};
