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
                kode_qr: kode_qr
            },
        });

        if (!data_pesanan) {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: "Qrcode Invalid!",
            });
        }

        const pesanan = data_pesanan.dataValues;

        const data_wisatawan = await tbl_wisatawan.findOne({
            where: {
                id_wisatawan: pesanan.id_wisatawan
            }, attributes: [
                "name",
                "no_hp",
                "email",
                "profile",
            ]
        });

        let detail_destinasi = {};
        let detail_pesanans = [];

        if (pesanan.nama_destinasi === 'tbl_destinasi') {
            detail_destinasi = await tbl_Wisata.findOne({
                where: { id_wisata: pesanan.id_destinasi },
                attributes: [
                    "id_wisata",
                    "id_admin",
                    "id_admin_pengelola",
                    "nama_destinasi",
                ]
            });

            detail_pesanans = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                    "id_detail_pesanan",
                    "id_menu",
                    "nama_menu",
                    "jumlah",
                    "harga_satuan"
                ],
                include: [
                    {
                        model: tbl_Wisata,
                        as: "tiket_detail_as",
                        attributes: [
                            "id_wisata",
                            "nama_destinasi",
                            "harga_tiket",
                            "sampul_destinasi"
                        ],
                        required: false,
                    },
                ]
            });

        } else if (pesanan.nama_destinasi === 'tbl_paket_wisata') {
            detail_destinasi = await tbl_Paket_wisata.findOne({
                where: { id_paket_wisata: pesanan.id_destinasi },
                attributes: [
                    "id_paket_wisata",
                    "id_admin",
                    "id_admin_pengelola",
                    "nama_paket_wisata",
                ]
            });

            detail_pesanans = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                    "id_detail_pesanan",
                    "id_menu",
                    "nama_menu",
                    "jumlah",
                    "harga_satuan"
                ],
                include: [
                    {
                        model: tbl_Paket_wisata,
                        as: "paket_wisata_detail_as",
                        attributes: [
                            "id_paket_wisata",
                            "nama_paket_wisata",
                            "harga_paket_wisata",
                            "sampul_paket_wisata"
                        ],
                        required: false,
                    },
                ]
            });

        } else if (pesanan.nama_destinasi === 'tbl_penginapan') {
            detail_destinasi = await tbl_penginapan.findOne({
                where: { id_penginapan: pesanan.id_destinasi },
                attributes: [
                    "id_penginapan",
                    "id_admin",
                    "id_admin_pengelola",
                    "nama_penginapan",
                ]
            });

            detail_pesanans = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                    "id_detail_pesanan",
                    "id_menu",
                    "nama_menu",
                    "jumlah",
                    "harga_satuan"
                ],
                include: [
                    {
                        model: tbl_Kamar,
                        as: "kamar_detail_as",
                        attributes: [
                            "id_kamar",
                            "nama_kamar",
                            "harga",
                            "sampul_kamar"
                        ],
                        required: false,
                    },
                ]
            });

        } else if (pesanan.nama_destinasi === 'tbl_kuliner') {
            detail_destinasi = await tbl_Kuliner.findOne({
                where: { id_kuliner: pesanan.id_destinasi },
                attributes: [
                    "id_kuliner",
                    "id_admin",
                    "id_admin_pengelola",
                    "nama_kuliner",
                ]
            });

            detail_pesanans = await tbl_detail_pesanan.findAll({
                where: { id_pesanan: pesanan.id_pesanan },
                attributes: [
                    "id_detail_pesanan",
                    "id_menu",
                    "nama_menu",
                    "jumlah",
                    "harga_satuan"
                ],
                include: [
                    {
                        model: tbl_Menu,
                        as: "menu_detail_as",
                        attributes: [
                            "id_menu",
                            "nama_menu",
                            "harga_menu",
                            "sampul_menu"
                        ],
                        required: false,
                    },
                ]
            });
        }

        if (detail_destinasi.id_admin !== id_admin_login) {

            if (detail_destinasi.id_admin_pengelola !== id_admin_login) {
                return res.status(422).json({
                    status: 'error',
                    success: false,
                    message: "Qrcode Invalid!",
                });
            }
        }

        const data_pembayaran = await tbl_pembayaran.findOne({
            where: {
                id_pembayaran: data_pesanan.id_pembayaran
            },
            attributes: [
                "id_pembayaran",
                "id_wisatawan",
                "kode_pembayaran",
                "total_pembayaran",
                "tgl_pembayaran",
                "metode_pembayaran",
                "status_pembayaran",
            ]
        });

        if (data_pembayaran.status_pembayaran === 'belum_bayar') {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: "Ticket belum dibayar!",
            });
        }

        if (data_pembayaran.status_pembayaran === 'batal') {
            return res.status(422).json({
                status: 'error',
                success: false,
                message: "Ticket dibatalkan!",
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
            // Perbaikan pada bagian ini
            nama_destinasi: detail_destinasi.id_wisata 
            ? detail_destinasi.nama_destinasi 
            : detail_destinasi.id_kuliner 
            ? detail_destinasi.nama_kuliner 
            : detail_destinasi.id_penginapan
            ? detail_destinasi.nama_penginapan
            : detail_destinasi.nama_paket_wisata,
            detail_pesanan: detail_pesanans.map((item) => ({
                id_detail_pesanan: item.id_detail_pesanan,
                id_menu: item.id_menu,
                nama_menu: item.tiket_detail_as ? "Tiket " + item.tiket_detail_as.nama_destinasi : item.menu_detail_as ? item.menu_detail_as.nama_menu : item.kamar_detail_as ? item.kamar_detail_as.nama_kamar : item.paket_wisata_detail_as.nama_paket_wisata,
                jumlah: item.jumlah,
                harga_satuan: item.harga_satuan,
                sampul_menu: item.tiket_detail_as ? item.tiket_detail_as.sampul_destinasi : item.menu_detail_as ? item.menu_detail_as.sampul_menu : item.kamar_detail_as ? item.kamar_detail_as.sampul_kamar : item.paket_wisata_detail_as.sampul_paket_wisata,
            }))
        };        

        const tgl_kadaluarsa = moment(data_pesanan.tgl_booking, "YYYY-MM-DD HH:mm:ss").tz("Asia/Jakarta");
        const tgl_checkIn = moment().tz("Asia/Jakarta");

        console.log(tgl_kadaluarsa.format("YYYY-MM-DD HH:mm:ss"));
        console.log(tgl_checkIn.format("YYYY-MM-DD HH:mm:ss"));

        if (tgl_checkIn.isAfter(tgl_kadaluarsa)) {
            return res.status(422).json({
                status: 'info',
                success: false,
                message: "Tiket sudah kadaluarsa!",
            });
        }

        if (data_pesanan.status_pesanan === 'selesai') {
            return res.status(422).json({
                status: 'info',
                success: false,
                message: "Tiket sudah digunakan!",
                data: result,
            });
        }

        await data_pembayaran.update({
            status_pembayaran: "selesai" || data_pembayaran.status_pembayaran,
        });

        const data_destinasi = await tbl_Wisata.findOne({
            where: {
                id_wisata: data_pesanan.id_destinasi
            },
        });

        const detail_pesanan = await tbl_detail_pesanan.findOne({
            where: {
                id_pesanan: data_pesanan.id_pesanan
            },
        });

        await data_pesanan.update({
            status_pesanan: 'selesai' || data_pesanan.status_pesanan,
            updatedAt: tgl_checkIn || data_pesanan.updatedAt,
        });

        const update_pengunjung_destinasi = data_destinasi.total_pengunjung_destinasi + detail_pesanan.jumlah

        const currentDateTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;


        if (data_destinasi.id_wisata) {
            const data_pengunjung_wisata = await tbl_data_pengunjung.findOne({
                where: {
                    id_table: data_destinasi.id_wisata,
                    nama_table: "tbl_wisata",
                    tahun_data_pengunjung: currentYear,
                    bulan_data_pengunjung: currentMonth,
                    status_verifikasi: 'verified'
                }
            });
    
            if (!data_pengunjung_wisata) {
                // Buat data baru untuk tbl_wisata
                await tbl_data_pengunjung.create({
                    id_table: data_destinasi.id_wisata,
                    id_admin_verifed: 1,
                    nama_table: "tbl_wisata",
                    tahun_data_pengunjung: currentYear,
                    bulan_data_pengunjung: currentMonth,
                    jumlah_pengunjung_lokal: 0,
                    jumlah_pengunjung_aplikasi: detail_pesanan.jumlah,
                    jumlah_pengunjung_mancanegara: 0,
                    jumlah_pegawai_laki: 0,
                    jumlah_pegawai_perempuan: 0,
                    status_verifikasi: 'verified',
                    createdAt: currentDateTime,
                    updatedAt: currentDateTime
                });
            } else {
                // Update data tbl_wisata yang sudah ada
                const jumlah_pengunjung_aplikasi_update = data_pengunjung_wisata.jumlah_pengunjung_aplikasi + detail_pesanan.jumlah;
                await data_pengunjung_wisata.update({
                    jumlah_pengunjung_aplikasi: jumlah_pengunjung_aplikasi_update,
                    updatedAt: currentDateTime
                });
            }
        }
    
        // Jika destinasi adalah paket wisata
        if (data_destinasi.id_paket_wisata) {
            const data_pengunjung_paket_wisata = await tbl_data_pengunjung.findOne({
                where: {
                    id_table: data_destinasi.id_paket_wisata,
                    nama_table: "tbl_paket_wisata",
                    tahun_data_pengunjung: currentYear,
                    bulan_data_pengunjung: currentMonth,
                    status_verifikasi: 'verified'
                }
            });
    
            if (!data_pengunjung_paket_wisata) {
                // Buat data baru untuk tbl_paket_wisata
                await tbl_data_pengunjung.create({
                    id_table: data_destinasi.id_paket_wisata,
                    id_admin_verifed: 1,
                    nama_table: "tbl_paket_wisata",
                    tahun_data_pengunjung: currentYear,
                    bulan_data_pengunjung: currentMonth,
                    jumlah_pengunjung_lokal: 0,
                    jumlah_pengunjung_aplikasi: detail_pesanan.jumlah,
                    jumlah_pengunjung_mancanegara: 0,
                    jumlah_pegawai_laki: 0,
                    jumlah_pegawai_perempuan: 0,
                    status_verifikasi: 'verified',
                    createdAt: currentDateTime,
                    updatedAt: currentDateTime
                });
            } else {
                // Update data tbl_paket_wisata yang sudah ada
                const jumlah_pengunjung_aplikasi_update = data_pengunjung_paket_wisata.jumlah_pengunjung_aplikasi + detail_pesanan.jumlah;
                await data_pengunjung_paket_wisata.update({
                    jumlah_pengunjung_aplikasi: jumlah_pengunjung_aplikasi_update,
                    updatedAt: currentDateTime
                });
            }
        }

        if (data_destinasi.id_kamar) {
            const data_pengunjung_kamar = await tbl_data_pengunjung.findOne({
                where: {
                    id_table: data_destinasi.id_kamar,
                    nama_table: "tbl_kamar",
                    tahun_data_pengunjung: currentYear,
                    bulan_data_pengunjung: currentMonth,
                    status_verifikasi: 'verified'
                }
            });
    
            if (!data_pengunjung_kamar) {
                // Buat data baru untuk tbl_paket_wisata
                await tbl_data_pengunjung.create({
                    id_table: data_destinasi.id_kamar,
                    id_admin_verifed: 1,
                    nama_table: "tbl_kamar",
                    tahun_data_pengunjung: currentYear,
                    bulan_data_pengunjung: currentMonth,
                    jumlah_pengunjung_lokal: 0,
                    jumlah_pengunjung_aplikasi: detail_pesanan.jumlah,
                    jumlah_pengunjung_mancanegara: 0,
                    jumlah_pegawai_laki: 0,
                    jumlah_pegawai_perempuan: 0,
                    status_verifikasi: 'verified',
                    createdAt: currentDateTime,
                    updatedAt: currentDateTime
                });
            } else {
                // Update data tbl_paket_wisata yang sudah ada
                const jumlah_pengunjung_aplikasi_update = data_pengunjung_kamar.jumlah_pengunjung_aplikasi + detail_pesanan.jumlah;
                await data_pengunjung_kamar.update({
                    jumlah_pengunjung_aplikasi: jumlah_pengunjung_aplikasi_update,
                    updatedAt: currentDateTime
                });
            }
        }
    
        // Update data destinasi
        await data_destinasi.update({
            total_pengunjung_destinasi: update_pengunjung_destinasi || data_destinasi.total_pengunjung_destinasi,
            updatedAt: tgl_checkIn || data_destinasi.updatedAt,
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Check in berhasil!',
            data: result,
        });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: 'Terjadi kesalahan', error });
}}