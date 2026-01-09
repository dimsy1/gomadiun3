const { tbl_Kecamatan, tbl_HCIHistory } = require('../models');
const axios = require('axios');
const moment = require('moment-timezone');
const { Op } = require('sequelize'); // Tambahkan ini untuk operasi tanggal
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer();


const getAllHCIHistory = async (req, res) => {
  try {
    const data = await tbl_HCIHistory.findAll({
      attributes: [
        'id_hci',
        'id_kecamatan',
        'tanggal',
        'temp',
        'clouds',
        'rain',
        'wind',
        'hci_score',
        'hci_kategori',
        'createdAt',
        'updatedAt'
      ],
      include: [
        {
          model: tbl_Kecamatan,
          as: 'kecamatan',
          attributes: [
            'id_kecamatan',
            'nama_kecamatan',
          ]
        }
      ],
      order: [
        ['tanggal', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    // Parsing geojson jika perlu
    const parsedData = data.map(item => {
      const hci = item.toJSON();
      if (hci.kecamatan && typeof hci.kecamatan.geojson === 'string') {
        hci.kecamatan.geojson = JSON.parse(hci.kecamatan.geojson);
      }
      return hci;
    });

    return res.status(200).json({
      status: "success",
      message: "Data riwayat HCI berhasil diambil",
      data: parsedData
    });
  } catch (error) {
    console.error("❌ Gagal mengambil data HCI:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data HCI",
      data: null
    });
  }
};


// OpenWeather Forecast 6 hari (3 jam sekali)
const getWeatherForecast = async (lat, lon) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error('❌ Gagal fetch forecast:', err);
    return null;
  }
};

const getSubIndexRating = ({ temp, rain, clouds, wind }) => {
  let TC, P, A, W;

if (temp <= -6) TC = 1;
    else if (temp <= -1) TC = 2;   // Catches (-5.99 to -1)
    else if (temp < 0) TC = 2;    // Catches (-0.99 to -0.01) - still in rating 2 range
    else if (temp <= 6) TC = 3;     // Catches (0 to 6)
    else if (temp <= 10) TC = 4;    // Catches (6.01 to 10)
    else if (temp <= 14) TC = 5;    // Catches (10.01 to 14)
    else if (temp <= 17) TC = 6;    // Catches (14.01 to 17)
    else if (temp <= 19) TC = 7;    // Catches (17.01 to 19)
    else if (temp < 20) TC = 7;   // Catches (19.01 to 19.99)
    else if (temp <= 22) TC = 9;    // Catches (20 to 22)
    else if (temp < 23) TC = 9;   // Catches (22.01 to 22.99)
    else if (temp <= 25) TC = 10;   // Catches (23 to 25)
    else if (temp <= 26) TC = 9;    // Catches (25.01 to 26)
    else if (temp <= 28) TC = 8;    // Catches (26.01 to 28)
    else if (temp <= 30) TC = 7;    // Catches (28.01 to 30)
    else if (temp <= 32) TC = 6;    // Catches (30.01 to 32)
    else if (temp <= 34) TC = 5;    // Catches (32.01 to 34)
    else if (temp <= 36) TC = 4;    // Catches (34.01 to 36)
    else if (temp < 37) TC = 4;   // Catches (36.01 to 36.99)
    else if (temp <= 39) TC = 2;    // Catches (37 to 39)
    else if (temp >= 39) TC = 0;    // Catches (>39) - Sesuai tabel >=39 adalah 0

  if (rain > 25) P = -1;
    else if (rain > 12) P = 0;
    else if (rain >= 9) P = 2;    
    else if (rain >= 6) P = 5;    
    else if (rain >= 3) P = 8;    
    else if (rain > 0) P = 9;     
    else if (rain === 0) P = 10;

    if (clouds > 99) A = 1;      // Catches (99.01 to 100)
    else if (clouds >= 91) A = 2;    // Catches (91 to 99)
    else if (clouds >= 81) A = 3;    // Catches (81 to 90.99)
    else if (clouds >= 71) A = 4;    // Catches (71 to 80.99)
    else if (clouds >= 61) A = 5;    // Catches (61 to 70.99)
    else if (clouds >= 51) A = 6;    // Catches (51 to 60.99)
    else if (clouds >= 41) A = 7;    // Catches (41 to 50.99)
    else if (clouds >= 31) A = 8;    // Catches (31 to 40.99)
    else if (clouds >= 21) A = 8;    // Catches (21 to 30.99)
    else if (clouds > 0) A = 10;     // Catches (1 to 20.99)
    else if (clouds === 0) A = 9;

     if (wind > 70) W = -10;
    else if (wind >= 50) W = 0;      // Catches (50 to 70)
    else if (wind >= 40) W = 3;      // Catches (40 to 49.99)
    else if (wind >= 30) W = 6;      // Catches (30 to 39.99)
    else if (wind >= 20) W = 8;      // Catches (20 to 29.99)
    else if (wind >= 10) W = 9;      // Catches (10 to 19.99)
    else if (wind >= 1) W = 10;      // Catches (1 to 9.99)
    else if (wind === 0) W = 8;
    else W = 10; // Untuk angin antara 0 dan 1, dianggap sangat tenang (rating 10)

  return { TC, P, A, W };
};

const getHCIStatus = (score) => {
  if (score >= 90 && score <= 100) return 'Ideal';
  if (score >= 80 && score <= 89) return 'Sangat Baik';
  if (score >= 70 && score <= 79) return 'Baik';
  if (score >= 60 && score <= 69) return 'Cukup Baik';
  if (score >= 50 && score <= 59) return 'Ditoleransi';
  if (score >= 40 && score <= 49) return 'Batas Kondisi Ditoleransi (Umum)';
  if (score >= 30 && score <= 39) return 'Tidak Baik';
  if (score >= 20 && score <= 29) return 'Sangat Tidak Baik';
  if (score >= 10 && score <= 19) return 'Sangat Ekstrem';
  if (score <= 9) return 'Tidak Memungkinkan';
  return 'Tidak Diketahui';
};


const calculateDailyHCI = (forecastData) => {
  const dailyGroups = {};

  forecastData.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyGroups[date]) dailyGroups[date] = [];
    dailyGroups[date].push(item);
  });

  return Object.entries(dailyGroups).slice(0, 6).map(([date, entries]) => {
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);

    const temps = entries.map(e => e.main.temp); // Sudah dalam °C
    const rain = entries.map(e => e.rain?.["3h"] || 0);  // mm total
    const clouds = entries.map(e => e.clouds.all); // %
    const wind = entries.map(e => e.wind.speed * 3.6); // m/s -> km/h

    const temp = avg(temps);
    const rainVal = sum(rain);
    const cloudVal = avg(clouds);
    const windVal = avg(wind);

    const sub = getSubIndexRating({
      temp,
      rain: rainVal,
      clouds: cloudVal,
      wind: windVal
    });

    const score = (4 * sub.TC) + (2 * sub.A) + (3 * sub.P) + sub.W;
    const kategori = getHCIStatus(score);

    return {
      date,
      temp: parseFloat(temp.toFixed(2)),
      rain: parseFloat(rainVal.toFixed(2)),
      clouds: parseFloat(cloudVal.toFixed(2)),
      wind: parseFloat(windVal.toFixed(2)),
      score: parseFloat(score.toFixed(2)),
      kategori
    };
  });
};

const calculateHCIForAllKecamatan = async (req, res) => {
  try {
    const kecamatans = await tbl_Kecamatan.findAll();

    for (const kecamatan of kecamatans) {
      const { latitude, longitude, id_kecamatan } = kecamatan;

      if (!latitude || !longitude) {
        console.warn(`⛔ Skip: ${kecamatan.nama_kecamatan} tidak memiliki koordinat`);
        continue;
      }

      const forecast = await getWeatherForecast(latitude, longitude);
      if (!forecast) continue;

      const dailyResults = calculateDailyHCI(forecast);

      for (const day of dailyResults) {
        await tbl_HCIHistory.upsert({
          id_kecamatan: id_kecamatan,
          tanggal: day.date,
          temp: day.temp,
          clouds: day.clouds,
          rain: day.rain,
          wind: day.wind,
          hci_score: day.score,
          hci_kategori: day.kategori,
        });
      }

      const todayData = dailyResults[0];
      await kecamatan.update({
        hci_score: todayData.score,
        hci_kategori: todayData.kategori,
        tanggal_perhitungan: moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
      });

      console.log(`✅ ${kecamatan.nama_kecamatan} selesai`);
    }

    await tbl_HCIHistory.destroy({
      where: {
        tanggal: {
          [Op.lt]: moment().subtract(7, 'days').format('YYYY-MM-DD')
        }
      }
    });

    console.log('🗑️ Data HCIHistory lebih dari 7 hari dihapus');
    return res.status(200).json({ message: 'Perhitungan HCI 5 hari berhasil' });
  } catch (error) {
    console.error('❌ Error HCI:', error);
    return res.status(500).json({ message: 'Gagal menghitung HCI' });
  }
};


const deleteHCIHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const hci = await tbl_HCIHistory.findByPk(id);
    if (!hci) {
      return res.status(404).json({
        status: "error",
        message: "Data HCI tidak ditemukan"
      });
    }

    await hci.destroy();

    return res.status(200).json({
      status: "success",
      message: "Data HCI berhasil dihapus"
    });
  } catch (error) {
    console.error("❌ Gagal menghapus data HCI:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server"
    });
  }
};

const exportHCIHistoryToExcel = async (req, res) => {
  try {
    const kecamatan = req.body.kecamatan?.trim();
    const tahun = req.body.tahun?.trim();
    const customFilename = req.body.filename?.trim();

    const data = await tbl_HCIHistory.findAll({
      include: [{
        model: tbl_Kecamatan,
        as: 'kecamatan',
        attributes: ['id_kecamatan', 'nama_kecamatan']
      }],
      attributes: ['id_hci', 'id_kecamatan', 'tanggal', 'temp', 'rain', 'clouds', 'wind', 'hci_score', 'hci_kategori', 'createdAt'],
      order: [['tanggal', 'DESC']]
    });

    // 🧹 Filter: data sesuai kecamatan/tahun (jika ada)
    const filteredData = data.filter(item => {
      const matchesKecamatan = !kecamatan || item.id_kecamatan?.toString() === kecamatan.toString();
      const matchesTahun = !tahun || moment(item.tanggal).format('YYYY') === tahun;
      return matchesKecamatan && matchesTahun;
    });

    // 🧠 Deduplicate: hanya satu data per (kecamatan, tanggal), ambil createdAt terbaru
    const map = new Map();
    for (const item of filteredData) {
      const key = `${item.id_kecamatan}-${moment(item.tanggal).format('YYYY-MM-DD')}`;
      if (!map.has(key) || new Date(item.createdAt) > new Date(map.get(key).createdAt)) {
        map.set(key, item);
      }
    }
    const uniqueData = Array.from(map.values());

    const workbook = new ExcelJS.Workbook();

    // === Sheet 1: Riwayat HCI Detail ===
    const worksheetDetail = workbook.addWorksheet('Riwayat HCI');
    worksheetDetail.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Kecamatan', key: 'nama_kecamatan', width: 25 },
      { header: 'Temperatur (°C)', key: 'temp', width: 18 },
      { header: 'Hujan (mm)', key: 'rain', width: 15 },
      { header: 'Awan (%)', key: 'clouds', width: 15 },
      { header: 'Angin (km/h)', key: 'wind', width: 18 },
      { header: 'Skor HCI', key: 'hci_score', width: 12 },
      { header: 'Kategori', key: 'hci_kategori', width: 25 },
      { header: 'Dihitung Pada', key: 'createdAt', width: 20 },
    ];

    uniqueData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)); // Urutkan tanggal desc
    uniqueData.forEach((item, index) => {
      worksheetDetail.addRow({
        no: index + 1,
        tanggal: moment(item.tanggal).format('YYYY-MM-DD'),
        nama_kecamatan: item.kecamatan?.nama_kecamatan || '',
        temp: item.temp,
        rain: item.rain,
        clouds: item.clouds,
        wind: item.wind,
        hci_score: item.hci_score,
        hci_kategori: item.hci_kategori,
        createdAt: moment(item.createdAt).format('YYYY-MM-DD HH:mm')
      });
    });

    worksheetDetail.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCE5FF' }
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // === Sheet 2: Rekap Bulanan ===
    const worksheetRekap = workbook.addWorksheet('Rekap Bulanan');
    worksheetRekap.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Bulan', key: 'bulan', width: 20 },
      { header: 'Rata-rata Skor HCI', key: 'avg_hci', width: 20 },
      { header: 'Kategori', key: 'kategori', width: 20 }
    ];

    // Group & hitung rata-rata per bulan
    const groupedByMonth = {};
    uniqueData.forEach(item => {
      const month = moment(item.tanggal).format('YYYY-MM');
      if (!groupedByMonth[month]) groupedByMonth[month] = [];
      groupedByMonth[month].push(item.hci_score);
    });

    const getKategori = (avg) => {
      if (avg >= 85) return 'Sangat Baik';
      if (avg >= 70) return 'Baik';
      if (avg >= 50) return 'Cukup Baik';
      if (avg >= 30) return 'Buruk';
      return 'Sangat Buruk';
    };

    const sortedMonths = Object.keys(groupedByMonth).sort();
    sortedMonths.forEach((month, idx) => {
      const scores = groupedByMonth[month];
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      const kategori = getKategori(average);

      worksheetRekap.addRow({
        no: idx + 1,
        bulan: month,
        avg_hci: parseFloat(average.toFixed(2)),
        kategori: kategori
      });
    });

    worksheetRekap.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDEBF7' }
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // === Simpan dan Kirim File ===
    const exportPath = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportPath)) fs.mkdirSync(exportPath);

    const filename = customFilename
      ? `${customFilename.replace(/[^a-zA-Z0-9-_]/g, '_')}.xlsx`
      : `ExportHCI_${Date.now()}.xlsx`;

    const filePath = path.join(exportPath, filename);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, filename, err => {
      if (err) {
        console.error('❌ Gagal kirim file:', err);
        res.status(500).send('Gagal mengirim file');
      }
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error("❌ Gagal export Excel:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal export data ke Excel"
    });
  }
};







module.exports = { 
  calculateHCIForAllKecamatan,
  getAllHCIHistory,
  deleteHCIHistory,
   exportHCIHistoryToExcel 
};
