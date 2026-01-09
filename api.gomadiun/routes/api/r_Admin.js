const router = require('express').Router();

const {
    get_all_superAdmin,
    get_all_adminDinas,
    get_all_adminPengelola,
    get_all_adminIndustri,

    post_Admin_superAdmin,
    post_Admin_adminDinas,
    post_Admin_adminPengelola,
    post_Admin_adminIndustri,

    put_Admin_superAdmin,
    put_Admin_adminDinas,
    put_Admin_adminPengelola,
    put_Admin_adminIndustri,

    delete_Admin_onlyBysuperAdmin,
    put_Pass_Admin,
    get_DetailadminDinas,

    //option
    get_all_OptionadminPengelola,
    get_all_OptionadminIndustri,
    get_all_OptionadminPengelolaAndIndustri,
    get_all_OptionadminDinas
} = require('../../controllers/AdminController')


router.get("/superAdmin/get_all", get_all_superAdmin);
router.get("/adminDinas/get_all", get_all_adminDinas);
router.get("/adminPengelola/get_all", get_all_adminPengelola);
router.get("/adminIndustri/get_all", get_all_adminIndustri);

router.post("/superAdmin/add_data", post_Admin_superAdmin);
router.post("/adminDinas/add_data", post_Admin_adminDinas);
router.post("/adminPengelola/add_data", post_Admin_adminPengelola);
router.post("/adminIndustri/add_data", post_Admin_adminIndustri);

router.put("/superAdmin/update/:id_admin", put_Admin_superAdmin);
router.put("/adminDinas/update/:id_admin", put_Admin_adminDinas);
router.put("/adminPengelola/update/:id_admin", put_Admin_adminPengelola);
router.put("/adminIndustri/update/:id_admin", put_Admin_adminIndustri);

router.delete("/admin/delete/:id_admin", delete_Admin_onlyBysuperAdmin);
router.put("/changepass/admin/:id_admin", put_Pass_Admin);
router.get("/detail/adminDinas/:id_admin", get_DetailadminDinas);

//option
router.get("/option/adminpengelola", get_all_OptionadminPengelola);
router.get("/option/adminindustri", get_all_OptionadminIndustri);
router.get("/option/admin/pengelolaindustri", get_all_OptionadminPengelolaAndIndustri);
router.get("/option/admindinas", get_all_OptionadminDinas);

module.exports = router;