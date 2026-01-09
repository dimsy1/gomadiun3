const router = require('express').Router();

const {
    get_all_paket_wisata,
  get_recomendasi_paket_wisata,
  get_detail_paket_wisata,
  get_all_paket_wisata_byDesawisata,
  add_ulasan_paket_wisata,
  get_ulasan_paket_wisata,

    //admin
    get_all_paket_wisata_byAdmin,
  get_detail_paket_wisata_byAdmin,
  add_data_paket_wisata_byAdmin,
  put_verifikasi_paket_wisata,
  delete_data_paket_wisata_byAdmin,
  update_data_paket_wisata_byAdmin,
  put_update_maps_paket_wisata,
  add_fasilitas_paket_wisata_byAdmin
} = require('../../controllers/PaketWisataController')


router.get("/paket_wisata/get_all", get_all_paket_wisata);
router.get("/paket_wisata/get_all/:id_desaWisata", get_all_paket_wisata_byDesawisata);
router.get("/paket_wisata/detail/:id_paket_wisata", get_detail_paket_wisata);
router.get("/paket_wisata/ulasan/:id_paket_wisata", get_ulasan_paket_wisata);
router.post("/paket_wisata/add/ulasan/:id_paket_wisata", add_ulasan_paket_wisata);
router.post("/paket_wisata/recomend", get_recomendasi_paket_wisata);

//admin
router.get("/paket_wisata/get_data/byAdmin", get_all_paket_wisata_byAdmin);
router.get("/paket_wisata/detail/byAdmin/:id_paket_wisata", get_detail_paket_wisata_byAdmin);
router.post("/paket_wisata/add_data/byAdmin", add_data_paket_wisata_byAdmin);
router.post("/paket_wisata/add_fasilitas/byAdmin", add_fasilitas_paket_wisata_byAdmin);
router.put("/paket_wisata/update/byAdmin/:id_paket_wisata", update_data_paket_wisata_byAdmin);
router.put("/maps_paket_wisata/update/byAdmin/:id_paket_wisata", put_update_maps_paket_wisata);
router.delete("/paket_wisata/delete/byAdmin/:id_paket_wisata", delete_data_paket_wisata_byAdmin);
router.put("/paket_wisata/verif/byAdmin/:id_paket_wisata", put_verifikasi_paket_wisata);

module.exports = router;