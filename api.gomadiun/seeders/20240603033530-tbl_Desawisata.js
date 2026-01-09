'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_DesaWisata', [
      {
        id_admin: 3,
        id_admin_verifed: 2,
        id_admin_author: 1,
        nama_desaWisata: 'Desa Wisata Kare',
        desk_desaWisata: "Desa Kare Kecamatan Kare Kabupaten Madiun Terletak paling tenggara Kabupaten Madiun. Merupakan Daerah berbatasan dengan Kabupaten Lain yaitu Ponorogo,Trenggalek, Tulungagung, Nganjuk dan Kediri. Merupakan Daerah Pegunungan Wilis yang terdiri dari berbagai bukit dan gunung. Banyak Potensi Wisata yang bersifat alam dan buatan. Untuk itu perlu kebersamaan dalam pengelolaan alam yang ada di Kare melalui berbagai bidang dan inovasi yang terus menerus untuk melestarikan wisata alam tersebut guna kesejahteraan masyarakat Desa Kare.",
        sampul_desaWisata: "http://localhost:3001/uploads/img/desawisata/DesaKare.png",
        kontak_person_desawisata: "0895359508913",
        total_pengunjung: 15,
        status_verifikasi: 'verified',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_admin: 4,
        id_admin_verifed: 2,
        id_admin_author: 1,
        nama_desaWisata: 'Desa Wisata Bodag',
        desk_desaWisata: "Desa Bodag Kecamatan Kare Kabupaten Madiun merupakan desa di lereng gunung wilis, wilayahnya berbatasan dengan hutan. Penduduknya bermata pencaharian bertani berkebun dan beternak Tingkat pendidikan yg masih rendah serta mkjp yg renda serta wilayah yg berada di pinggiran membuat dusun butuh desa bodag masuk sebagai kampun KB.",
        sampul_desaWisata: "http://localhost:3001/uploads/img/desawisata/DesaBodag.png",
        kontak_person_desawisata: "0895359508913",
        total_pengunjung: 10,
        status_verifikasi: 'verified',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_admin: 5,
        id_admin_verifed: 2,
        id_admin_author: 1,
        nama_desaWisata: 'Desa Wisata Brumbun',
        desk_desaWisata: "Desa wisata Brumbun terletak di lereng gunung wilis,tepatnya di kab.Madiun,Jawa timur,dekat dengan kota Madiun,hanya 20 menit saja,kegiatan tubing/kelen adalah kegiatan awal,kemudian sekarang berkembang untuk kegiatan wisata edukasi,kegiatan dikelola oleh Pokdarwis Taruna Utama Brumbun dan berdiri sejak tahun 2016. Desa Brumbun Kecamatan Wungu Kabupaten Madiun terdapat sebuah desa wisata yang bertemakan adventure. Apabila anda suka berpetualang, silahkan berkunjung di desa brumbun. Disini terdapat wahana tubing, body rafting, air terjun, bermain di sungai, rumah pohon dan arena outbond. Selain menawarkan wahana permainan, desa brumbun juga menawarkan wisata edukasi bagi pelajar dan keluarga, seperti membuat kerajinan janur, membuat jajan tradisional, menanam padi dan menangkapikan di kolam.",
        sampul_desaWisata: "http://localhost:3001/uploads/img/desawisata/DesaBrumbun.png",
        kontak_person_desawisata: "0895359508913",
        total_pengunjung: 7,
        status_verifikasi: 'verified',
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_DesaWisata', null, {});
  }
};
