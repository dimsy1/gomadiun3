const router = require('express').Router();

const {
    get_all_wisata,
    get_recomendasi_wisata,
    get_detail_wisata,
    get_all_wisata_byDesawisata,
    get_ulasan_wisata,
    add_ulasan_wisata,
    //360===
    get_virtual_tour,
    // get_weather_madiun,
    getGeoJSONCuaca,
    getGeoJSONCuacaById,
    getCuacaDetailById,
    // getGeoJSONMapData,
    get_geojson_wisata,

    //admin
    get_all_wisata_byAdmin,
    get_detail_wisata_byAdmin,
    add_data_wisata_byAdmin,
    put_verifikasi_wisata,
    delete_data_wisata_byAdmin,
    update_data_wisata_byAdmin,
    put_update_maps_wisata,
    add_fasilitas_wisata_byAdmin
} = require('../../controllers/WisataController')


router.get("/wisata/get_all", get_all_wisata);
router.get("/wisata/get_all/:id_desaWisata", get_all_wisata_byDesawisata);
router.get("/wisata/detail/:id_wisata", get_detail_wisata);
router.get("/wisata/ulasan/:id_wisata", get_ulasan_wisata);
router.post("/wisata/add/ulasan/:id_wisata", add_ulasan_wisata);
router.post("/wisata/recomend", get_recomendasi_wisata);
// 360===
router.get("/wisata/virtual-tour/:id_wisata", get_virtual_tour);


// router.get("/cuaca/get_madiun", get_weather_madiun);
router.get('/cuaca/geojson', getGeoJSONCuaca);
router.get('/cuaca/geojson/:id_wisata', getGeoJSONCuacaById);
router.get('/cuaca/detail/:id_wisata', getCuacaDetailById);
// router.get('/geojson/cuaca', getGeoJSONMapData);

router.get('/geojson/wisata', get_geojson_wisata);



//admin
router.get("/wisata/get_data/byAdmin", get_all_wisata_byAdmin);
router.get("/wisata/detail/byAdmin/:id_wisata", get_detail_wisata_byAdmin);
router.post("/wisata/add_data/byAdmin", add_data_wisata_byAdmin);
router.post("/wisata/add_fasilitas/byAdmin", add_fasilitas_wisata_byAdmin);
router.put("/wisata/update/byAdmin/:id_wisata", update_data_wisata_byAdmin);
router.put("/maps/update/byAdmin/:id_wisata", put_update_maps_wisata);
router.delete("/wisata/delete/byAdmin/:id_wisata", delete_data_wisata_byAdmin);
router.put("/wisata/verif/byAdmin/:id_wisata", put_verifikasi_wisata);

module.exports = router;