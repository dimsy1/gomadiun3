const router = require('express').Router();

const {
    get_all_data_pengunjung_noverified_byAdmin,
    export_data_pengunjung_to_excel,
    get_all_data_pengunjung_byAdmin,
    update_data_pengunjung_byAdmin,
    delete_data_pengunjung_byAdmin,
    add_data_data_pengunjung_byAdmin,
    put_verifikasi_data_pengunjung
} = require('../../controllers/DataPengunjungController')

router.get("/pengunjung/get_all_noverified/byAdmin/:id_table", get_all_data_pengunjung_noverified_byAdmin);
// router.get('/pengunjung/export-data-pengunjung/:id_table', export_data_pengunjung_to_excel);
router.get('/pengunjung/export-data-pengunjung/:type/:id_table', export_data_pengunjung_to_excel);
router.get("/pengunjung/get_all/byAdmin/:id_table", get_all_data_pengunjung_byAdmin);
router.post("/pengunjung/add_data/byAdmin", add_data_data_pengunjung_byAdmin);
router.put("/pengunjung/update/byAdmin/:id_data_pengunjung", update_data_pengunjung_byAdmin);
router.put("/pengunjung/verifikasi/byAdmin/:id_data_pengunjung", put_verifikasi_data_pengunjung);
router.delete("/pengunjung/delete/byAdmin/:id_data_pengunjung", delete_data_pengunjung_byAdmin);

module.exports = router;