const router = require('express').Router();

const {
    add_berita_byAdmin,
    update_berita_byAdmin,
    get_all_berita,
    get_detail_berita_byid,
    delete_berita_byAdmin
} = require('../../controllers/BeritaController');


router.post('/berita/add', add_berita_byAdmin);
router.put('/berita/update/:id_berita', update_berita_byAdmin);
router.get('/berita/get_all', get_all_berita);
router.get('/berita/detail/:id_berita', get_detail_berita_byid);
router.delete('/berita/delete/:id_berita', delete_berita_byAdmin);







module.exports = router;
