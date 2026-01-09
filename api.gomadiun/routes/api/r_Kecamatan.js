const router = require('express').Router();

const {
    add_kecamatan_byAdmin,
    // calculateHCI,
    getAllKecamatan,
    update_kecamatan,
    delete_kecamatan_byId
} = require('../../controllers/KecamatanController');


router.post("/kecamatan/add", add_kecamatan_byAdmin);
// router.post("/kecamatan/hitung-hci", calculateHCI);
router.get("/kecamatan/get_all", getAllKecamatan);
router.put("/kecamatan/update/:id", update_kecamatan);
router.delete("/kecamatan/delete/:id", delete_kecamatan_byId);




module.exports = router;
