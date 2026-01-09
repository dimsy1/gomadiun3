const cron = require('node-cron');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { tbl_HCIHistory } = require('../models');

// Log saat file dimuat
console.log('✅ [hciCleanerScheduler] Cron job loaded');

// Fungsi pembersihan data HCI
const cleanOldHCI = async () => {
  const batasTanggal = moment().tz('Asia/Jakarta').subtract(2, 'days').format('YYYY-MM-DD');

  try {
    const deleted = await tbl_HCIHistory.destroy({
      where: {
        tanggal: {
          [Op.lt]: batasTanggal
        }
      }
    });

    console.log(`🧹 [Cron] Pembersihan HCI: ${deleted} data sebelum ${batasTanggal} dihapus`);
  } catch (err) {
    console.error('❌ [Cron] Gagal menghapus data HCI lama:', err.message);
  }
};

// Jadwalkan setiap hari jam 23:55 WIB
cron.schedule('55 23 * * *', () => {
  console.log('⏰ [Cron] Menjalankan pembersihan HCI...');
  cleanOldHCI();
}, {
  timezone: 'Asia/Jakarta'
});
