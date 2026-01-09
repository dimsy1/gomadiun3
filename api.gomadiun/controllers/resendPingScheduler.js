// const cron = require('node-cron');
// const https = require('https');

// // Log saat file dimuat
// console.log('✅ [resendPingScheduler] Cron job loaded');

// // Fungsi untuk ping Resend API
// const pingResend = () => {
//   console.log('⏰ [Cron] Melakukan ping ke Resend API...');

//   const options = {
//     hostname: 'api.resend.com',
//     port: 443,
//     path: '/',
//     method: 'GET',
//     timeout: 5000 // tambahkan timeout untuk cegah gantung
//   };

//   const req = https.request(options, (res) => {
//     console.log('🔁 [Cron] Resend API responded with status:', res.statusCode);

//     // Buang data agar koneksi tertutup dengan benar
//     res.on('data', () => {}); // kosongkan buffer
//     res.on('end', () => {
//       if (res.statusCode === 200) {
//         console.log('✅ [Cron] Resend API berhasil diping!\n');
//       } else {
//         console.warn('⚠️ [Cron] Unexpected response from Resend:', res.statusCode);
//       }
//     });
//   });

//   req.on('error', (err) => {
//     console.error('❌ [Cron] Gagal ping ke Resend:', err.message);
//   });

//   req.on('timeout', () => {
//     console.error('⏱️ [Cron] Ping timeout - koneksi terlalu lama');
//     req.destroy();
//   });

//   req.end();
// };

// // Jalankan setiap 1 menit (ganti ke */5 untuk 5 menit)
// cron.schedule('*/5 * * * *', () => {
//   pingResend();
// }, {
//   timezone: 'Asia/Jakarta'
// });
