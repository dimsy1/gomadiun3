const db = require('./models');

const migrateData = async () => {
    try {
        console.log("🚀 [MIGRASI HIERARKI FINAL] Sinkronisasi id_admin & id_admin_pemilik...");

        // 1. Ambil data pesanan selesai
        const orders = await db.sequelize.query(
            "SELECT * FROM tbl_pesanan WHERE status_pesanan LIKE '%selesai%'", 
            { type: db.sequelize.QueryTypes.SELECT }
        );

        // 2. Load Master Data Industri dengan penyesuaian kolom
        // Wisata, Kuliner, Penginapan menggunakan id_admin_pengelola
        // Desa Wisata menggunakan id_admin
        const wisatas = await db.sequelize.query("SELECT id_wisata as id, nama_destinasi as name, id_admin_pengelola as managerId FROM tbl_wisata", { type: db.sequelize.QueryTypes.SELECT });
        const desas = await db.sequelize.query("SELECT id_desaWisata as id, nama_desaWisata as name, id_admin as managerId FROM tbl_desawisata", { type: db.sequelize.QueryTypes.SELECT });
        const kuliners = await db.sequelize.query("SELECT id_kuliner as id, nama_kuliner as name, id_admin_pengelola as managerId FROM tbl_kuliner", { type: db.sequelize.QueryTypes.SELECT });
        const penginapans = await db.sequelize.query("SELECT id_penginapan as id, nama_penginapan as name, id_admin_pengelola as managerId FROM tbl_penginapan", { type: db.sequelize.QueryTypes.SELECT });
        const pakets = await db.sequelize.query("SELECT id_paket_wisata as id, nama_paket_wisata as name, id_desaWisata FROM tbl_paket_wisata", { type: db.sequelize.QueryTypes.SELECT });

        // 3. Load Data Admin untuk mencari id_admin_pemilik (Atasan)
        const adminUsers = await db.sequelize.query("SELECT id_admin, id_admin_pemilik FROM tbl_admin", { type: db.sequelize.QueryTypes.SELECT });

        let count = 0;

        for (const order of orders) {
            let kategori = null;
            let realName = order.nama_destinasi; 
            let specificIds = { id_w: null, id_d: null, id_k: null, id_p: null };
            let currentManagerId = null;
            
            const tableCode = (order.nama_destinasi || "").toLowerCase().trim();
            const idDest = order.id_destinasi;

            // --- LOGIKA PENCOCOKAN ---
            if (tableCode.includes('paket')) {
                const found = pakets.find(p => p.id === idDest);
                if (found) {
                    kategori = 'desaWisata';
                    realName = found.name;
                    specificIds.id_d = found.id_desaWisata;
                    const masterDesa = desas.find(d => d.id === found.id_desaWisata);
                    if (masterDesa) currentManagerId = masterDesa.managerId;
                }
            } else if (tableCode.includes('kuliner')) {
                kategori = 'kuliner';
                const found = kuliners.find(k => k.id === idDest);
                if (found) { realName = found.name; currentManagerId = found.managerId; specificIds.id_k = idDest; }
            } else if (tableCode.includes('penginapan')) {
                kategori = 'penginapan';
                const found = penginapans.find(p => p.id === idDest);
                if (found) { realName = found.name; currentManagerId = found.managerId; specificIds.id_p = idDest; }
            } else {
                // Wisata atau Desa
                const foundWisata = wisatas.find(w => w.id === idDest);
                if (foundWisata) {
                    kategori = 'wisata'; realName = foundWisata.name; currentManagerId = foundWisata.managerId; specificIds.id_w = idDest;
                } else {
                    const foundDesa = desas.find(d => d.id === idDest);
                    if (foundDesa) {
                        kategori = 'desaWisata'; realName = foundDesa.name; currentManagerId = foundDesa.managerId; specificIds.id_d = idDest;
                    }
                }
            }

            if (kategori) {
                // Cari id_admin_pemilik (Atasan) dari tabel admin berdasarkan managerId
                let ownerId = null;
                if (currentManagerId) {
                    const detailAdmin = adminUsers.find(a => a.id_admin === currentManagerId);
                    ownerId = detailAdmin ? detailAdmin.id_admin_pemilik : null;
                }

                // INSERT KE tbl_history_transaksi
                await db.sequelize.query(`
                    INSERT INTO tbl_history_transaksi 
                    (id_pesanan_asli, id_wisatawan, id_admin, id_admin_pemilik, nama_destinasi, kategori, id_wisata, id_desaWisata, id_kuliner, id_penginapan, total_pesanan, tanggal_transaksi)
                    VALUES (:id_asli, :id_user, :id_adm, :id_owner, :nama, :kat, :id_w, :id_d, :id_k, :id_p, :total, :tgl)
                `, {
                    replacements: {
                        id_asli: order.id_pesanan,
                        id_user: order.id_wisatawan || 0,
                        id_adm: currentManagerId,  // id_admin (pengelola)
                        id_owner: ownerId,         // id_admin_pemilik (atasan)
                        nama: realName, 
                        kat: kategori,
                        id_w: specificIds.id_w, id_d: specificIds.id_d, id_k: specificIds.id_k, id_p: specificIds.id_p,
                        total: order.total_pesanan || 0,
                        tgl: order.createdAt
                    }
                });
                count++;
            }
        }
        console.log(`✅ BERHASIL! ${count} data dipindahkan. Kolom id_admin dan id_admin_pemilik telah terisi.`);
        process.exit();
    } catch (error) {
        console.error("❌ ERROR MIGRASI:", error.message);
        process.exit(1);
    }
};

migrateData();