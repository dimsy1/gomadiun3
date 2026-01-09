const router = require('express').Router();

const {
    get_all_kategori_menu_byKuliner
} = require('../../controllers/KategoriMenuKulinerController')


router.get("/kuliner/menu/kategori/:id_kuliner", get_all_kategori_menu_byKuliner);

module.exports = router; 