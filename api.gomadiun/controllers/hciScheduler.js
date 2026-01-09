const cron = require('node-cron');
const { calculateHCIForAllKecamatan } = require('./hciController');
const http = require('http');

// Jalankan setiap hari jam 04:00 WIB (misalnya setelah data cuaca stabil)
cron.schedule('0 4 * * *', async () => {
  console.log('⏰ Menjalankan perhitungan HCI otomatis...');
  
  // Simulasikan panggilan fungsi controller secara internal
  const fakeReq = {}; // kosong karena tidak dibutuhkan
  const fakeRes = {
    status: (code) => ({ json: (data) => console.log(`📡 Status ${code}:`, data) })
  };

  await calculateHCIForAllKecamatan(fakeReq, fakeRes);
}, {
  timezone: "Asia/Jakarta"
});

// */1 * * * *