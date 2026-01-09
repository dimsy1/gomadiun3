const router = require('express').Router();

const {
    get_all_userPengelola,
    post_Admin_userPengelola,
    put_Admin_userPengelola,
    delete_Pengelola_byAdmin,
    put_Pass_pengelola,
    get_all_userIndustri,
} = require('../../controllers/PengelolaController')

router.get("/pengelola/get_all", get_all_userPengelola);
router.get("/industri/get_all", get_all_userIndustri);
router.post("/pengelola/add_data", post_Admin_userPengelola);
router.put("/pengelola/update/:id_admin", put_Admin_userPengelola);
router.delete("/pengelola/delete/:id_admin", delete_Pengelola_byAdmin);
router.put("/pengelola/chagepass/:id_admin", put_Pass_pengelola);

module.exports = router;