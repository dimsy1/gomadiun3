'use strict';
const moment = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_Kuliner', [
      {
        id_desaWisata: 1,
        id_admin: 7,
        id_admin_verifed: 2,
        nama_kuliner: 'Sekar Wilis',
        nib_kuliner: null,
        kbli_kuliner: null,
        alamat_kuliner: 'Depan SGG mini market, Dusun gondosuli, Branjang, Kare, Kec. Kare, Kabupaten Madiun, Jawa Timur 63182',
        npwp_kuliner: null,
        npwp_pemilik_kuliner: null,
        maps_kuliner: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.390408635963!2d111.6972710748438!3d-7.748349392270437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79aff2833d7301%3A0xd66901fc900f0c3b!2sSekar%20Wilis%20Resto%20Kare!5e0!3m2!1sid!2sid!4v1717392554662!5m2!1sid!2sid',
        sampul_kuliner: 'http://localhost:3001/uploads/img/kuliner/SekarWilis.png',
        ruang_kuliner: '',
        kontak_person_kuliner: "082432432243",
        status_buka:'Buka',
        status_kuliner: 'Pribadi',
        status_verifikasi: 'verified',
        total_pengunjung_kuliner: 0,
        id_admin_author: 1,
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_desaWisata: 1,
        id_admin: 7,
        id_admin_verifed: 2,
        nama_kuliner: 'Luku Luku Cafe',
        nib_kuliner: null,
        kbli_kuliner: null,
        alamat_kuliner: 'Gondosuli, Kare, Kec. Kare, Kabupaten Madiun, Jawa Timur',
        npwp_kuliner: null,
        npwp_pemilik_kuliner: null,
        maps_kuliner: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d506073.62210825237!2d111.687106!3d-7.715285!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79b107f8fbd7bf%3A0xd0de916d1d23b605!2sLuku%20luku!5e0!3m2!1sid!2sid!4v1717394319971!5m2!1sid!2sid',
        sampul_kuliner: 'http://localhost:3001/uploads/img/kuliner/lukuLuku.png',
        ruang_kuliner: '',
        kontak_person_kuliner: "082432432243",
        status_buka:'Buka',
        status_kuliner: 'Pribadi',
        status_verifikasi: 'verified',
        total_pengunjung_kuliner: 0,
        id_admin_author: 1,
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_desaWisata: 1,
        id_admin: 7,
        id_admin_verifed: 2,
        nama_kuliner: 'Kopi Kare',
        nib_kuliner: null,
        kbli_kuliner: null,
        alamat_kuliner: 'Dusun suweru desa RT.27/RW.06 Sumberagung, Sumberagung, Kare, Madiun Regency, East Java 63182',
        npwp_kuliner: null,
        npwp_pemilik_kuliner: null,
        maps_kuliner: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d31627.681455435064!2d111.696046!3d-7.740914!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79af42ff836161%3A0x18ebbfcbaf13f879!2sKopi%20Kare%20Madiun!5e0!3m2!1sid!2sid!4v1717394415652!5m2!1sid!2sid',
        sampul_kuliner: 'http://localhost:3001/uploads/img/kuliner/KopiKare.png',
        ruang_kuliner: '',
        kontak_person_kuliner: "082432432242",
        status_buka:'Buka',
        status_kuliner: 'Pribadi',
        status_verifikasi: 'verified',
        total_pengunjung_kuliner: 0,
        id_admin_author: 1,
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
      {
        id_desaWisata: 1,
        id_admin: 7,
        id_admin_verifed: 2,
        nama_kuliner: 'Resto Amanah',
        nib_kuliner: null,
        kbli_kuliner: null,
        alamat_kuliner: 'Jl. Karas - Karangrejo, RT.05/RW.03, Karas, Kec. Karas, Kabupaten Magetan, Jawa Timur 63395',
        npwp_kuliner: null,
        npwp_pemilik_kuliner: null,
        maps_kuliner: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.0155118020098!2d111.38329707484195!3d-7.5732869924409405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79eb56d4a9257f%3A0x4663c58d4cc22432!2sAmanah%20Resto!5e0!3m2!1sid!2sid!4v1721112703649!5m2!1sid!2sid',
        sampul_kuliner: 'http://localhost:3001/uploads/img/kuliner/RestoAmanah.png',
        ruang_kuliner: '',
        kontak_person_kuliner: "082432432242",
        status_buka:'Buka',
        status_kuliner: 'Pribadi',
        status_verifikasi: 'verified',
        total_pengunjung_kuliner: 0,
        id_admin_author: 1,
        createdAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('tbl_Kuliner', null, {});
  }
};
