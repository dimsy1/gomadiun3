const router = require('express').Router();

const {
    get_all_penginapan,
    get_detail_penginapan,
    get_all_penginapan_ByDesawisata,
    get_all_homestay_ByPenginapan,
    add_ulasan_penginapan,
    get_ulasan_penginapan,

    //admin
    get_all_penginapan_byAdmin,
    get_detail_penginapan_byAdmin,
    add_data_penginapan_byAdmin,
    update_data_penginapan_byAdmin,
    put_verifikasi_penginapan,
    delete_data_penginapan_byAdmin,
    add_fasilitas_byAdmin,

    //kamar hotel
    get_all_kamar_byAdmin,
    get_all_kamar_ByPenginapan,
    add_data_kamar_byAdmin,
    update_data_kamar_byAdmin,
    put_verifikasi_kamar,
    delete_data_kamar_byAdmin,
    get_detail_kamar_byAdmin,

    //kamar homestay
    get_all_homestay_byAdmin,
    add_fasilitas_homestay_byAdmin,
    add_data_homestay_byAdmin,
    update_data_homestay_byAdmin,
    put_verifikasi_homestay,
    delete_data_homestay_byAdmin,
    get_detail_homestay_byAdmin,
} = require('../../controllers/PenginapanController')

router.get("/penginapan/get_all", get_all_penginapan);
router.get("/penginapan/:id_penginapan", get_detail_penginapan);
router.get("/penginapan/kamar/:id_penginapan", get_all_kamar_ByPenginapan);
router.get("/penginapan/homestay/:id_penginapan", get_all_homestay_ByPenginapan);
router.get("/penginapan/get_all/:id_desaWisata", get_all_penginapan_ByDesawisata);
router.post("/penginapan/add/ulasan/:id_penginapan", add_ulasan_penginapan);
router.get("/penginapan/ulasan/:id_penginapan", get_ulasan_penginapan);

//admin penginapan
router.get("/penginapan/get_data/byAdmin", get_all_penginapan_byAdmin);
router.get("/penginapan/detail/byAdmin/:id_penginapan", get_detail_penginapan_byAdmin);
router.post("/penginapan/add_data/byAdmin", add_data_penginapan_byAdmin);
router.post("/penginapan/add_fasilitas/byAdmin", add_fasilitas_byAdmin);
router.put("/penginapan/update/byAdmin/:id_penginapan", update_data_penginapan_byAdmin);
router.put("/penginapan/verif/byAdmin/:id_penginapan", put_verifikasi_penginapan);
router.delete("/penginapan/delete/byAdmin/:id_penginapan", delete_data_penginapan_byAdmin);

//kamar hotel
router.get("/kamar/get_data/byAdmin", get_all_kamar_byAdmin);
router.get("/kamar/detail/byAdmin/:id_kamar", get_detail_kamar_byAdmin);
router.post("/kamar/add_data/byAdmin", add_data_kamar_byAdmin);
router.put("/kamar/update/byAdmin/:id_kamar", update_data_kamar_byAdmin);
router.put("/kamar/verif/byAdmin/:id_kamar", put_verifikasi_kamar);
router.delete("/kamar/delete/byAdmin/:id_kamar", delete_data_kamar_byAdmin);

//kamar homestay
router.get("/homestay/get_data/byAdmin", get_all_homestay_byAdmin);
router.post("/homestay/add_data/byAdmin", add_data_homestay_byAdmin);
router.put("/homestay/update/byAdmin/:id_paket_homestay", update_data_homestay_byAdmin);
router.put("/homestay/verif/byAdmin/:id_paket_homestay", put_verifikasi_homestay);
router.delete("/homestay/delete/byAdmin/:id_paket_homestay", delete_data_homestay_byAdmin);
router.get("/homestay/detail/byAdmin/:id_paket_homestay", get_detail_homestay_byAdmin);
router.post("/homestay/add_fasilitas/byAdmin", add_fasilitas_homestay_byAdmin);


module.exports = router;