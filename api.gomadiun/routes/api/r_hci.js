const router = require('express').Router();
const multer = require('multer');
const upload = multer();


const { 
    calculateHCIForAllKecamatan,
    getAllHCIHistory,
    deleteHCIHistory,
    exportHCIHistoryToExcel 
} = require('../../controllers/hciController');

router.get('/hci/calculate-hci', calculateHCIForAllKecamatan);
router.get('/hci/get_all', getAllHCIHistory);
router.delete('/hci/delete/:id', deleteHCIHistory);
router.post('/hci/export-history/', upload.none(), exportHCIHistoryToExcel);



module.exports = router;
