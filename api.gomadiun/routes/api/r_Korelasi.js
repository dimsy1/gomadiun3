const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const upload = multer({ dest: path.join(__dirname, '../../uploads/') });

const {
  uploadEvaluasi,
  hitungKorelasi,
  hitungKorelasiJSON
} = require('../../controllers/evaluasiKorelasiController');

router.post('/korelasi', uploadEvaluasi, hitungKorelasi);
router.post('/hci/hitung-korelasi', upload.fields([{ name: 'hci' }, { name: 'kunjungan' }]), hitungKorelasiJSON);

module.exports = router;
