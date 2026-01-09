const router = require('express').Router();

const {
    get_all_menu_byKuliner,
    get_all_menu_byAdmin,
    add_data_menu_byAdmin,
    update_data_menu_byAdmin,
    delete_data_menu_byAdmin,
    get_detail_menu_byAdmin
} = require('../../controllers/MenuKulinerController')

router.get("/kuliner/menu/:id_kuliner", get_all_menu_byKuliner);


router.get("/menu/get_data/byAdmin", get_all_menu_byAdmin);
router.post("/menu/add_data/byAdmin", add_data_menu_byAdmin);
router.put("/menu/update/byAdmin/:id_menu", update_data_menu_byAdmin);
router.delete("/menu/delete/byAdmin/:id_menu", delete_data_menu_byAdmin);
router.get("/menu/detail/byAdmin/:id_menu", get_detail_menu_byAdmin);


module.exports = router;