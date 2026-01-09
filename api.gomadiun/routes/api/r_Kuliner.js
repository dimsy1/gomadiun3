const router = require('express').Router();

const {
  get_all_kuliner,
  get_detail_kuliner,
  get_all_kuliner_ByDesawisata,
  add_ulasan_kuliner,
  get_ulasan_kuliner,
  get_all_kuliner_byAdmin,
  get_detail_kuliner_byAdmin,
  add_data_kuliner_byAdmin,
  update_data_kuliner_byAdmin,
  put_verifikasi_kuliner,
  delete_data_kuliner_byAdmin,
  put_update_maps_kuliner
} = require('../../controllers/KulinerController')


router.get("/kuliner/get_all", get_all_kuliner);
router.get("/kuliner/:id_kuliner", get_detail_kuliner);
router.get("/kuliner/get_all/:id_desaWisata", get_all_kuliner_ByDesawisata);
router.post("/kuliner/add/ulasan/:id_kuliner", add_ulasan_kuliner);
router.get("/kuliner/ulasan/:id_kuliner", get_ulasan_kuliner);
router.get("/kuliner/get_data/byAdmin", get_all_kuliner_byAdmin);
router.get("/kuliner/detail/byAdmin/:id_kuliner", get_detail_kuliner_byAdmin);
router.post("/kuliner/add_data/byAdmin", add_data_kuliner_byAdmin);
router.put("/kuliner/update/byAdmin/:id_kuliner", update_data_kuliner_byAdmin);
router.put("/kuliner/verif/byAdmin/:id_kuliner", put_verifikasi_kuliner);
router.delete("/kuliner/delete/byAdmin/:id_kuliner", delete_data_kuliner_byAdmin);
router.put("/maps_kuliner/update/byAdmin/:id_kuliner", put_update_maps_kuliner);

module.exports = router;