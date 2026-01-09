const router = require('express').Router();

const {
    get_all_desawisata,
    get_detail_desawisata,
    get_geojson_desa,

    //admin
    get_all_desawisata_byAdmin,
    get_detail_desawisata_byAdmin,
    add_data_desawisata_byAdmin,
    update_data_desawisata_byAdmin,
    put_verifikasi_desawisata,
    delete_data_desawisata_byAdmin
} = require('../../controllers/DesawisataController')


router.get("/desawisata/get_all", get_all_desawisata);
router.get("/desawisata/:id_desaWisata", get_detail_desawisata);
router.get('/geojson/desa', get_geojson_desa);

//admin
router.get("/desawisata/get_all/byAdmin", get_all_desawisata_byAdmin);
router.get("/desawisata/detail/byAdmin/:id_desaWisata", get_detail_desawisata_byAdmin);
router.post("/desawisata/add_data/byAdmin", add_data_desawisata_byAdmin);
router.put("/desawisata/update/byAdmin/:id_desaWisata", update_data_desawisata_byAdmin);
router.delete("/desawisata/delete/byAdmin/:id_desaWisata", delete_data_desawisata_byAdmin);
router.put("/desawisata/verif/byAdmin/:id_desaWisata", put_verifikasi_desawisata);

module.exports = router;