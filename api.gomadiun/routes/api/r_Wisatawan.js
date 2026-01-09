const router = require('express').Router();

const {
    get_all,
    get_detail,
    put_wisatawan,
    post_wisatawan,
    checkExistEmailWisatawan
} = require('../../controllers/WisatawanController')


router.get("/wisatawan/get_all", get_all);
router.get("/wisatawan/get_detail", get_detail);
router.post("/wisatawan", post_wisatawan);
router.put("/wisatawan/update_data", put_wisatawan);
router.post("/wisatawan/checkEmail", checkExistEmailWisatawan);

module.exports = router;