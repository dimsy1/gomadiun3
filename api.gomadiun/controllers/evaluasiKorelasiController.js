const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const ExcelJS = require('exceljs');
const ss = require('simple-statistics');

const uploadDir = path.join(__dirname, '../../uploads/evaluasi');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '_' + timestamp + ext);
  }
});

const upload = multer({ storage });

function extractDataFromExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet);
}

function spearmanCorrelation(x, y) {
  const rank = (arr) => {
    const sorted = [...arr].map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    const ranks = Array(arr.length);
    for (let i = 0; i < sorted.length;) {
      let j = i;
      while (j < sorted.length - 1 && sorted[j][0] === sorted[j + 1][0]) j++;
      const avgRank = (i + j + 2) / 2;
      for (let k = i; k <= j; k++) ranks[sorted[k][1]] = avgRank;
      i = j + 1;
    }
    return ranks;
  };

  const rx = rank(x);
  const ry = rank(y);
  const n = x.length;
  const d2 = rx.map((r, i) => Math.pow(r - ry[i], 2)).reduce((a, b) => a + b, 0);
  return 1 - (6 * d2) / (n * (n * n - 1));
}

function calculatePrecisionRecallF1(TP, FP, FN) {
  const precision = TP + FP === 0 ? 0 : TP / (TP + FP);
  const recall = TP + FN === 0 ? 0 : TP / (TP + FN);
  const f1 = (precision + recall) === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return {
    precision: precision.toFixed(4),
    recall: recall.toFixed(4),
    f1: f1.toFixed(4)
  };
}

const getKategoriHCI = (nilai) => {
   if (nilai >= 90) return 'Ideal'; // Mencakup 90-100
    if (nilai >= 80) return 'Sangat Baik'; // Mencakup 80 - 89.99
    if (nilai >= 70) return 'Baik'; // Mencakup 70 - 79.99
    if (nilai >= 60) return 'Cukup Baik'; // Mencakup 60 - 69.99
    if (nilai >= 50) return 'Ditoleransi'; // Mencakup 50 - 59.99
    if (nilai >= 40) return 'Batas Kondisi Ditoleransi (Umum)'; // Mencakup 40 - 49.99
    if (nilai >= 30) return 'Tidak Baik'; // Mencakup 30 - 39.99
    if (nilai >= 20) return 'Sangat Tidak Baik'; // Mencakup 20 - 29.99
    if (nilai >= 10) return 'Sangat Ekstrem'; // Mencakup 10 - 19.99
    return 'Tidak Memungkinkan'; // Untuk semua skor di bawah 10
};

const getComfortLevel = (nilai) => {
  // Kondisi Sangat Baik hingga Ideal (skor 80 ke atas)
  if (nilai >= 80) {
    return 'SANGAT NYAMAN';
  }
  // Kondisi Cukup Baik hingga Baik (skor 60 hingga 79.99)
  if (nilai >= 60) {
    return 'NYAMAN';
  }
  // Semua kondisi di bawah 60 dianggap tidak nyaman
  return 'TIDAK NYAMAN';
};

const hitungKorelasi = async (req, res) => {
  try {
  const fileHCI = req.files['hci']?.[0];
const fileKunjungan = req.files['kunjungan']?.[0];

    const namaFile = req.body.filename || 'hasil_korelasi';

    if (!fileHCI || !fileKunjungan) {
      return res.status(400).json({ message: 'File HCI dan kunjungan wajib diunggah.' });
    }

    const hciRaw = extractDataFromExcel(fileHCI.path);
    const kunjunganData = extractDataFromExcel(fileKunjungan.path);

    const hciMap = {};
    const kenyamananMap = {};

    hciRaw.forEach((row) => {
      const tgl = row['Tanggal'] || row['Tanggal HCI'];
      const bulan = new Date(tgl).toISOString().slice(0, 7);
      const nilai = parseFloat(row['Skor HCI']);
      if (!isNaN(nilai)) {
        if (!hciMap[bulan]) hciMap[bulan] = [];
        hciMap[bulan].push(nilai);
      }
    });

    Object.keys(hciMap).forEach((bulan) => {
      const avg = hciMap[bulan].reduce((a, b) => a + b, 0) / hciMap[bulan].length;
      hciMap[bulan] = avg;
      kenyamananMap[bulan] = {
        kategori: getKategoriHCI(avg),
        kenyamanan: getComfortLevel(avg),
      };
    });

    const dataGabunganFinal = [];
    let TP = 0, FP = 0, FN = 0, TN = 0;

    kunjunganData.forEach((row) => {
      const rawBulan = row['Bulan'];
      if (!rawBulan) return;

      const bulan = new Date(rawBulan).toISOString().slice(0, 7);
      if (!hciMap.hasOwnProperty(bulan)) return;

      const wisnus = parseInt(row['Wisnus']) || 0;
      const wisman = parseInt(row['Wisman']) || 0;
      const total = wisnus + wisman;
      const namaDestinasi = row['Destinasi'] || '-';
      const hci = hciMap[bulan];
      const status = kenyamananMap[bulan];

      const banyak = total > 100;
      const nyaman = ['SANGAT NYAMAN', 'NYAMAN'].includes(status.kenyamanan);

      if (nyaman && banyak) TP++;
      else if (nyaman && !banyak) FP++;
      else if (!nyaman && banyak) FN++;
      else TN++;

      dataGabunganFinal.push({
        Destinasi: namaDestinasi,
        Bulan: bulan,
        HCI: hci,
        Wisatawan: total,
        Kategori_HCI: status.kategori,
        Kenyamanan: status.kenyamanan,
        Status_Kunjungan: banyak ? 'TINGGI' : 'RENDAH',
      });
    });

    let pearson = 'Data kurang';
    let spearman = 'Data kurang';
    if (dataGabunganFinal.length >= 2) {
      const hciArray = dataGabunganFinal.map((d) => d.HCI);
      const kunjunganArray = dataGabunganFinal.map((d) => d.Wisatawan);
      pearson = ss.sampleCorrelation(hciArray, kunjunganArray).toFixed(4);
      spearman = spearmanCorrelation(hciArray, kunjunganArray).toFixed(4);
    }

    const accuracy = (TP + TN) / (TP + FP + FN + TN);
    const { precision, recall, f1 } = calculatePrecisionRecallF1(TP, FP, FN);

    const dataTerendah = dataGabunganFinal.reduce((min, curr) =>
      curr.Wisatawan < min.Wisatawan ? curr : min
    );

    const kesimpulan = `Jumlah wisatawan paling sedikit terjadi pada bulan ${dataTerendah.Bulan}, yaitu sebanyak ${dataTerendah.Wisatawan} pengunjung. Hal ini mungkin dipengaruhi oleh HCI bulan tersebut yang tergolong "${dataTerendah.Kategori_HCI}". Salah satu destinasi dengan kunjungan paling rendah saat itu adalah "${dataTerendah.Destinasi}".`;

    // === EXPORT EXCEL ===
    const workbook = new ExcelJS.Workbook();
    const sheetData = workbook.addWorksheet('Data Gabungan');
    const sheetKorelasi = workbook.addWorksheet('Korelasi');

    sheetData.columns = [
      { header: 'Destinasi', key: 'Destinasi', width: 25 },
      { header: 'Bulan', key: 'Bulan', width: 12 },
      { header: 'Wisatawan', key: 'Wisatawan', width: 15 },
      { header: 'HCI', key: 'HCI', width: 10 },
      { header: 'Kategori_HCI', key: 'Kategori_HCI', width: 20 },
      { header: 'Kenyamanan', key: 'Kenyamanan', width: 20 },
      { header: 'Status_Kunjungan', key: 'Status_Kunjungan', width: 18 },
    ];
    sheetData.addRows(dataGabunganFinal);
    sheetData.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3E5CB3' } };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    sheetKorelasi.addRow(['Metode', 'Nilai Korelasi']);
    sheetKorelasi.addRow(['Pearson', pearson]);
    sheetKorelasi.addRow(['Spearman', spearman]);
    sheetKorelasi.addRow(['Akurasi', accuracy.toFixed(4)]);
    sheetKorelasi.addRow(['Confusion Matrix']);
    sheetKorelasi.addRow(['TP', TP]);
    sheetKorelasi.addRow(['FP', FP]);
    sheetKorelasi.addRow(['FN', FN]);
    sheetKorelasi.addRow(['TN', TN]);
    sheetKorelasi.addRow([]);
    sheetKorelasi.addRow(['Precision', precision]);
    sheetKorelasi.addRow(['Recall', recall]);
    sheetKorelasi.addRow(['F1 Score', f1]);
    sheetKorelasi.addRow([]);
    sheetKorelasi.addRow(['Kesimpulan']);
    const kesimpulanRow = sheetKorelasi.addRow([kesimpulan]);
    kesimpulanRow.alignment = { wrapText: true };
    sheetKorelasi.columns.forEach(col => col.width = 100);

    const safeFilename = namaFile.replace(/[^a-z0-9_\-]/gi, '_');
    const outputPath = path.join(uploadDir, `${safeFilename}.xlsx`);
    await workbook.xlsx.writeFile(outputPath);

    res.download(outputPath, () => {
      fs.unlink(fileHCI.path, () => {});
      fs.unlink(fileKunjungan.path, () => {});
      fs.unlink(outputPath, () => {});
    });

  } catch (err) {
    console.error('❌ Gagal menghitung korelasi:', err);
    res.status(500).json({ message: 'Gagal menghitung korelasi' });
  }
};


const hitungKorelasiJSON = async (req, res) => {
  try {
    const fileHCI = req.files['hci']?.[0];
    const fileKunjungan = req.files['kunjungan']?.[0];

    if (!fileHCI || !fileKunjungan) {
      return res.status(400).json({ message: 'File HCI dan kunjungan wajib diunggah.' });
    }

    const hciRaw = extractDataFromExcel(fileHCI.path);
    const kunjunganData = extractDataFromExcel(fileKunjungan.path);

    const hciMap = {};
    const kenyamananMap = {};

    hciRaw.forEach((row) => {
      const tgl = row['Tanggal'] || row['Tanggal HCI'];
      const bulan = new Date(tgl).toISOString().slice(0, 7);
      const nilai = parseFloat(row['Skor HCI']);
      if (!isNaN(nilai)) {
        if (!hciMap[bulan]) hciMap[bulan] = [];
        hciMap[bulan].push(nilai);
      }
    });

    Object.keys(hciMap).forEach((bulan) => {
      const avg = hciMap[bulan].reduce((a, b) => a + b, 0) / hciMap[bulan].length;
      hciMap[bulan] = avg;
      kenyamananMap[bulan] = {
        kategori: getKategoriHCI(avg),
        kenyamanan: getComfortLevel(avg),
      };
    });

    const dataGabunganFinal = [];
    let TP = 0, FP = 0, FN = 0, TN = 0;

    kunjunganData.forEach((row) => {
      const rawBulan = row['Bulan'];
      if (!rawBulan) return;

      const bulan = new Date(rawBulan).toISOString().slice(0, 7);
      if (!hciMap.hasOwnProperty(bulan)) return;

      const wisnus = parseInt(row['Wisnus']) || 0;
      const wisman = parseInt(row['Wisman']) || 0;
      const total = wisnus + wisman;
      const namaDestinasi = row['Destinasi'] || '-';
      const hci = hciMap[bulan];
      const status = kenyamananMap[bulan];

      const banyak = total > 100;
      const nyaman = ['SANGAT NYAMAN', 'NYAMAN'].includes(status.kenyamanan);

      if (nyaman && banyak) TP++;
      else if (nyaman && !banyak) FP++;
      else if (!nyaman && banyak) FN++;
      else TN++;

      dataGabunganFinal.push({
        Destinasi: namaDestinasi,
        Bulan: bulan,
        HCI: hci,
        Wisatawan: total,
        Kategori_HCI: status.kategori,
        Kenyamanan: status.kenyamanan,
        Status_Kunjungan: banyak ? 'TINGGI' : 'RENDAH',
      });
    });

    let pearson = 'Data kurang';
    let spearman = 'Data kurang';
    if (dataGabunganFinal.length >= 2) {
      const hciArray = dataGabunganFinal.map((d) => d.HCI);
      const kunjunganArray = dataGabunganFinal.map((d) => d.Wisatawan);
      pearson = ss.sampleCorrelation(hciArray, kunjunganArray).toFixed(4);
      spearman = spearmanCorrelation(hciArray, kunjunganArray).toFixed(4);
    }

    const accuracy = (TP + TN) / (TP + FP + FN + TN);
    const { precision, recall, f1 } = calculatePrecisionRecallF1(TP, FP, FN);

    const dataTerendah = dataGabunganFinal.reduce((min, curr) =>
      curr.Wisatawan < min.Wisatawan ? curr : min
    );

    const kesimpulan = `Jumlah wisatawan paling sedikit terjadi pada bulan ${dataTerendah.Bulan}, yaitu sebanyak ${dataTerendah.Wisatawan} pengunjung. Hal ini mungkin dipengaruhi oleh HCI bulan tersebut yang tergolong "${dataTerendah.Kategori_HCI}". Salah satu destinasi dengan kunjungan paling rendah saat itu adalah "${dataTerendah.Destinasi}".`;

    // Hapus file sementara
    fs.unlink(fileHCI.path, () => {});
    fs.unlink(fileKunjungan.path, () => {});

    return res.status(200).json({
      status: 'success',
      pearson,
      spearman,
      accuracy: accuracy.toFixed(4),
      precision,
      recall,
      f1,
      confusionMatrix: { TP, FP, FN, TN },
      kesimpulan,
      dataGabunganFinal
    });
  } catch (err) {
    console.error('❌ Gagal menghitung korelasi:', err);
    res.status(500).json({ message: 'Gagal menghitung korelasi' });
  }
};



module.exports = {
  uploadEvaluasi: upload.fields([
    { name: 'hci', maxCount: 1 },
    { name: 'kunjungan', maxCount: 1 }
  ]),
  hitungKorelasi,
  hitungKorelasiJSON
};
